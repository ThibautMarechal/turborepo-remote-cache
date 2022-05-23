export enum EventType {
  HIT = 'HIT',
  MISS = 'MISS',
}

export enum SourceType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
}

export type TurboEvent = {
  duration: number;
  event: EventType;
  hash: string;
  sessionId: string;
  source: SourceType;
};

export type CacheMetadata = {
  hash: string;
  duration: number;
};

export enum CachingStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  OVER_LIMIT = 'over_limit',
}
