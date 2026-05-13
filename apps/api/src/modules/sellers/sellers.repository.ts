import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class SellersRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(data: {
    workspaceId: string;
    name: string;
    email?: string | null;
    chatwootAgentId: number;
    chatwootAccountId: number;
    availabilityStatus?: string | null;
    role?: string | null;
  }) {
    return this.prisma.seller.upsert({
      where: {
        workspaceId_chatwootAgentId: {
          workspaceId: data.workspaceId,
          chatwootAgentId: data.chatwootAgentId,
        },
      },
      update: {
        name: data.name,
        email: data.email,
        availabilityStatus: data.availabilityStatus,
        role: data.role,
      },
      create: data,
    });
  }

  findAll(workspaceId: string) {
    return this.prisma.seller.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  create(data: Prisma.SellerCreateInput) {
    return this.prisma.seller.create({
      data,
    });
  }
}
