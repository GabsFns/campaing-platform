import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CampaignCreateInput) {
    return this.prisma.campaign.create({
      data,
      include: {
        audience: true,
        template: true,
        senderNumber: true,
      },
    });
  }

  findAll(workspaceId: string) {
    return this.prisma.campaign.findMany({
      where: {
        workspaceId,
      },
      include: {
        audience: true,
        template: true,
        senderNumber: true,
        stats: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string, workspaceId: string) {
    return this.prisma.campaign.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        audience: true,
        template: true,
        senderNumber: true,
        stats: true,
      },
    });
  }

  createStats(campaignId: string) {
    return this.prisma.campaignStats.create({
      data: {
        campaignId,
      },
    });
  }

  async findAudienceContactsBatch(params: {
    audienceId: string;
    cursor?: string;
    take: number;
  }) {
    const { audienceId, cursor, take } = params;

    return this.prisma.audienceContact.findMany({
      where: {
        audienceId,
      },

      include: {
        contact: true,
        seller: true,
      },

      take,

      ...(cursor && {
        skip: 1,

        cursor: {
          id: cursor,
        },
      }),

      orderBy: {
        id: 'asc',
      },
    });
  }

  async findAudienceContactsRange(params: {
    audienceId: string;
    startSequence: bigint;
    endSequence: bigint;
  }) {
    const { audienceId, startSequence, endSequence } = params;

    return this.prisma.audienceContact.findMany({
      where: {
        audienceId,

        sequence: {
          gte: startSequence,
          lte: endSequence,
        },
      },

      include: {
        contact: true,

        seller: true,
      },

      orderBy: {
        sequence: 'asc',
      },
    });
  }
  async getAudienceRange(audienceId: string) {
    const [first, last] = await Promise.all([
      this.prisma.audienceContact.findFirst({
        where: {
          audienceId,
        },

        select: {
          sequence: true,
        },

        orderBy: {
          sequence: 'asc',
        },
      }),

      this.prisma.audienceContact.findFirst({
        where: {
          audienceId,
        },

        select: {
          sequence: true,
        },

        orderBy: {
          sequence: 'desc',
        },
      }),
    ]);

    return {
      startSequence: first?.sequence ?? null,
      endSequence: last?.sequence ?? null,
    };
  }

  createCampaignMessages(data: Prisma.CampaignMessageCreateManyInput[]) {
    return this.prisma.campaignMessage.createMany({
      data,
      skipDuplicates: true,
    });
  }
  updateStatus(campaignId: string, status: CampaignStatus) {
    return this.prisma.campaign.update({
      where: {
        id: campaignId,
      },

      data: {
        status,

        ...(status === 'RUNNING' && {
          startedAt: new Date(),
        }),

        ...(status === 'FINISHED' && {
          finishedAt: new Date(),
        }),
      },
    });
  }
}
