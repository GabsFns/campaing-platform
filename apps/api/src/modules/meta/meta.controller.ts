import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { MetaService } from './meta.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import type { Response } from 'express';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('connect')
  connect(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const url = this.metaService.getConnectUrl(user.workspaceId);
    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') workspaceId: string,
  ) {
    return this.metaService.handleCallback(code, workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('connection')
  getConnection(@CurrentUser() user: JwtPayload) {
    return this.metaService.findConnection(user.workspaceId);
  }
}
