import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class TemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TemplateCreateInput) {
    return this.prisma.template.create({ data });
  }

  findAll(workspaceId: string, page: number, limit: number) {
    return this.prisma.template.findMany({
      where: { workspaceId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(workspaceId: string) {
    return this.prisma.template.count({
      where: { workspaceId },
    });
  }

  findById(id: string, workspaceId: string) {
    return this.prisma.template.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  update(id: string, workspaceId: string, data: any) {
    return this.prisma.template.updateMany({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  delete(id: string, workspaceId: string) {
    return this.prisma.template.deleteMany({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async upsert(data: Prisma.TemplateUpsertArgs) {
    return this.prisma.template.upsert(data);
  }
}
