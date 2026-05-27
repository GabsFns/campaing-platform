import { Injectable } from '@nestjs/common';

import Redis from 'ioredis';

const RedisConstructor = Redis as unknown as typeof import('ioredis');

@Injectable()
export class RedisService {
  private readonly redis: any;

  constructor() {
    this.redis = new (RedisConstructor as any)({
      host: 'localhost',
      port: 6379,
    });
  }

  getClient() {
    return this.redis;
  }
}
