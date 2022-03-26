import type { DataFunctionArgs } from '@remix-run/server-runtime';
import type { TurboContext, ArtifactMeta } from '~/types/turborepo';

export function getTurboContext({ request, params }: DataFunctionArgs): TurboContext {
  const url = new URL(request.url);

  const { artifactId, apiVersion } = params;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s/, '') ?? undefined;
  const teamId = url.searchParams.get('teamId');
  const teamSlug = url.searchParams.get('teamSlug');
  const duration = request.headers.get(DURATION_HEADER);

  const resolveTeamSlug = teamId ?? teamSlug;
  if (!resolveTeamSlug) {
    throw new Response('Missing TeamId or TeamSlug', { status: 422 });
  }

  return {
    apiVersion: apiVersion as string,
    token,
    artifactId,
    teamSlug: resolveTeamSlug,
    duration,
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

export function validateToken(turboCtx: TurboContext): void {
  if (!turboCtx.token) {
    throw new Response('Missing TURBO_TOKEN', { status: 422 });
  }
  if (turboCtx.token !== process.env.TURBO_TOKEN) {
    console.log('wrong token', turboCtx.token);
    throw new Response(null, { status: 403 });
  }
}
export const DURATION_HEADER = 'x-artifact-duration';
