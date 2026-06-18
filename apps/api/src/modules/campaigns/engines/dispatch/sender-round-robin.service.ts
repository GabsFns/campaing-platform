import { Injectable } from '@nestjs/common';

@Injectable()
export class SenderRoundRobin {
  private readonly pointers = new Map<string, number>();

  /**
   * Seleciona próximo sender
   */
  next<T extends { id: string }>(key: string, senders: T[]): T {
    if (senders.length === 0) {
      throw new Error('No senders available');
    }

    const current = this.pointers.get(key) ?? 0;

    const sender = senders[current % senders.length];

    this.pointers.set(key, (current + 1) % senders.length);

    return sender;
  }

  /**
   * Reseta ponteiro
   */
  reset(key: string) {
    this.pointers.delete(key);
  }
}
