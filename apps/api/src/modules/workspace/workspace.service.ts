import { Injectable } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository.js';
import { CreateWorkspaceDto } from './create-workspace.dto.js';

@Injectable()
export class WorkspaceService {
  constructor(private readonly repository: WorkspaceRepository) {}

  create(dto: CreateWorkspaceDto) {
    return this.repository.create(dto);
  }

  findAll() {
    return this.repository.findAll();
  }
}
