import { Module } from '@nestjs/common';
import { SenderService } from './sender.service.js';
import { SenderController } from './sender.controller.js';

@Module({
  providers: [SenderService],
  controllers: [SenderController],
})
export class SenderModule {}
