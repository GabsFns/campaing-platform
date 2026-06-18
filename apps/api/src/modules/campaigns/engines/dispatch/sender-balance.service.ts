import { Injectable } from '@nestjs/common';

import { WeightedSender } from './sender-weight.service.js';
import { SenderRoundRobin } from './sender-round-robin.service.js';

export interface SenderAllocation {
  senderId: string;

  quantity: number;
}

@Injectable()
export class SenderBalancerEngine {
  constructor(private readonly roundRobin: SenderRoundRobin) {}

  allocate(
    workspaceId: string,
    totalMessages: number,
    senders: WeightedSender[],
  ): SenderAllocation[] {
    if (!senders.length) {
      return [];
    }

    const totalScore = senders.reduce((acc, sender) => acc + sender.score, 0);

    if (totalScore <= 0) {
      return [];
    }

    let allocated = 0;

    const result = senders.map((sender) => {
      const quantity = Math.floor((sender.score / totalScore) * totalMessages);

      allocated += quantity;

      return {
        senderId: sender.id,
        quantity,
      };
    });

    let remaining = totalMessages - allocated;

    while (remaining > 0) {
      const nextSender = this.roundRobin.next(workspaceId, senders);

      const allocation = result.find((item) => item.senderId === nextSender.id);

      if (allocation) {
        allocation.quantity++;
      }

      remaining--;
    }

    return result;
  }
}
