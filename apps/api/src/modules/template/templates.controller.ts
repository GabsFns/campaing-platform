import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemplateService } from './templates.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly service: TemplateService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTemplateDto) {
    return this.service.create(user.workspaceId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.findAll(user.workspaceId, Number(page), Number(limit));
  }

  @Post('sync')
  sync(@CurrentUser() user: JwtPayload) {
    return this.service.syncTemplates(user.workspaceId);
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.findById(id, user.workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.service.update(id, user.workspaceId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.delete(id, user.workspaceId);
  }
}
