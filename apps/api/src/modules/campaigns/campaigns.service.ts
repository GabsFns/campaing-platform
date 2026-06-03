import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BatchStatus } from '@prisma/client';

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
    /**
     * AUDIENCE
     */
    const audience = await this.prisma.audience.findFirst({
      where: {
        id: dto.audienceId,
        workspaceId,
      },
    });

    if (!audience) {
      throw new NotFoundException('Audience not found');
    }

    /**
     * TEMPLATE
     */
    const template = await this.prisma.template.findFirst({
      where: {
        id: dto.templateId,
        workspaceId,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    /**
     * SENDER
     */
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

    /**
     * CREATE CAMPAIGN
     */
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

    /**
     * CREATE STATS
     */
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
   *
   * PROTEÇÕES:
   * - race condition
   * - duplicate execution
   * - duplicate messages
   * - multi-instance safe
   * - kubernetes safe
   */
  async start(workspaceId: string, campaignId: string) {
    const lock = await this.prisma.campaign.updateMany({
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

    if (lock.count === 0) {
      throw new BadRequestException(
        'Campaign already started or invalid status',
      );
    }

    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        workspaceId,
      },

      select: {
        id: true,
        audienceId: true,
        totalContacts: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const range = await this.campaignRepository.getAudienceRange(
      campaign.audienceId,
    );

    if (range.startSequence === null || range.endSequence === null) {
      await this.prisma.campaign.update({
        where: {
          id: campaign.id,
        },

        data: {
          status: 'FAILED',
        },
      });

      throw new BadRequestException('Audience has no contacts');
    }

    const batchSize = 1000n;

    const batches = [];

    let batchIndex = 0;

    for (
      let current = range.startSequence;
      current <= range.endSequence;
      current += batchSize
    ) {
      const startSequence = current;

      const endSequence =
        current + batchSize - 1n > range.endSequence
          ? range.endSequence
          : current + batchSize - 1n;
      const size = Number(endSequence - startSequence) + 1;

      batches.push({
        campaignId: campaign.id,

        batchIndex,

        size,

        status: BatchStatus.PENDING,

        startSequence,

        endSequence,
      });

      batchIndex++;
    }

    await this.prisma.campaignBatch.createMany({
      data: batches as any,
    });

    await this.prisma.campaign.update({
      where: {
        id: campaign.id,
      },

      data: {
        generationCompletedAt: new Date(),
      },
    });

    await this.campaignMessageProcessor.process(campaign.id);

    return {
      success: true,

      campaignId: campaign.id,

      totalBatches: batches.length,

      totalContacts: campaign.totalContacts ?? 0,
    };
  }
}
