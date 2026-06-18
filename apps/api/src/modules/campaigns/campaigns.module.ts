import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { BullModule } from '@nestjs/bullmq';
import { CampaignBatchConsumer } from './consumers/campaign-batch.consumer.js';
import { CampaignConsumer } from './consumers/campaign-message-batch.consumer.js';
import { CampaignDeadLetterConsumer } from './consumers/campaign-dead-letter.consumer.js';
import { CampaignRepository } from './campaigns.repository.js';
import { CampaignMessageProcessor } from './processors/campaign-message.processor.js';
import { CampaignQueueProcessor } from './processors/campaign-Queue.processor.js';
import { RateLimitEngine } from './engines/rate-limit.engine.js';
import { QueueEngine } from './engines/queue.engine.js';
import { ErrorClassifierEngine } from './engines/error-classifier.engine.js';
import { DispatchEngine } from './engines/dispatch/dispatch.engine.js';
import { BatchEngine } from './engines/batch.engine.js';
import { MessageSenderService } from './services/message-sender.service.js';
@Module({
  providers: [
    CampaignsService,
    CampaignBatchConsumer,
    CampaignConsumer,
    CampaignDeadLetterConsumer,
    CampaignRepository,
    CampaignMessageProcessor,
    CampaignQueueProcessor,
    RateLimitEngine,
    QueueEngine,
    ErrorClassifierEngine,
    DispatchEngine,
    BatchEngine,
    MessageSenderService,
  ],
  controllers: [CampaignsController],
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),

    BullModule.registerQueue(
      {
        name: 'campaign-messages',
      },
      {
        name: 'campaign-dead-letter',
      },
      {
        name: 'campaign-batches',
      },
      {
        name: 'campaign-message-batches',
      },
    ),
  ],
})
export class CampaignsModule {}
