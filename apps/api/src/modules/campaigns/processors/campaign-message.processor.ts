import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { CampaignQueueProcessor } from './campaign-Queue.processor.js';

@Injectable()
export class CampaignMessageProcessor {
  constructor(
    private readonly prisma: PrismaService,

    private readonly campaignQueueProcessor: CampaignQueueProcessor,
  ) {}

  /**
   * PROCESSA CAMPANHA
   *
   * Responsável apenas por:
   *
   * - buscar batches pendentes
   * - enviar batches para fila
   */
  async process(campaignId: string) {
    /**
     * BUSCA BATCHES
     */
    const batches = await this.prisma.campaignBatch.findMany({
      where: {
        campaignId,

        status: 'PENDING',
      },

      orderBy: {
        batchIndex: 'asc',
      },

      select: {
        id: true,
      },
    });

    /**
     * SEM BATCHES
     */
    if (batches.length === 0) {
      return;
    }

    /**
     * ENQUEUE DOS BATCHES
     */
    for (const batch of batches) {
      await this.campaignQueueProcessor.enqueueBatch(batch.id);
    }

    /**
     * UPDATE STATUS CAMPANHA
     */
    await this.prisma.campaign.update({
      where: {
        id: campaignId,
      },

      data: {
        status: 'RUNNING',
      },
    });
  }
}
