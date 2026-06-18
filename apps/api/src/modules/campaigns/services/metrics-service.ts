import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class CampaignMetricsService {
  private readonly logger = new Logger(CampaignMetricsService.name);

  constructor(private readonly redisService: RedisService) {}

  async recordMessage(
    campaignId: string,
    status: 'SENT' | 'FAILED',
    durationMs: number,
    errorType?: string,
  ) {
    const now = Date.now();
    const timestamp = Math.floor(now / 1000);

    // Incrementar counter
    await this.redisService.incr(`metrics:${campaignId}:${status}`);

    // Registrar duração (sorted set pra percentis)
    await this.redisService.zadd(
      `metrics:${campaignId}:processing-times`,
      timestamp,
      durationMs,
    );

    // Registrar erro
    if (errorType) {
      await this.redisService.incr(`metrics:${campaignId}:errors:${errorType}`);
    }

    // Manter últimas 1000 amostras apenas
    const range = await this.redisService.zcard(
      `metrics:${campaignId}:processing-times`,
    );
    if (range > 1000) {
      await this.redisService.zremrangebyrank(
        `metrics:${campaignId}:processing-times`,
        0,
        -1001,
      );
    }
  }

  async getMetrics(campaignId: string) {
    const [sent, failed, times, errors] = await Promise.all([
      this.redisService.get(`metrics:${campaignId}:SENT`),
      this.redisService.get(`metrics:${campaignId}:FAILED`),
      this.redisService.zrange(`metrics:${campaignId}:processing-times`, 0, -1),
      this.redisService.hgetall(`metrics:${campaignId}:errors`),
    ]);

    const sentCount = parseInt(sent ?? '0');
    const failedCount = parseInt(failed ?? '0');
    const totalCount = sentCount + failedCount;

    const timesNum = times.map(Number);
    const sorted = timesNum.sort((a, b) => a - b);

    const p50 = this.percentile(sorted, 50);
    const p95 = this.percentile(sorted, 95);
    const p99 = this.percentile(sorted, 99);

    const throughput =
      timesNum.length > 0
        ? Math.round(
            (timesNum.length / (sorted[timesNum.length - 1] || 1)) * 1000,
          )
        : 0;

    return {
      progress: {
        sent: sentCount,
        failed: failedCount,
        total: totalCount,
        failureRate:
          totalCount > 0
            ? ((failedCount / totalCount) * 100).toFixed(2) + '%'
            : '0%',
      },
      performance: {
        processingTime: {
          p50,
          p95,
          p99,
          avg:
            sorted.length > 0
              ? Math.round(sorted.reduce((a, b) => a + b) / sorted.length)
              : 0,
        },
        throughput: `${throughput} msgs/sec`,
      },
      errors,
    };
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((sorted.length * p) / 100) - 1;
    return sorted[Math.max(0, index)] || 0;
  }
}
