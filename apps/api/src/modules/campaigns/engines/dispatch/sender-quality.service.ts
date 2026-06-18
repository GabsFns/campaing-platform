import { Injectable } from '@nestjs/common';

import { WeightedSender } from './sender-weight.service.js';

@Injectable()
export class SenderQualityEngine {
  applyQualityWeight(senders: WeightedSender[]): WeightedSender[] {
    return senders.map((sender) => ({
      ...sender,

      score: sender.score * this.getQualityWeight(sender.qualityScore),
    }));
  }

  private getQualityWeight(quality: number | null | undefined): number {
    if (quality === null || quality === undefined) {
      return 1;
    }

    if (quality >= 80) {
      return 2;
    }

    if (quality >= 50) {
      return 1;
    }

    return 0.2;
  }
}
