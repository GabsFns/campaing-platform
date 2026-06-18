import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

import { DispatchEngine } from '../engines/dispatch/dispatch.engine.js';

@Processor('campaign-message-batches', {
  concurrency: 20,
})
@Injectable()
export class CampaignConsumer extends WorkerHost {
  private readonly logger = new Logger(CampaignConsumer.name);

  constructor(private readonly dispatchEngine: DispatchEngine) {
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

    await this.dispatchEngine.dispatchBatch(generationKey);

    this.logger.log(`[MESSAGE_BATCH_DISPATCHED] batch=${batchId}`);
  }
}
