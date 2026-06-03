import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Queue } from 'bullmq';

@Injectable()
export class DispatchEngine {
  private readonly logger = new Logger(DispatchEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sendQueue: Queue,
  ) {}

  /**
   * Dispara mensagens em STREAM controlado
   */
  async dispatchBatch(generationKey: string) {
    this.logger.log(`[DISPATCH_START] generationKey=${generationKey}`);

    const messages = await this.prisma.campaignMessage.findMany({
      where: {
        generationKey,
        status: 'QUEUED',
      },
      select: {
        id: true,
        senderNumberId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    for (const message of messages) {
      await this.sendQueue.add(
        'send-message',
        {
          messageId: message.id,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    this.logger.log(`[DISPATCH_FINISHED] total=${messages.length}`);
  }
}
