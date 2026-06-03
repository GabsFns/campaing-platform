import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class QueueEngine {
  constructor(
    /**
     * FILA DE BATCHES
     */
    @InjectQueue('campaign-batches')
    private readonly batchQueue: Queue,

    /**
     * FILA DE MESSAGES
     */
    @InjectQueue('campaign-messages')
    private readonly messageQueue: Queue,

    @InjectQueue('message-batches')
    private readonly messageBatchQueue: Queue,
  ) {}

  /**
   * ENQUEUE BATCH
   */
  async enqueueBatch(batchId: string) {
    await this.batchQueue.add(
      'process-batch',

      {
        batchId,
      },

      {
        jobId: batchId,

        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: 1000,

        removeOnFail: 5000,
      },
    );
  }

  /**
   * ENQUEUE MESSAGE
   */
  async enqueueMessage(messageId: string) {
    await this.messageQueue.add(
      'send-message',

      {
        messageId,
      },

      {
        jobId: messageId,

        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: 1000,

        removeOnFail: 5000,
      },
    );
  }

  async enqueueMessageBatch(data: { batchId: string; generationKey: string }) {
    await this.messageBatchQueue.add(
      'process-message-batch',
      {
        data,
      },
      {
        jobId: `${data.batchId}:${data.generationKey}`,

        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: 1000,

        removeOnFail: 5000,
      },
    );
  }
}
