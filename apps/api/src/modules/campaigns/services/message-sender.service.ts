import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { MetaApiService } from '../../meta/meta-api.service.js';
import { RateLimitEngine } from '../engines/rate-limit.engine.js';
import { ErrorClassifierEngine } from '../engines/error-classifier.engine.js';
import { CampaignErrorType } from '../type/campaigns.type.js';
import { CampaignCompleteEngine } from '../engines/campaign-complete.engine.js';
import { SenderNumberCacheService } from './cache.service.js';
import { CampaignMetricsService } from './metrics-service.js';

@Injectable()
export class MessageSenderService {
  private readonly logger = new Logger(MessageSenderService.name);
  private readonly maxRetries = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaApiService: MetaApiService,
    private readonly rateLimitEngine: RateLimitEngine,
    private readonly errorClassifier: ErrorClassifierEngine,
    private readonly senderCache: SenderNumberCacheService,
    private readonly metricsService: CampaignMetricsService,
    private readonly campaignCompleteEngine: CampaignCompleteEngine,
  ) {}

  async send(messageId: string) {
    const startTime = Date.now();
    /**
     * LOCK MESSAGE
     *
     * Garante:
     * - idempotência
     * - evita race condition
     * - evita múltiplos workers
     */
    const lock = await this.prisma.campaignMessage.updateMany({
      where: {
        id: messageId,
        status: {
          in: ['QUEUED', 'PENDING', 'RETRYING'],
        },
      },

      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
        lockedAt: new Date(),
      },
    });

    /**
     * Outro worker já pegou
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

    /**
     * IDEMPOTÊNCIA PROVIDER
     *
     * Evita duplo envio caso:
     * - Meta recebeu
     * - worker crashou antes do update
     */
    if (message.providerId) {
      this.logger.warn(
        `[MESSAGE_ALREADY_SENT] messageId=${message.id} providerId=${message.providerId}`,
      );
      return message.id;
    }

    this.logger.log(
      `[MESSAGE_SEND_START] messageId=${message.id} campaignId=${message.campaignId}`,
    );

    const senderNumberId = message.senderNumberId;
    if (!senderNumberId) {
      throw new Error(`Message without senderNumberId: ${message.id}`);
    }
    const senderNumber = await this.senderCache.get(
      senderNumberId,
      message.workspaceId,
    );

    if (!senderNumber) {
      throw new Error(
        `SenderNumber not found: ${senderNumberId} (message=${message.id})`,
      );
    }

    await this.rateLimitEngine.acquireSenderNumberThroughput(
      senderNumber.id,
      Number(senderNumber.throughputLimit),
    );

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
       * ENVIA META
       */
      const providerResponse = await this.metaApiService.sendTextMessage({
        accessToken: connection.accessToken,
        phoneNumberId: connection.phoneNumberId,
        to: message.phoneNormalized,
        body: text,
      });

      const providerMessageId = providerResponse.messages?.[0]?.id;

      /**
       * PROVIDER TIMESTAMP
       */
      const providerTimestamp = providerResponse.messages?.[0]?.timestamp
        ? new Date(providerResponse.messages[0].timestamp)
        : new Date();

      /**
       * UPDATE MESSAGE + PROGRESS + EVENT
       */
      await this.prisma.$transaction(async (tx) => {
        /**
         * PROCESSAMENTO JÁ CONTABILIZADO?
         */
        const alreadyProcessed = await tx.campaignMessage.findUnique({
          where: {
            id: message.id,
          },
          select: {
            processedAt: true,
          },
        });

        /**
         * UPDATE MESSAGE
         */

        const providerRawResponse = JSON.parse(
          JSON.stringify(providerResponse),
        ) as Prisma.InputJsonValue;

        await tx.campaignMessage.update({
          where: {
            id: message.id,
          },

          data: {
            status: 'SENT',
            providerId: providerMessageId,
            providerStatus: 'accepted',
            providerTimestamp,
            providerRawResponse,
            sentAt: new Date(),
            processingStartedAt: null,
            nextRetryAt: null,
            lastEventType: 'SENT',
            error: null,
            processedAt: alreadyProcessed?.processedAt
              ? alreadyProcessed.processedAt
              : new Date(),
          },
        });

        /**
         * INCREMENTA APENAS UMA VEZ
         */
        if (!alreadyProcessed?.processedAt) {
          await tx.campaign.update({
            where: {
              id: message.campaignId,
            },
            data: {
              processedContacts: {
                increment: 1,
              },
            },
          });
        }

        /**
         * EVENT LOG
         */
        const providerPayload = JSON.parse(
          JSON.stringify(providerResponse),
        ) as Prisma.InputJsonValue;
        await tx.messageEvent.create({
          data: {
            messageId: message.id,

            type: 'SENT',

            providerPayload,
          },
        });
      });

      this.logger.log(
        `[MESSAGE_SENT] messageId=${message.id} providerId=${providerMessageId}`,
      );

      /**
       * COMPLETION CHECK
       */
      const duration = Date.now() - startTime;
      await this.metricsService.recordMessage(
        message.campaignId,
        'SENT',
        duration,
      );
      return message.id;
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

      await this.metricsService.recordMessage(
        message.campaignId,
        'FAILED',
        Date.now() - startTime,
        errorType,
      );
      /**
       * RETRY COUNT
       */
      const nextRetryCount = message.retryCount + 1;

      /**
       * EXPONENTIAL BACKOFF
       *
       * 1s
       * 2s
       * 4s
       * 8s
       * ...
       * max 5min
       */
      const retryDelay = Math.min(1000 * Math.pow(2, nextRetryCount), 300000);

      /**
       * RETRYABLE ERRORS
       */
      if (
        errorType === CampaignErrorType.TEMPORARY ||
        errorType === CampaignErrorType.RATE_LIMIT ||
        errorType === CampaignErrorType.UNKNOWN
      ) {
        /**
         * ULTRAPASSOU RETRY?
         */
        if (nextRetryCount >= this.maxRetries) {
          await this.moveToDeadLetter({
            messageId: message.id,
            campaignId: message.campaignId,
            errorMessage,
            errorType,
          });

          return;
        }

        await this.prisma.campaignMessage.update({
          where: {
            id: message.id,
          },
          data: {
            status: 'RETRYING',
            retryCount: {
              increment: 1,
            },
            nextRetryAt: new Date(Date.now() + retryDelay),
            processingStartedAt: null,
            error: errorMessage,
          },
        });

        this.logger.warn(
          `[MESSAGE_RETRY] messageId=${message.id} retryCount=${nextRetryCount} retryInMs=${retryDelay}`,
        );

        /**
         * BullMQ retry
         */
        throw error;
      }

      /**
       * AUTH ERROR
       */
      if (errorType === CampaignErrorType.AUTH) {
        await this.failMessage({
          message,
          connectionId: connection.id,
          errorMessage,
          disconnectConnection: true,
        });

        this.logger.error(`[META_AUTH_FAILED] connectionId=${connection.id}`);

        throw error;
      }

      /**
       * ERRO PERMANENTE
       */
      await this.failMessage({
        message,
        errorMessage,
      });

      this.logger.error(`[MESSAGE_PERMANENT_FAILED] messageId=${message.id}`);
    }
  }

  /**
   * FAIL MESSAGE
   */
  private async failMessage(params: {
    message: {
      id: string;
      campaignId: string;
    };
    errorMessage: string;
    connectionId?: string;
    disconnectConnection?: boolean;
  }) {
    const { message, errorMessage, connectionId, disconnectConnection } =
      params;

    await this.prisma.$transaction(async (tx) => {
      /**
       * PROCESSAMENTO JÁ CONTABILIZADO?
       */
      const alreadyProcessed = await tx.campaignMessage.findUnique({
        where: {
          id: message.id,
        },
        select: {
          processedAt: true,
        },
      });

      /**
       * DISCONNECT META
       */
      if (disconnectConnection && connectionId) {
        await tx.metaConnection.update({
          where: {
            id: connectionId,
          },

          data: {
            status: 'DISCONNECTED',
          },
        });
      }

      /**
       * UPDATE MESSAGE
       */
      await tx.campaignMessage.update({
        where: {
          id: message.id,
        },

        data: {
          status: 'FAILED',
          processingStartedAt: null,
          error: errorMessage,
          nextRetryAt: null,
          lastEventType: 'FAILED',
          processedAt: alreadyProcessed?.processedAt
            ? alreadyProcessed.processedAt
            : new Date(),
        },
      });

      /**
       * INCREMENTA APENAS UMA VEZ
       */
      if (!alreadyProcessed?.processedAt) {
        await tx.campaign.update({
          where: {
            id: message.campaignId,
          },

          data: {
            processedContacts: {
              increment: 1,
            },
          },
        });
      }
    });

    /**
     * COMPLETION CHECK
     */
  }

  /**
   * DEAD LETTER
   */
  private async moveToDeadLetter(params: {
    messageId: string;
    campaignId: string;
    errorMessage: string;
    errorType: CampaignErrorType;
  }) {
    const { messageId, campaignId, errorMessage, errorType } = params;

    this.logger.error(
      `[MESSAGE_DEAD_LETTER] messageId=${messageId} errorType=${errorType}`,
    );

    await this.prisma.$transaction(async (tx) => {
      /**
       * MESSAGE
       */
      const message = await tx.campaignMessage.findUnique({
        where: {
          id: messageId,
        },
      });

      if (!message) {
        return;
      }

      /**
       * PROCESSADO?
       */
      const alreadyProcessed = !!message.processedAt;

      /**
       * DEAD LETTER
       */
      await tx.deadLetterMessage.create({
        data: {
          campaignMessageId: message.id,

          error: errorMessage,

          failedAt: new Date(),

          payload: {
            errorType,
            retryCount: message.retryCount,
          },
          queueName: 'campaign-message',

          jobName: 'send-message',
        },
      });

      /**
       * UPDATE MESSAGE
       */
      await tx.campaignMessage.update({
        where: {
          id: message.id,
        },
        data: {
          status: 'FAILED',
          processingStartedAt: null,
          nextRetryAt: null,
          error: errorMessage,
          lastEventType: 'FAILED',
          processedAt: alreadyProcessed ? message.processedAt : new Date(),
        },
      });

      /**
       * INCREMENTA UMA VEZ
       */
      if (!alreadyProcessed) {
        await tx.campaign.update({
          where: {
            id: campaignId,
          },

          data: {
            processedContacts: {
              increment: 1,
            },
          },
        });
      }
    });
  }
}
