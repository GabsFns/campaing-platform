import { Injectable } from '@nestjs/common';

@Injectable()
export class SenderSelectionEngine {
  assign(
    messages: { id: string }[],
    allocations: {
      senderId: string;
      quantity: number;
    }[],
  ) {
    const assignments: {
      messageId: string;
      senderId: string;
    }[] = [];

    let index = 0;

    for (const allocation of allocations) {
      for (let i = 0; i < allocation.quantity && index < messages.length; i++) {
        assignments.push({
          messageId: messages[index].id,
          senderId: allocation.senderId,
        });

        index++;
      }
    }

    return assignments;
  }
}
