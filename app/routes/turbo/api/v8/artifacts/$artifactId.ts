import { type LoaderFunction, type ActionFunction } from 'remix';
import { Readable } from 'stream';
import { CacheStorage } from '~/services/storage.server';
import { DURATION_HEADER, getTurboContext, turboContextToMeta } from '~/utils/turboContext';
import { streamToString, stringToStream } from '~/utils/stream';
import { requireTokenAuth } from '~/services/authentication.server';
import { getTeamFromRequest } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';
import { accepted, unprocessableEntity, internalServerError, notFound } from '~/utils/response';
import { hitArtifact, insertArtifact } from '~/services/artifact.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.PUT);
  const user = await requireTokenAuth(request);
  const team = await getTeamFromRequest(request);
  const turboCtx = getTurboContext({ request, params, context }, user, team);

  const storage = new CacheStorage();
  if (!(await storage.existArtifact(turboCtx))) {
    throw notFound();
  }
  await hitArtifact(turboCtx.artifactId!);
  const meta = JSON.parse(await streamToString(await storage.readMeta(turboCtx)));
  const headers = new Headers();
  headers.set('Content-Type', 'application/octet-stream');
  if (meta) {
    headers.set(DURATION_HEADER, meta.duration.toString());
  }
  // Cast as ReadableStream because Response actually accept Readable as BodyInit
  return new Response((await storage.readArtifact(turboCtx)) as unknown as ReadableStream, {
    status: 200,
    headers,
  });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.PUT);
  const user = await requireTokenAuth(request);
  const team = await getTeamFromRequest(request);
  const turboCtx = getTurboContext({ request, params, context }, user, team);

  if (!request.body) {
    throw unprocessableEntity();
  }

  const storage = new CacheStorage();
  const contentLength = Number.parseInt(request.headers.get('Content-Length') as string);
  try {
    await Promise.all([
      // The real type of request.body is ReadableStream. Somehow ReadableStream can be used as AsyncIterator
      storage.writeArtifact(turboCtx, Readable.from(request.body as unknown as AsyncIterable<any>)),
      storage.writeMetadata(turboCtx, stringToStream(JSON.stringify(turboContextToMeta(turboCtx)))),
      insertArtifact({ id: turboCtx.artifactId!, duration: turboCtx.duration!, contentLength, teamId: turboCtx.team?.id ?? null, userId: turboCtx.user.id }),
    ]);
  } catch (err) {
    console.error(err);
    throw internalServerError();
  }
  return accepted();
};
