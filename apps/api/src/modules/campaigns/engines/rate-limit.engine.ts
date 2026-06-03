import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class RateLimitEngine {
  constructor(private readonly redisService: RedisService) {}

  /**
   * =========================
   * 1. LOCK DISTRIBUÍDO (FIFO / concorrência)
   * =========================
   *
   * Evita múltiplos workers processando o mesmo recurso
   */
  async acquireLock(key: string, ttlMs = 5000): Promise<boolean> {
    const redis = this.redisService.getClient();

    const lockKey = `lock:${key}`;

    const result = await redis.set(lockKey, '1', 'PX', ttlMs, 'NX');

    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    const redis = this.redisService.getClient();

    await redis.del(`lock:${key}`);
  }

  /**
   * =========================
   * 2. THROUGHPUT GLOBAL (GENÉRICO)
   * =========================
   */
  async acquireRateLimit(
    key: string,
    maxTokens: number,
    refillIntervalMs: number,
  ): Promise<void> {
    const redis = this.redisService.getClient();

    const redisKey = `rate-limit:${key}`;

    while (true) {
      const [allowed, retryAfter] = (await redis.eval(
        `
        local bucket = redis.call("GET", KEYS[1])

        local maxTokens = tonumber(ARGV[1])
        local refillInterval = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local tokens = maxTokens
        local lastRefill = now

        if bucket then
          local data = cjson.decode(bucket)
          tokens = data.tokens
          lastRefill = data.lastRefill
        end

        local elapsed = now - lastRefill

        if elapsed >= refillInterval then
          tokens = maxTokens
          lastRefill = now
        end

        if tokens > 0 then
          tokens = tokens - 1

          redis.call("SET", KEYS[1],
            cjson.encode({
              tokens = tokens,
              lastRefill = lastRefill
            }),
            "PX",
            60000
          )

          return {1, 0}
        end

        local retryAfter = refillInterval - elapsed
        if retryAfter < 1 then retryAfter = 1 end

        return {0, retryAfter}
        `,
        1,
        redisKey,
        maxTokens,
        refillIntervalMs,
        Date.now(),
      )) as [number, number];

      if (allowed === 1) return;

      await this.sleep(retryAfter);
    }
  }

  /**
   * =========================
   * 3. META THROUGHPUT (SENDER NUMBER)
   * =========================
   *
   * ISSO É O QUE VOCÊ USA NO WHATSAPP
   * (80 mps, 1000 mps etc)
   */
  async acquireSenderNumberThroughput(
    senderNumberId: string,
    throughputLimit: number,
  ): Promise<void> {
    return this.acquireRateLimit(
      `sender-number:${senderNumberId}`,
      throughputLimit,
      1000, // 1 segundo janela (Meta mps = per second)
    );
  }

  /**
   * =========================
   * UTIL
   * =========================
   */
  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
