import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { QueueEngine } from '../engines/queue.engine.js';

@Injectable()
export class CampaignQueueProcessor {
  private readonly logger = new Logger(CampaignQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,

    private readonly queueEngine: QueueEngine,
  ) {}

  /**
   * ENQUEUE BATCH
   *
   * Responsável por:
   *
   * - distributed lock
   * - evitar duplicate enqueue
   * - lifecycle control
   * - observability
   */
  async enqueueBatch(batchId: string) {
    /**
     * LOCK ATÔMICO
     *
     * Apenas UM worker consegue:
     *
     * PENDING -> QUEUED
     */
    const lock = await this.prisma.campaignBatch.updateMany({
      where: {
        id: batchId,

        status: 'PENDING',
      },

      data: {
        status: 'QUEUED',

        queuedAt: new Date(),
      },
    });

    /**
     * JÁ ENFILEIRADO
     */
    if (lock.count === 0) {
      this.logger.warn(`[BATCH_ALREADY_QUEUED] batchId=${batchId}`);

      return;
    }

    /**
     * ENQUEUE
     */
    await this.queueEngine.enqueueBatch(batchId);

    this.logger.log(`[BATCH_ENQUEUED] batchId=${batchId}`);
  }
}
