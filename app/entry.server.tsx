import { renderToString } from 'react-dom/server';
import { RemixServer } from 'remix';
import type { EntryContext, HandleDataRequestFunction } from 'remix';
import { cors } from 'remix-utils';
import { getNumberOfUser } from './services/users.server';
import type { Headers } from '@remix-run/web-fetch';

export const handleDataRequest: HandleDataRequestFunction = async (response, { request }) => {
  return await cors(request, response);
};

export default async function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  const { pathname } = new URL(request.url);
  const isOnBoarding = pathname.startsWith('/onboarding');
  const numberOfUsers = await getNumberOfUser();
  if (!isOnBoarding && numberOfUsers === 0) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/onboarding',
      },
    });
  }

  const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
