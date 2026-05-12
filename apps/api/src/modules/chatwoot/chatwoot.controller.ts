import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChatwootService } from './chatwoot.service.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { CreateChatwootConnectionDto } from './dto/create-chatwoot-connect.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('chatwoot')
export class ChatwootController {
  constructor(private readonly service: ChatwootService) {}

  @Post('connect')
  connect(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateChatwootConnectionDto,
  ) {
    return this.service.connect(user.workspaceId, dto);
  }

  @Get('connection')
  getConnection(@CurrentUser() user: JwtPayload) {
    return this.service.findConnection(user.workspaceId);
  }
}
