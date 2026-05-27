import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class CampaignCompleteEngine {
  constructor(private readonly prisma: PrismaService) {}

  async checkCompletion(campaignId: string) {
    /**
     * BUSCA CAMPANHA
     */
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return;
    }

    /**
     * CAMPANHA JÁ FINALIZADA
     */
    if (campaign.status === 'FINISHED') {
      return;
    }

    /**
     * VERIFICA SE AINDA EXISTEM
     * MESSAGES PENDENTES
     */
    const pendingMessages = await this.prisma.campaignMessage.count({
      where: {
        campaignId,

        status: {
          in: ['PENDING', 'PROCESSING', 'RETRYING'],
        },
      },
    });

    /**
     * AINDA PROCESSANDO
     */
    if (pendingMessages > 0) {
      return;
    }

    /**
     * CALCULA MÉTRICAS
     */
    const [sentCount, failedCount] = await Promise.all([
      this.prisma.campaignMessage.count({
        where: {
          campaignId,
          status: 'SENT',
        },
      }),

      this.prisma.campaignMessage.count({
        where: {
          campaignId,
          status: 'FAILED',
        },
      }),
    ]);

    /**
     * FINALIZA CAMPANHA
     */
    await this.prisma.campaign.update({
      where: {
        id: campaignId,
      },

      data: {
        status: 'FINISHED',

        finishedAt: new Date(),

        successCount: sentCount,

        failedCount,
      },
    });

    console.log(`CAMPANHA FINALIZADA: ${campaignId}`);
  }
}
