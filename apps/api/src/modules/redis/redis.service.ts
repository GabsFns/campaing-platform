import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    // Passa a configuração para o construtor do ioredis via super()
    super({
      host: 'localhost',
      port: 6379,
    });
  }

  onModuleDestroy() {
    this.disconnect();
  }

  getClient() {
    return this;
  }
}
