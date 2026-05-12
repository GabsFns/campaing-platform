import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class MetaRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertConnection(data: {
    workspaceId: string;
    accessToken: string;
    businessId: string;
    wabaId: string;
    phoneNumberId: string;
    phoneNumber?: string;
    displayName?: string;
  }) {
    return this.prisma.metaConnection.upsert({
      where: { workspaceId: data.workspaceId },
      update: {
        accessToken: data.accessToken,
        businessId: data.businessId,
        wabaId: data.wabaId,
        phoneNumberId: data.phoneNumberId,
        phoneNumber: data.phoneNumber,
        displayName: data.displayName,
      },
      create: data,
    });
  }

  findByWorkspace(workspaceId: string) {
    return this.prisma.metaConnection.findUnique({
      where: { workspaceId },
    });
  }
}
