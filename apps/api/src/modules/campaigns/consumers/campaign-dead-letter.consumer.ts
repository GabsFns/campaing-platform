import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { PrismaService } from '../../../prisma/prisma.service.js';

@Processor('campaign-dead-letter')
export class CampaignDeadLetterConsumer extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    console.error('DLQ MESSAGE:', job.data);

    const { messageId, error } = job.data as {
      messageId: string;
      error: string;
    };

    /**
     * SALVA DEAD LETTER
     */
    await this.prisma.deadLetterMessage.create({
      data: {
        campaignMessageId: messageId,

        payload: job.data,

        error,

        queueName: job.queueName,

        jobName: job.name,

        failedAt: new Date(),
      },
    });

    /**
     * MARCA MESSAGE COMO FAILED
     */
    await this.prisma.campaignMessage.update({
      where: {
        id: messageId,
      },

      data: {
        status: 'FAILED',

        error,
      },
    });
  }
}
