import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../prisma/prisma.service.js';
import { RedisService } from '../../../redis/redis.service.js';

export interface CachedSender {
  id: string;

  workspaceId: string;

  status: string;

  qualityScore: number | null;

  throughputLimit: number;

  messagingTier: string | null;
}

@Injectable()
export class SenderCacheService {
  private readonly logger = new Logger(SenderCacheService.name);

  private readonly TTL_SECONDS = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Busca todos os senders ativos
   *
   * Redis First
   * Database Fallback
   */
  async getAvailableSenders(workspaceId: string): Promise<CachedSender[]> {
    const redis = this.redisService.getClient();

    const cacheKey = `senders:${workspaceId}`;

    const cached = await redis.get(cacheKey);

    if (typeof cached === 'string') {
      return JSON.parse(cached) as CachedSender[];
    }

    const senders = await this.prisma.senderNumber.findMany({
      where: {
        workspaceId,

        status: 'CONNECTED',
      },

      select: {
        id: true,

        workspaceId: true,

        status: true,

        qualityScore: true,

        throughputLimit: true,

        messagingTier: true,
      },
    });

    const normalized: CachedSender[] = senders.map((sender) => ({
      id: sender.id,

      workspaceId: sender.workspaceId,

      status: sender.status,

      qualityScore: sender.qualityScore,

      throughputLimit: Number(sender.throughputLimit ?? 80),

      messagingTier: sender.messagingTier,
    }));

    await redis.set(
      cacheKey,
      JSON.stringify(normalized),
      'EX',
      this.TTL_SECONDS,
    );

    return normalized;
  }

  /**
   * Invalida cache
   */
  async invalidate(workspaceId: string) {
    const redis = this.redisService.getClient();

    await redis.del(`senders:${workspaceId}`);
  }

  /**
   * Atualiza cache manualmente
   */
  async refresh(workspaceId: string) {
    await this.invalidate(workspaceId);

    return this.getAvailableSenders(workspaceId);
  }
}
