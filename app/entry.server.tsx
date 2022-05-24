import { renderToString } from 'react-dom/server';
import { RemixServer } from 'remix';
import type { EntryContext, HandleDataRequestFunction } from 'remix';
import { cors } from 'remix-utils';
import type { Headers } from '@remix-run/web-fetch';

export const handleDataRequest: HandleDataRequestFunction = async (response, { request }) => {
  return await cors(request, response);
};

export default async function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
