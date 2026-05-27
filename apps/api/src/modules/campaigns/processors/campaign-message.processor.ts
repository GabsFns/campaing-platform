import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { BatchEngine } from '../engines/batch.engine.js';
import { CampaignQueueProcessor } from './campaign-Queue.processor.js';

@Injectable()
export class CampaignMessageProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly batchEngine: BatchEngine,
    private readonly campaignQueueProcessor: CampaignQueueProcessor,
  ) {}

  async process(campaignId: string) {
    const messages = await this.prisma.campaignMessage.findMany({
      where: {
        campaignId,
        status: 'PENDING',
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    if (messages.length === 0) {
      return;
    }

    /**
     * CRIA BATCHES EM MEMÓRIA
     */
    const batches = this.batchEngine.createBatches(messages, 100);

    /**
     * TRANSACTION
     */
    await this.prisma.$transaction(async (tx) => {
      for (const [index, batchMessages] of batches.entries()) {
        /**
         * CRIA BATCH
         */
        const batch = await tx.campaignBatch.create({
          data: {
            campaignId,

            batchIndex: index + 1,

            size: batchMessages.length,

            status: 'PENDING',
          },
        });

        /**
         * VINCULA MESSAGES AO BATCH
         */
        await tx.campaignMessage.updateMany({
          where: {
            id: {
              in: batchMessages.map((message) => message.id),
            },
          },

          data: {
            batchId: batch.id,
          },
        });
      }

      /**
       * UPDATE STATUS CAMPANHA
       */
      await tx.campaign.update({
        where: {
          id: campaignId,
        },

        data: {
          status: 'PROCESSING',
        },
      });
    });

    /**
     * REDIS / BULLMQ
     * FORA DA TRANSACTION
     */
    await this.campaignQueueProcessor.process(campaignId);
  }
}
