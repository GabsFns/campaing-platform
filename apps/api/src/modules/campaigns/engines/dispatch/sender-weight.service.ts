import { Injectable } from '@nestjs/common';

import { CachedSender } from './sender-cache.service.js';

export interface WeightedSender extends CachedSender {
  score: number;
}

@Injectable()
export class SenderWeightEngine {
  calculateBaseWeights(senders: CachedSender[]): WeightedSender[] {
    return senders.map((sender) => ({
      ...sender,

      score: Math.max(Number(sender.throughputLimit ?? 1), 1),
    }));
  }
}
