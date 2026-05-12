import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';

import { WorkspaceService } from './workspace.service.js';
import { UpdateWorkspaceDto } from './dto/create-workspace.dto.js';

import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';

import type { JwtPayload } from '../auth/types/jwt-payload.js';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  @Get('me')
  findMe(@CurrentUser() user: JwtPayload) {
    return this.service.findById(user.workspaceId);
  }

  @Patch('me')
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateWorkspaceDto) {
    return this.service.update(user.workspaceId, dto);
  }
}
