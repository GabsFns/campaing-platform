export type CampaignStatus = {
  DRAFT: any;
  SCHEDULED: any;
  PROCESSING: any;
  RUNNING: any;
  PAUSED: any;
  FINISHED: any;
  PARTIAL: any;
  FAILED: any;
};

export type RateLimitBucket = {
  tokens: number;
  lastRefill: number;
};

export enum CampaignErrorType {
  TEMPORARY = 'TEMPORARY',
  PERMANENT = 'PERMANENT',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN',
}
