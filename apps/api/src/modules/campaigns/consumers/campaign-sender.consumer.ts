import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MessageSenderService } from '../services/message-sender.service.js';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';

@Processor('campaign-send', {
  concurrency: 200,
})
@Injectable()
export class CampaignSendConsumer extends WorkerHost {
  constructor(private readonly messageSender: MessageSenderService) {
    super();
  }

  async process(
    job: Job<{
      messageId: string;
    }>,
  ) {
    await this.messageSender.send(job.data.messageId);
  }
}
