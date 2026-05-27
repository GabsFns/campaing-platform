import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CampaignRepository } from './campaigns.repository.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';

import { PrismaService } from '../../prisma/prisma.service.js';
import { VariableResolverService } from '../variable-resolver/variable-resolver.service.js';
import { CampaignMessageProcessor } from './processors/campaign-message.processor.js';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly prisma: PrismaService,
    private readonly variableResolver: VariableResolverService,
    private readonly campaignMessageProcessor: CampaignMessageProcessor,
  ) {}

  /**
   * CREATE CAMPAIGN
   */
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

  /**
   * FIND ALL
   */
  async findAll(workspaceId: string) {
    return this.campaignRepository.findAll(workspaceId);
  }

  /**
   * FIND BY ID
   */
  async findById(id: string, workspaceId: string) {
    const campaign = await this.campaignRepository.findById(id, workspaceId);

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  /**
   * START CAMPAIGN
   */
  async start(workspaceId: string, campaignId: string) {
    /**
     * BUSCA CAMPANHA
     */
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        workspaceId,
      },

      include: {
        template: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    /**
     * EVITA DUPLICIDADE
     */
    const updatedCampaign = await this.prisma.campaign.updateMany({
      where: {
        id: campaignId,
        workspaceId,

        status: {
          in: ['DRAFT', 'SCHEDULED'],
        },
      },

      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    if (updatedCampaign.count === 0) {
      throw new BadRequestException(
        'Campaign already started or invalid status',
      );
    }

    /**
     * BUSCA CONTACTS
     */
    const audienceContacts = await this.campaignRepository.findAudienceContacts(
      campaign.audienceId,
    );

    if (audienceContacts.length === 0) {
      throw new BadRequestException('Audience has no contacts');
    }

    /**
     * MONTA MESSAGES
     */
    const messages = audienceContacts.map((item) => {
      const finalMessage = this.variableResolver.resolve(
        campaign.template.body,
        {
          contact: item.contact,
          seller: item.seller ?? undefined,
        },
      );

      return {
        campaignId: campaign.id,

        workspaceId,

        contactId: item.contact.id,

        sellerId: item.sellerId ?? null,

        phoneNormalized: item.contact.phoneNormalized,

        senderNumberId: campaign.senderNumberId ?? null,

        status: 'PENDING' as const,

        providerPayload: {
          text: finalMessage,
        },
      };
    });

    /**
     * TRANSACTION
     *
     * → cria messages
     * → garante atomicidade
     * → evita campanha parcial
     */
    await this.prisma.$transaction(async (tx) => {
      /**
       * CREATE MANY MESSAGES
       */
      await tx.campaignMessage.createMany({
        data: messages,
      });

      /**
       * UPDATE CAMPAIGN
       */
      await tx.campaign.update({
        where: {
          id: campaign.id,
        },

        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
        },
      });
    });

    /**
     * PROCESSAMENTO ASSÍNCRONO
     *
     * → batches
     * → queue
     * → bullmq
     * → redis
     *
     * FORA DA TRANSACTION
     */
    await this.campaignMessageProcessor.process(campaign.id);

    return {
      success: true,
      totalMessages: messages.length,
    };
  }
}
