import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SellersService } from './sellers.service.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { CreateSellerDto } from './dto/create-seller.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellerService: SellersService) {}

  @Post('sync')
  sync(@CurrentUser() user: JwtPayload) {
    return this.sellerService.sync(user.workspaceId);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.sellerService.findAll(user.workspaceId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSellerDto) {
    return this.sellerService.create(user.workspaceId, dto);
  }
}
