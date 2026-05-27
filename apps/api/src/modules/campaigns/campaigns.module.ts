import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service.js';
import { CampaignsController } from './campaigns.controller.js';
import { BullModule } from '@nestjs/bullmq';
@Module({
  providers: [CampaignsService],
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
    ),
  ],
})
export class CampaignsModule {}
