import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';
import { randomUUID } from 'crypto';

@Injectable()
export class CampaignCompleteEngine {
  private readonly logger = new Logger(CampaignCompleteEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Tenta adquirir lock distribuído e completar campanha
   * Multi-instance safe: apenas 1 instance executa por campanha
   */
  async tryComplete(campaignId: string): Promise<boolean> {
    const lockKey = `campaign-completion-lock:${campaignId}`;
    const lockValue = randomUUID();
    const lockTtlMs = 30000; // 30 segundos

    // Tenta adquirir lock
    const acquired = await this.redis.set(
      lockKey,
      lockValue,
      'PX',
      lockTtlMs,
      'NX',
    );

    if (acquired !== 'OK') {
      // Outro worker está processando
      return false;
    }

    try {
      return await this.executeCompletion(campaignId);
    } finally {
      // Libera lock se ainda for nosso
      const current = await this.redis.get(lockKey);
      if (current === lockValue) {
        await this.redis.del(lockKey);
      }
    }
  }

  private async executeCompletion(campaignId: string): Promise<boolean> {
    // Busca campanha
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, status: true },
    });

    if (!campaign) {
      return false;
    }

    // Já finalizada
    if (campaign.status === 'FINISHED') {
      return false;
    }

    // Count pendentes
    const pendingMessages = await this.prisma.campaignMessage.count({
      where: {
        campaignId,
        status: { in: ['QUEUED', 'PENDING', 'PROCESSING', 'RETRYING'] },
      },
    });

    // Ainda processando
    if (pendingMessages > 0) {
      return false;
    }

    // Calcula métricas
    const [sentCount, failedCount] = await Promise.all([
      this.prisma.campaignMessage.count({
        where: { campaignId, status: 'SENT' },
      }),
      this.prisma.campaignMessage.count({
        where: { campaignId, status: 'FAILED' },
      }),
    ]);

    // Finaliza
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'FINISHED',
        finishedAt: new Date(),
        successCount: sentCount,
        failedCount,
      },
    });

    this.logger.log(
      `[CAMPAIGN_FINISHED] campaignId=${campaignId} sent=${sentCount} failed=${failedCount}`,
    );

    return true;
  }
}
