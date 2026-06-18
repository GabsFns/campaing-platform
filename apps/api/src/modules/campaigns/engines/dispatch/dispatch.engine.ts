import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma/prisma.service.js';

import { SenderCacheService } from './sender-cache.service.js';
import { SenderWeightEngine } from './sender-weight.service.js';
import { SenderTierEngine } from './sender-tier.service.js';
import { SenderQualityEngine } from './sender-quality.service.js';
import { SenderSelectionEngine } from './sender-selection.service.js';
import { SendQueueService } from './send-queue.service.js';
import { SenderBalancerEngine } from './sender-balance.service.js';

@Injectable()
export class DispatchEngine {
  constructor(
    private readonly prisma: PrismaService,

    private readonly senderCache: SenderCacheService,

    private readonly senderWeight: SenderWeightEngine,

    private readonly senderTier: SenderTierEngine,

    private readonly senderQuality: SenderQualityEngine,

    private readonly senderSelection: SenderSelectionEngine,

    private readonly senderBalancer: SenderBalancerEngine,

    private readonly sendQueue: SendQueueService,
  ) {}

  async dispatchBatch(generationKey: string) {
    const PAGE_SIZE = 5000;
    let cursor: string | undefined;

    while (true) {
      const messages = await this.prisma.campaignMessage.findMany({
        take: PAGE_SIZE,

        ...(cursor && {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }),
        where: {
          generationKey,
          status: {
            in: ['QUEUED', 'RETRYING'],
          },
        },
        orderBy: {
          id: 'asc',
        },

        select: {
          id: true,
          workspaceId: true,
        },
      });

      if (!messages.length) {
        break;
      }

      cursor = messages[messages.length - 1].id;

      const workspaceId = messages[0].workspaceId;

      const senders = await this.senderCache.getAvailableSenders(workspaceId);

      if (!senders.length) {
        throw new Error(`No senders available for workspace ${workspaceId}`);
      }

      let weighted = this.senderWeight.calculateBaseWeights(senders);

      weighted = this.senderTier.applyTierWeight(weighted);

      weighted = this.senderQuality.applyQualityWeight(weighted);

      const allocations = this.senderBalancer.allocate(
        workspaceId,
        messages.length,
        weighted,
      );

      const assignments = this.senderSelection.assign(messages, allocations);

      const grouped = new Map<string, string[]>();

      for (const assignment of assignments) {
        const ids = grouped.get(assignment.senderId) ?? [];

        ids.push(assignment.messageId);

        grouped.set(assignment.senderId, ids);
      }
      await Promise.all(
        [...grouped.entries()].map(([senderId, ids]) =>
          this.prisma.campaignMessage.updateMany({
            where: {
              id: {
                in: ids,
              },
            },

            data: {
              senderNumberId: senderId,
            },
          }),
        ),
      );

      await this.sendQueue.enqueueBulk(
        assignments.map((assignment) => ({
          messageId: assignment.messageId,
        })),
      );
    }
  }
}
