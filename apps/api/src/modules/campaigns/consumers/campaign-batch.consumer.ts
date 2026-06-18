import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { randomUUID } from 'crypto';
import { BatchStatus, MessageStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service.js';
import { QueueEngine } from '../engines/queue.engine.js';
import { CampaignRepository } from '../campaigns.repository.js';
import { VariableResolverService } from '../../variable-resolver/variable-resolver.service.js';

@Processor('campaign-batches', {
  concurrency: 10,
})
@Injectable()
export class CampaignBatchConsumer extends WorkerHost {
  private readonly logger = new Logger(CampaignBatchConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueEngine: QueueEngine,
    private readonly variableResolver: VariableResolverService,
    private readonly campaignRepository: CampaignRepository,
  ) {
    super();
  }

  async process(job: Job<{ batchId: string }>) {
    const { batchId } = job.data;
    const lockToken = randomUUID();

    const lock = await this.prisma.campaignBatch.updateMany({
      where: {
        id: batchId,
        status: {
          in: ['PENDING', 'QUEUED', 'FAILED'],
        },
      },
      data: {
        status: BatchStatus.RUNNING,
        startedAt: new Date(),
        lockedAt: new Date(),
        lastHeartbeatAt: new Date(),
        lockToken,

        retryCount: {
          increment: 1,
        },
      },
    });

    if (lock.count === 0) {
      return;
    }

    try {
      const batch = await this.prisma.campaignBatch.findUnique({
        where: {
          id: batchId,
        },

        include: {
          campaign: {
            include: {
              template: true,
            },
          },
        },
      });

      if (!batch) {
        return;
      }

      if (batch.startSequence === null || batch.endSequence === null) {
        throw new Error(`Batch ${batch.id} sem range configurado`);
      }

      const contacts = await this.campaignRepository.findAudienceContactsRange({
        audienceId: batch.campaign.audienceId,
        startSequence: batch.startSequence,
        endSequence: batch.endSequence,
      });

      if (contacts.length === 0) {
        await this.prisma.campaignBatch.update({
          where: {
            id: batch.id,
          },
          data: {
            status: BatchStatus.FAILED,
            error: 'No contacts found',
            finishedAt: new Date(),
            lockToken: null,
            lockedAt: null,
            lastHeartbeatAt: null,
          },
        });
        return;
      }

      const generationKey = randomUUID();
      const queuedAt = new Date();
      const messages: Prisma.CampaignMessageCreateManyInput[] = contacts.map(
        (item) => {
          const finalMessage = this.variableResolver.resolve(
            batch.campaign.template.body,
            {
              contact: item.contact,
              seller: item.seller ?? undefined,
            },
          );

          const providerPayload = {
            text: finalMessage,
          } as Prisma.InputJsonValue;

          return {
            generationKey,
            campaignId: batch.campaign.id,
            batchId: batch.id,
            workspaceId: batch.campaign.workspaceId,
            contactId: item.contact.id,
            sellerId: item.sellerId ?? null,
            senderNumberId: null,
            phoneNormalized: item.contact.phoneNormalized,
            status: MessageStatus.QUEUED,
            queuedAt,
            providerPayload,
          };
        },
      );

      await this.prisma.campaignMessage.createMany({
        data: messages,
        skipDuplicates: true,
      });

      await this.queueEngine.enqueueMessageBatch({
        batchId: batch.id,
        generationKey,
      });

      await this.queueEngine.enqueueCampaignCompletion({
        campaignId: batch.campaign.id,
        delay: 5000,
      });

      await this.prisma.campaignBatch.update({
        where: {
          id: batch.id,
        },
        data: {
          status: BatchStatus.FINISHED,
          processedCount: contacts.length,
          successCount: contacts.length,
          finishedAt: new Date(),
          lockToken: null,
          lockedAt: null,
          lastHeartbeatAt: null,
        },
      });

      this.logger.log(
        `[BATCH_FINISHED] batch=${batch.id} contacts=${contacts.length}`,
      );
    } catch (error) {
      await this.prisma.campaignBatch.updateMany({
        where: {
          id: batchId,
          lockToken,
        },
        data: {
          status: BatchStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          lockToken: null,
          lockedAt: null,
          lastHeartbeatAt: null,
        },
      });

      throw error;
    }
  }
}
