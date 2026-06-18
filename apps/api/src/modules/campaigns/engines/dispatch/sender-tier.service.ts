import { Injectable } from '@nestjs/common';

import { WeightedSender } from './sender-weight.service.js';

@Injectable()
export class SenderTierEngine {
  applyTierWeight(senders: WeightedSender[]): WeightedSender[] {
    return senders.map((sender) => ({
      ...sender,

      score: sender.score * this.getTierWeight(sender.messagingTier),
    }));
  }

  private getTierWeight(tier: string | null | undefined): number {
    switch (tier) {
      case 'TIER_4':
        return 8;

      case 'TIER_3':
        return 4;

      case 'TIER_2':
        return 2;

      case 'TIER_1':
      default:
        return 1;
    }
  }
}
