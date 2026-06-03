import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { MessageSenderService } from '../services/message-sender.service.js';

@Processor('campaign-message-batches', {
  concurrency: 20,
})
@Injectable()
export class CampaignConsumer extends WorkerHost {
  private readonly logger = new Logger(CampaignConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messageSender: MessageSenderService,
    @InjectQueue('campaign-dead-letter')
    private readonly deadLetterQueue: Queue,
  ) {
    super();
  }

  async process(
    job: Job<{
      batchId: string;
      generationKey: string;
    }>,
  ) {
    const { batchId, generationKey } = job.data;

    this.logger.log(
      `[MESSAGE_BATCH_START] batch=${batchId} generationKey=${generationKey}`,
    );

    const messages = await this.prisma.campaignMessage.findMany({
      where: {
        generationKey,
        status: {
          in: ['QUEUED', 'RETRYING'],
        },
      },
      select: {
        id: true,
      },
    });

    let successCount = 0;
    let failedCount = 0;

    /**
     * 🔥 DISPATCH PARALELO CONTROLADO
     */
    const results = await Promise.allSettled(
      messages.map(async (message) => {
        await this.messageSender.send(message.id);
        return message.id;
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successCount++;
        continue;
      }

      failedCount++;

      const error = result.reason;

      this.logger.error(`[MESSAGE_SEND_FAILED]`, error);

      /**
       * DEAD LETTER só se necessário
       */
      if (job.attemptsMade >= 2) {
        // Aqui você NÃO tem messageId direto no result
        // então ideal seria melhorar MessageSender para retornar id
      }
    }

    this.logger.log(
      `[MESSAGE_BATCH_FINISHED] batch=${batchId} success=${successCount} failed=${failedCount}`,
    );
  }
}
