import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CampaignRepository } from './campaigns.repository.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly prisma: PrismaService,
  ) {}
  // Funcao de criacao de campanha
  async create(workspaceId: string, userId: string, dto: CreateCampaignDto) {
    const audience = await this.prisma.audience.findFirst({
      where: {
        id: dto.audienceId,
        workspaceId,
      },
    });
    if (!audience) {
      throw new NotFoundException('Audience not found');
    }

    const template = await this.prisma.template.findFirst({
      where: {
        id: dto.templateId,
        workspaceId,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (dto.senderNumberId) {
      const sender = await this.prisma.senderNumber.findFirst({
        where: {
          id: dto.senderNumberId,
          workspaceId,
        },
      });

      if (!sender) {
        throw new NotFoundException('Sender number not found');
      }
    }

    const campaign = await this.campaignRepository.create({
      name: dto.name,

      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,

      status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',

      totalContacts: audience.totalContacts ?? 0,

      workspace: {
        connect: {
          id: workspaceId,
        },
      },

      user: {
        connect: {
          id: userId,
        },
      },

      template: {
        connect: {
          id: dto.templateId,
        },
      },

      audience: {
        connect: {
          id: dto.audienceId,
        },
      },

      ...(dto.senderNumberId && {
        senderNumber: {
          connect: {
            id: dto.senderNumberId,
          },
        },
      }),
    });

    await this.campaignRepository.createStats(campaign.id);

    return campaign;
  }

  async findAll(workspaceId: string) {
    return this.campaignRepository.findAll(workspaceId);
  }

  async findById(id: string, workspaceId: string) {
    const campaign = await this.campaignRepository.findById(id, workspaceId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async start(workspaceId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        workspaceId,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === 'RUNNING' || campaign.status === 'FINISHED') {
      throw new BadRequestException('Campaign already processed');
    }

    const audienceContacts = await this.campaignRepository.findAudienceContacts(
      campaign.audienceId,
    );

    if (audienceContacts.length === 0) {
      throw new BadRequestException('Audience has no contacts');
    }

    const messages = audienceContacts.map((item) => ({
      campaignId: campaign.id,

      workspaceId,

      contactId: item.contact.id,

      sellerId: item.sellerId ?? null,

      phoneNormalized: item.contact.phoneNormalized,

      senderNumberId: campaign.senderNumberId ?? null,

      status: 'PENDING' as const,
    }));

    await this.campaignRepository.createCampaignMessages(messages);

    await this.campaignRepository.updateStatus(campaign.id, 'RUNNING');

    return {
      success: true,
      totalMessages: messages.length,
    };
  }
}
