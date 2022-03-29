import type { DataFunctionArgs } from '@remix-run/server-runtime';
import type { TurboContext, ArtifactMeta } from '~/types/turborepo';
import { User } from '~/types/User';

export function getTurboContext({ request, params }: DataFunctionArgs, user: User): TurboContext {
  const url = new URL(request.url);

  const { artifactId, apiVersion } = params;
  const teamId = url.searchParams.get('teamId') ?? undefined;
  const teamSlug = url.searchParams.get('teamSlug') ?? undefined;
  const duration = request.headers.get(DURATION_HEADER);

  return {
    apiVersion: apiVersion as string,
    artifactId,
    teamId,
    teamSlug,
    duration,
    user,
  };
}

export function turboContextToMeta(turboCtx: TurboContext): ArtifactMeta {
  if (!turboCtx.artifactId) {
    throw new Response('Missing artifactId', { status: 422 });
  }
  return {
    hash: turboCtx.artifactId,
    duration: turboCtx?.duration ? Number.parseInt(turboCtx?.duration) : 0,
  };
}

export const DURATION_HEADER = 'x-artifact-duration';
