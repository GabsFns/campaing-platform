import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { RedisService } from '../../redis/redis.service.js';

export interface CachedSenderNumber {
  id: string;
  number: string;
  status: string;
  throughputLimit: number;
  qualityScore: number;
}

@Injectable()
export class SenderNumberCacheService {
  private readonly ttlSeconds = 3600; // 1 hora

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async get(
    senderNumberId: string,
    workspaceId: string,
  ): Promise<CachedSenderNumber | null> {
    const cacheKey = `sender:${workspaceId}:${senderNumberId}`;

    const redis = this.redisService.getClient();

    const cached: string | null = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as CachedSenderNumber;
    }

    const sender = await this.prisma.senderNumber.findUnique({
      where: {
        id: senderNumberId,
      },
      select: {
        id: true,
        number: true,
        status: true,
        throughputLimit: true,
        qualityScore: true,
      },
    });

    if (sender) {
      await redis.setex(cacheKey, this.ttlSeconds, JSON.stringify(sender));
    }

    return sender;
  }

  async invalidate(senderNumberId: string, workspaceId: string) {
    const cacheKey = `sender:${workspaceId}:${senderNumberId}`;

    const redis = this.redisService.getClient();

    await redis.del(cacheKey);
  }
}
