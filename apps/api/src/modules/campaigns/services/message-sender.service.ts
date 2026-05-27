import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { MetaApiService } from '../../meta/meta-api.service.js';

import { RateLimitEngine } from '../engines/rate-limit.engine.js';
import { ErrorClassifierEngine } from '../engines/error-classifier.engine.js';

import { CampaignErrorType } from '../type/campaigns.type.js';

import { CampaignCompleteEngine } from '../engines/campaign-complete.engine.js';

@Injectable()
export class MessageSenderService {
  private readonly logger = new Logger(MessageSenderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaApiService: MetaApiService,
    private readonly rateLimitEngine: RateLimitEngine,
    private readonly errorClassifier: ErrorClassifierEngine,
    private readonly campaignCompleteEngine: CampaignCompleteEngine,
  ) {}

  async send(messageId: string) {
    /**
     * LOCK MESSAGE
     */
    const lock = await this.prisma.campaignMessage.updateMany({
      where: {
        id: messageId,

        status: {
          in: ['PENDING', 'RETRYING'],
        },
      },

      data: {
        status: 'PROCESSING',

        processingStartedAt: new Date(),
      },
    });

    /**
     * MESSAGE JÁ PROCESSADA
     */
    if (lock.count === 0) {
      this.logger.warn(`[MESSAGE_LOCKED] messageId=${messageId}`);

      return;
    }

    /**
     * BUSCA MESSAGE
     */
    const message = await this.prisma.campaignMessage.findUnique({
      where: {
        id: messageId,
      },

      include: {
        campaign: true,

        workspace: {
          include: {
            MetaConnection: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    this.logger.log(
      `[MESSAGE_SEND_START] messageId=${message.id} campaignId=${message.campaignId}`,
    );

    /**
     * RATE LIMIT
     */
    await this.rateLimitEngine.consume(message.senderNumberId ?? 'default');

    /**
     * CONNECTION
     */
    const connection = message.workspace.MetaConnection[0];

    if (!connection) {
      throw new Error('Meta connection not found');
    }

    /**
     * TEXTO FINAL
     */
    const text =
      (
        message.providerPayload as {
          text?: string;
        }
      )?.text ?? '';

    try {
      /**
       * ENVIO META
       */
      const providerResponse = await this.metaApiService.sendTextMessage({
        accessToken: connection.accessToken,

        phoneNumberId: connection.phoneNumberId,

        to: message.phoneNormalized,

        body: text,
      });

      const providerMessageId = providerResponse.messages?.[0]?.id;

      /**
       * UPDATE MESSAGE
       */
      await this.prisma.campaignMessage.update({
        where: {
          id: message.id,
        },

        data: {
          status: 'SENT',

          providerId: providerMessageId,

          providerStatus: 'accepted',

          providerTimestamp: new Date(),

          providerRawResponse: providerResponse,

          sentAt: new Date(),

          processingStartedAt: null,

          lastEventType: 'SENT',

          error: null,
        },
      });

      /**
       * EVENT LOG
       */
      await this.prisma.messageEvent.create({
        data: {
          messageId: message.id,

          type: 'SENT',

          providerPayload: providerResponse,
        },
      });

      this.logger.log(
        `[MESSAGE_SENT] messageId=${message.id} providerId=${providerMessageId}`,
      );

      /**
       * COMPLETION CHECK
       */
      await this.campaignCompleteEngine.checkCompletion(message.campaignId);
    } catch (error) {
      /**
       * CLASSIFICA ERRO
       */
      const errorType = this.errorClassifier.classify(error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `[MESSAGE_FAILED] messageId=${message.id} type=${errorType} error=${errorMessage}`,
      );

      /**
       * EVENT LOG
       */
      await this.prisma.messageEvent.create({
        data: {
          messageId: message.id,

          type: 'FAILED',

          providerPayload: {
            error: errorMessage,
            errorType,
          },
        },
      });

      /**
       * TEMPORARY / RATE LIMIT
       */
      if (
        errorType === CampaignErrorType.TEMPORARY ||
        errorType === CampaignErrorType.RATE_LIMIT ||
        errorType === CampaignErrorType.UNKNOWN
      ) {
        await this.prisma.campaignMessage.update({
          where: {
            id: message.id,
          },

          data: {
            status: 'RETRYING',

            processingStartedAt: null,

            error: errorMessage,
          },
        });

        this.logger.warn(`[MESSAGE_RETRY] messageId=${message.id}`);

        throw error;
      }

      /**
       * AUTH ERROR
       */
      if (errorType === CampaignErrorType.AUTH) {
        await this.prisma.metaConnection.update({
          where: {
            id: connection.id,
          },

          data: {
            status: 'DISCONNECTED',
          },
        });

        await this.prisma.campaignMessage.update({
          where: {
            id: message.id,
          },

          data: {
            status: 'FAILED',

            processingStartedAt: null,

            error: errorMessage,

            lastEventType: 'FAILED',
          },
        });

        this.logger.error(`[META_AUTH_FAILED] connectionId=${connection.id}`);

        await this.campaignCompleteEngine.checkCompletion(message.campaignId);

        throw error;
      }

      /**
       * PERMANENT ERROR
       */
      await this.prisma.campaignMessage.update({
        where: {
          id: message.id,
        },

        data: {
          status: 'FAILED',

          processingStartedAt: null,

          error: errorMessage,

          lastEventType: 'FAILED',
        },
      });

      this.logger.error(`[MESSAGE_PERMANENT_FAILED] messageId=${message.id}`);

      await this.campaignCompleteEngine.checkCompletion(message.campaignId);
    }
  }
}
