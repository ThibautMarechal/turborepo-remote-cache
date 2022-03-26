import { type LoaderFunction, type ActionFunction } from 'remix';
import type { PassThrough } from 'stream';
import { CacheStorage } from '~/storage';
import { DURATION_HEADER, getTurboContext, turboContextToMeta, validateToken } from '~/helpers/turboContext';
import { streamToString, stringToStream } from '~/helpers/stream';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const turboCtx = getTurboContext({ request, params, context });
  validateToken(turboCtx);

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
  throw new Response(null, { status: 404 });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const turboCtx = getTurboContext({ request, params, context });
  validateToken(turboCtx);

  if (!request.body) {
    throw new Response(null, { status: 422 });
  }

  const storage = new CacheStorage();
  try {
    await Promise.all([
      // Cast as PassThrough is beacause Remix is transforming the request body with to polyfill the Fetch API
      storage.writeArtifact(turboCtx, request.body as unknown as PassThrough),
      storage.writeMeta(turboCtx, stringToStream(JSON.stringify(turboContextToMeta(turboCtx)))),
    ]);
  } catch (err) {
    console.log(err);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 201 });
};
