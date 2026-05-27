import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class QueueEngine {
  constructor(
    @InjectQueue('campaign-messages')
    private readonly queue: Queue,
  ) {}

  async enqueueMessage(messageId: string) {
    await this.queue.add(
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
}
