import { Module } from '@nestjs/common';
import { ChatwootModule } from '../chatwoot/chatwoot.module.js';
import { SellersController } from './sellers.controller.js';
import { SellersService } from './sellers.service.js';
import { SellersRepository } from './sellers.repository.js';

@Module({
  imports: [ChatwootModule],

  controllers: [SellersController],

  providers: [SellersService, SellersRepository],

  exports: [SellersService],
})
export class SellersModule {}
