import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkspaceRepository } from './workspace.repository.js';
import { UpdateWorkspaceDto } from './dto/create-workspace.dto.js';

@Injectable()
export class WorkspaceService {
  constructor(private readonly repository: WorkspaceRepository) {}

  async findById(id: string) {
    const workspace = await this.repository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    return this.repository.update(id, dto);
  }
}
