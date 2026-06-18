import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CampaignCompleteEngine } from '../engines/campaign-complete.engine.js';

@Processor('campaign-completions', { concurrency: 5 })
@Injectable()
export class CampaignCompletionConsumer extends WorkerHost {
  private readonly logger = new Logger(CampaignCompletionConsumer.name);

  constructor(private readonly campaignCompleteEngine: CampaignCompleteEngine) {
    super();
  }

  async process(job: Job<{ campaignId: string }>) {
    const { campaignId } = job.data;

    const completed = await this.campaignCompleteEngine.tryComplete(campaignId);

    if (completed) {
      this.logger.log(`[COMPLETION_SUCCESS] campaignId=${campaignId}`);
    }
  }
}
