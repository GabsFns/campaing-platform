import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { QueueEngine } from '../engines/queue.engine.js';

@Injectable()
export class CampaignQueueProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueEngine: QueueEngine,
  ) {}

  async process(campaignId: string) {
    const messages = await this.prisma.campaignMessage.findMany({
      where: {
        campaignId,
        status: 'PENDING',
      },

      select: {
        id: true,
      },
    });

    for (const message of messages) {
      await this.queueEngine.enqueueMessage(message.id);
    }

    await this.prisma.campaign.update({
      where: {
        id: campaignId,
      },

      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });
  }
}
