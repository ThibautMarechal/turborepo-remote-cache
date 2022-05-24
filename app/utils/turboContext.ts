import type { DataFunctionArgs } from '@remix-run/server-runtime';
import type { TurboContext } from '~/types/TurboContext';
import type { CacheMetadata } from '~/types/vercel/turborepo';
import type { Team, User } from '@prisma/client';
import { unprocessableEntity } from './response';

export function getTurboContext({ request, params }: DataFunctionArgs, user: User, team: Team | null): TurboContext {
  const { artifactId, apiVersion } = params;
  const durationString = request.headers.get(DURATION_HEADER);
  return {
    apiVersion: apiVersion as string,
    artifactId,
    team,
    duration: durationString ? Number.parseInt(durationString) : null,
    user,
  };
}

export function turboContextToMeta(turboCtx: TurboContext): CacheMetadata {
  if (!turboCtx.artifactId) {
    throw unprocessableEntity('Missing artifactId');
  }
  return {
    hash: turboCtx.artifactId,
    duration: turboCtx.duration ?? 0,
  };
}

export const DURATION_HEADER = 'x-artifact-duration';
