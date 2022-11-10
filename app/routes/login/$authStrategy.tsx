import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/authentication.server';

import { redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { redirectToCookie } from '~/services/cookie.server';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.authStrategy);
  const url = new URL(request.url);
  console.log('request.url', request.url);
  console.log('new Request(request.url, request)', new Request(request.url, request));
  console.log('new Request(request.url, request).url', new Request(request.url, request).url);
  const redirectTo = url.searchParams.get('redirect_to') ?? '/';

  try {
    return await authenticator.authenticate(params.authStrategy, request, {
      failureRedirect: '/login',
      successRedirect: redirectTo ?? '/',
    });
  } catch (error) {
    if (error instanceof Response && isRedirect(error)) {
      error.headers.append('Set-Cookie', await redirectToCookie.serialize(redirectTo));
      return error;
    }
    throw error;
  }
};

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) {
    return false;
  }
  return response.headers.has('Location');
}
