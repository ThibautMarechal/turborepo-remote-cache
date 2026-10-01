import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';

export const streamTimeout = 5_000;

export default function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, routerContext: EntryContext) {
  // bots and SPA mode get the whole document at once, browsers get it streamed
  const readyEvent = isbot(request.headers.get('user-agent')) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { abort, pipe } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      [readyEvent]() {
        shellRendered = true;
        const body = new PassThrough();

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(createReadableStreamFromReadable(body), {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        );

        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        // errors in the shell are reported by onShellError
        if (shellRendered) {
          console.error(error);
        }
      },
    });

    // abort the render a bit after streamTimeout so rejected promises can still be sent
    setTimeout(abort, streamTimeout + 1000);
  });
}
