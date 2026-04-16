import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findAllByWorkspace(workspaceId: string) {
    return await this.prisma.user.findMany({
      where: { workspaceId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string, workspaceId: string) {
    return await this.prisma.user.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.UserUpdateInput) {
    return await this.prisma.user.updateMany({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async delete(id: string, workspaceId: string) {
    return await this.prisma.user.deleteMany({
      where: {
        id,
        workspaceId,
      },
    });
  }
}
