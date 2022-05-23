import type { DataFunctionArgs } from '@remix-run/server-runtime';
import type { TurboContext } from '~/types/TurboContext';
import type { CacheMetadata } from '~/types/vercel/turborepo';
import { json } from 'remix-utils';
import type { Team, User } from '@prisma/client';

export function getTurboContext({ request, params }: DataFunctionArgs, user: User, team: Team | null): TurboContext {
  const { artifactId, apiVersion } = params;
  const duration = request.headers.get(DURATION_HEADER);
  return {
    apiVersion: apiVersion as string,
    artifactId,
    team,
    duration,
    user,
  };
}

export function turboContextToMeta(turboCtx: TurboContext): CacheMetadata {
  if (!turboCtx.artifactId) {
    throw json('Missing artifactId', 422);
  }
  return {
    hash: turboCtx.artifactId,
    duration: turboCtx?.duration ? Number.parseInt(turboCtx?.duration) : 0,
  };
}

export const DURATION_HEADER = 'x-artifact-duration';
