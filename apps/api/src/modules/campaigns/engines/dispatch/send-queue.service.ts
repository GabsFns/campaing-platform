import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class SendQueueService {
  constructor(
    @InjectQueue('campaign-send')
    private readonly sendQueue: Queue,
  ) {}

  async enqueue(messageId: string) {
    await this.sendQueue.add(
      'send-message',
      {
        messageId,
      },
      {
        attempts: 5,

        backoff: {
          type: 'exponential',
          delay: 2000,
        },

        removeOnComplete: 1000,

        removeOnFail: 5000,
      },
    );
  }

  async enqueueBulk(
    jobs: {
      messageId: string;
    }[],
  ) {
    if (!jobs.length) {
      return;
    }

    await this.sendQueue.addBulk(
      jobs.map((job) => ({
        name: 'send-message',

        data: {
          messageId: job.messageId,
        },

        opts: {
          attempts: 5,

          backoff: {
            type: 'exponential',
            delay: 2000,
          },

          removeOnComplete: 1000,

          removeOnFail: 5000,
        },
      })),
    );
  }
}
