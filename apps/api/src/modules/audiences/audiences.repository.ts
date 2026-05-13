import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class AudienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AudienceCreateInput) {
    return this.prisma.audience.create({ data });
  }

  findAll(workspaceId: string) {
    return this.prisma.audience.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  upsertContact(data: {
    workspaceId: string;
    phoneRaw: string;
    phoneNormalized: string;
    name: string | null;
    email: string | null;
  }) {
    return this.prisma.contact.upsert({
      where: {
        workspaceId_phoneNormalized: {
          workspaceId: data.workspaceId,
          phoneNormalized: data.phoneNormalized,
        },
      },
      update: {
        name: data.name,
        email: data.email,
        phoneRaw: data.phoneRaw,
      },
      create: {
        workspaceId: data.workspaceId,
        phoneRaw: data.phoneRaw,
        phoneNormalized: data.phoneNormalized,
        name: data.name,
        email: data.email,
      },
    });
  }

  findSellerByEmail(workspaceId: string, email: string) {
    return this.prisma.seller.findFirst({
      where: {
        workspaceId,
        email,
      },
    });
  }

  async linkContactToAudience(data: {
    audienceId: string;
    contactId: string;
    sellerId?: string | null;
  }) {
    return this.prisma.audienceContact.upsert({
      where: {
        audienceId_contactId: {
          audienceId: data.audienceId,
          contactId: data.contactId,
        },
      },
      update: {
        sellerId: data.sellerId ?? null,
      },
      create: {
        audienceId: data.audienceId,
        contactId: data.contactId,
        sellerId: data.sellerId ?? null,
      },
    });
  }

  countAudienceContacts(audienceId: string) {
    return this.prisma.audienceContact.count({
      where: { audienceId },
    });
  }

  findContacts(audienceId: string, workspaceId: string) {
    return this.prisma.audienceContact.findMany({
      where: {
        audienceId,
        audience: {
          workspaceId,
        },
      },
      include: {
        contact: true,
        seller: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  updateTotalContacts(audienceId: string, totalContacts: number) {
    return this.prisma.audience.update({
      where: { id: audienceId },
      data: { totalContacts },
    });
  }
}
