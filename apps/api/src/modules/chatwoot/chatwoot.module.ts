import { Module } from '@nestjs/common';
import { ChatwootService } from './chatwoot.service.js';
import { ChatwootController } from './chatwoot.controller.js';

@Module({
  providers: [ChatwootService],
  controllers: [ChatwootController],
})
export class ChatwootModule {}
