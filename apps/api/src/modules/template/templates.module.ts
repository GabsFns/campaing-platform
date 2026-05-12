import { Module } from '@nestjs/common';
import { TemplateService } from './templates.service.js';
import { TemplateRepository } from './templates.repository.js';
import { TemplateController } from './templates.controller.js';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, TemplateRepository],
})
export class TemplatesModule {}
