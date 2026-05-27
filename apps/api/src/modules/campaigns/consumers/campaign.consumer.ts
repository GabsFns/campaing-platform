import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';

import { Job, Queue } from 'bullmq';

import { MessageSenderService } from '../services/message-sender.service.js';

@Processor('campaign-messages', { concurrency: 20 })
export class CampaignConsumer extends WorkerHost {
  constructor(
    private readonly messageSender: MessageSenderService,

    @InjectQueue('campaign-dead-letter')
    private readonly deadLetterQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ messageId: string }>) {
    try {
      const { messageId } = job.data;

      console.log('PROCESSANDO MESSAGE:', messageId);

      await this.messageSender.send(messageId);
    } catch (error) {
      /**
       * TODAS TENTATIVAS ESGOTADAS
       */
      if (job.attemptsMade >= 2) {
        await this.deadLetterQueue.add('dead-message', {
          messageId: job.data.messageId,

          error: error instanceof Error ? error.message : 'Unknown error',

          failedAt: new Date(),
        });
      }

      throw error;
    }
  }
}
