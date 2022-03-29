import { type LoaderFunction, type ActionFunction, json } from 'remix';
import type { PassThrough } from 'stream';
import { CacheStorage } from '~/services/storage.server';
import { DURATION_HEADER, getTurboContext, turboContextToMeta } from '~/utils/turboContext';
import { streamToString, stringToStream } from '~/utils/stream';
import { requireTokenAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  const turboCtx = getTurboContext({ request, params, context }, user);

  const storage = new CacheStorage();
  if (await storage.existArtifact(turboCtx)) {
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
  }
  throw json(undefined, 404);
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  const turboCtx = getTurboContext({ request, params, context }, user);

  if (!request.body) {
    throw json(undefined, 422);
  }

  const storage = new CacheStorage();
  try {
    await Promise.all([
      // Cast as PassThrough is beacause Remix is transforming the request body with to polyfill the Fetch API
      storage.writeArtifact(turboCtx, request.body as unknown as PassThrough),
      storage.writeMeta(turboCtx, stringToStream(JSON.stringify(turboContextToMeta(turboCtx)))),
    ]);
  } catch (err) {
    console.error(err);
    return json(undefined, 500);
  }
  return json(undefined);
};
