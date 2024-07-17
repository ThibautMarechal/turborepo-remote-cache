import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Readable } from 'stream';
import { CacheStorage } from '~/services/storage.server';
import { DURATION_HEADER, getTurboContext } from '~/utils/turboContext';
import { requireCookieAuth, requireTokenAuth } from '~/services/authentication.server';
import { getTeamFromRequest } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';
import { accepted, unprocessableEntity, internalServerError, notFound, conflict } from '~/utils/response';
import { existArtifactByHash, getArtifactByHash, getArtifactDuration, getArtifactId, hitArtifact, insertArtifact } from '~/services/artifact.server';
import type { User } from '@prisma/client';
import { requireTeamMember } from '~/roles/rights';
import debug from 'debug';

const Debugger = debug('turbo-api-artifacts');

export const loader: LoaderFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.PUT, METHOD.HEAD);
  let user: User;
  let authByToken = false;
  try {
    user = await requireTokenAuth(request);
    authByToken = true;
  } catch (e) {
    user = await requireCookieAuth(request, false);
  }
  const team = await getTeamFromRequest(request);
  const turboCtx = getTurboContext({ request, params, context }, user, team);
  if (!authByToken) {
    // Overriding the turboCOntext when uath with cookie
    if (!turboCtx.hash) {
      throw new Error('hash required');
    }
    const artifact = await getArtifactByHash(turboCtx.hash);
    if (!artifact) {
      throw notFound();
    }
    turboCtx.team = artifact.team;
    turboCtx.user = artifact.user;
  }
  Debugger('turboCtx: %o', turboCtx);

  const storage = new CacheStorage();
  if (!(await storage.existArtifact(turboCtx))) {
    throw notFound();
  }
  if (authByToken) {
    await hitArtifact(getArtifactId(turboCtx));
  }
  const artifactDuration = await getArtifactDuration(getArtifactId(turboCtx));
  const headers = new Headers();
  headers.set('Content-Type', 'application/octet-stream');
  headers.set(DURATION_HEADER, artifactDuration.toString());

  if (request.method === METHOD.HEAD) {
    return new Response(null, {
      status: 200,
      headers,
    });
  }
  // Cast as ReadableStream because Response actually accept Readable as BodyInit
  return new Response((await storage.readArtifact(turboCtx)) as unknown as ReadableStream, {
    status: 200,
    headers,
  });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.PUT, METHOD.HEAD);
  const user = await requireTokenAuth(request);
  const team = await getTeamFromRequest(request);

  if (team) {
    requireTeamMember(user, team.id);
  }

  const turboCtx = getTurboContext({ request, params, context }, user, team);
  Debugger('turboCtx: %o', turboCtx);

  if (!request.body) {
    Debugger('No body');
    throw unprocessableEntity();
  }

  if (await existArtifactByHash(turboCtx.hash!)) {
    Debugger('Conflicting hash');
    throw conflict();
  }

  const storage = new CacheStorage();

  const contentLength = Number.parseInt((request.headers.get('Content-Length') as string) ?? 0);
  try {
    await Promise.all([
      // The real type of request.body is ReadableStream. Somehow ReadableStream can be used as AsyncIterator
      storage.writeArtifact(turboCtx, Readable.from(request.body as unknown as AsyncIterable<any>)),
      insertArtifact({
        id: getArtifactId(turboCtx),
        hash: turboCtx.hash!,
        duration: turboCtx.duration!,
        contentLength,
        teamId: turboCtx.team?.id ?? null,
        userId: turboCtx.user.id,
      }),
    ]);
  } catch (err) {
    console.error(err);
    throw internalServerError();
  }
  return accepted();
};
