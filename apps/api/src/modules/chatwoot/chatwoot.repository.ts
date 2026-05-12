import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ChatwootRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertConnection(data: {
    workspaceId: string;
    baseUrl: string;
    apiToken: string;
    accountId: number;
  }) {
    return this.prisma.chatwootConnection.upsert({
      where: {
        workspaceId: data.workspaceId,
      },
      update: {
        baseUrl: data.baseUrl,
        apiToken: data.apiToken,
        accountId: data.accountId,
      },
      create: data,
    });
  }

  findByWorkspace(workspaceId: string) {
    return this.prisma.chatwootConnection.findUnique({
      where: {
        workspaceId,
      },
    });
  }
}
