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

  findAudienceContacts(audienceId: string) {
    return this.prisma.audienceContact.findMany({
      where: {
        audienceId,
      },

      include: {
        contact: true,
        seller: true,
      },
    });
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
