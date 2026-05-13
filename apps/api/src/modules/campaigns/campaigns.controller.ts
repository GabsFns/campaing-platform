import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CampaignsService } from './campaigns.service.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';

import type { JwtPayload } from '../auth/types/jwt-payload.js';

import { CreateCampaignDto } from './dto/create-campaign.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.workspaceId, user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.campaignsService.findAll(user.workspaceId);
  }

  @Get(':id')
  findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.campaignsService.findById(id, user.workspaceId);
  }

  @Post(':id/start')
  start(@CurrentUser() user: JwtPayload, @Param('id') campaignId: string) {
    return this.campaignsService.start(user.workspaceId, campaignId);
  }
}
