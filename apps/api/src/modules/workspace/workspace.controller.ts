import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateWorkspaceDto } from './create-workspace.dto.js';
import { WorkspaceService } from './workspace.service.js';
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  @Post()
  create(@Body() dto: CreateWorkspaceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
