import { Injectable } from '@nestjs/common';

import { CampaignErrorType } from '../type/campaigns.type.js';

@Injectable()
export class ErrorClassifierEngine {
  classify(error: unknown): CampaignErrorType {
    const message = error instanceof Error ? error.message.toLowerCase() : '';

    /**
     * RATE LIMIT
     */
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    ) {
      return CampaignErrorType.RATE_LIMIT;
    }

    /**
     * AUTH
     */
    if (
      message.includes('unauthorized') ||
      message.includes('invalid token') ||
      message.includes('401') ||
      message.includes('403')
    ) {
      return CampaignErrorType.AUTH;
    }

    /**
     * TEMPORÁRIOS
     */
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('socket') ||
      message.includes('500') ||
      message.includes('503')
    ) {
      return CampaignErrorType.TEMPORARY;
    }

    /**
     * PERMANENTES
     */
    if (
      message.includes('invalid number') ||
      message.includes('recipient') ||
      message.includes('phone')
    ) {
      return CampaignErrorType.PERMANENT;
    }

    return CampaignErrorType.UNKNOWN;
  }
}
