import { Injectable } from '@nestjs/common';

import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class RateLimitEngine {
  constructor(private readonly redisService: RedisService) {}

  private readonly maxTokens = 20;

  private readonly refillInterval = 1000;

  async consume(key: string): Promise<void> {
    const redis = this.redisService.getClient();

    const redisKey = `rate-limit:${key}`;

    while (true) {
      const result = (await redis.eval(
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

            redis.call(
              "SET",
              KEYS[1],
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

          return {0, retryAfter}
        `,
        1,
        redisKey,
        this.maxTokens,
        this.refillInterval,
        Date.now(),
      )) as [number, number];

      const [allowed, retryAfter] = result;

      /**
       * TOKEN CONSUMIDO
       */
      if (allowed === 1) {
        return;
      }

      /**
       * ESPERA INTELIGENTE
       */
      await this.sleep(retryAfter);
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
