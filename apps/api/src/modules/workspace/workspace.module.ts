import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service.js';
import { WorkspaceController } from './workspace.controller.js';
import { WorkspaceRepository } from './workspace.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Module({
  providers: [WorkspaceService, WorkspaceRepository, PrismaService],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
