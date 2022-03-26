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

export type TurboContext = {
  teamSlug: string;
  token?: string;
  artifactId?: string;
  apiVersion: string;
  duration?: string | null;
};

export type ArtifactMeta = {
  hash: string;
  duration: number;
};
