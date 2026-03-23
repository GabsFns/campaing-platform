/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkspaceCreateInput) {
    return await this.prisma.workspace.create({ data });
  }

  async findAll() {
    return await this.prisma.workspace.findMany();
  }
}