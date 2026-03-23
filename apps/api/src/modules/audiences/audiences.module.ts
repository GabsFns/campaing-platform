import { Module } from '@nestjs/common';
import { AudiencesService } from './audiences.service.js';
import { AudiencesController } from './audiences.controller.js';

@Module({
  providers: [AudiencesService],
  controllers: [AudiencesController],
})
export class AudiencesModule {}
