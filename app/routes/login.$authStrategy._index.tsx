import { redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/authentication.server';

import invariant from 'tiny-invariant';
import { redirectToCookie } from '~/services/cookie.server';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.authStrategy);
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect_to') ?? '/';

  try {
    await authenticator.authenticate(params.authStrategy, request);
    return redirect(redirectTo);
  } catch (error) {
    if (error instanceof Response && isRedirect(error)) {
      error.headers.append('Set-Cookie', await redirectToCookie.serialize(redirectTo));
      return error;
    }
    if (error instanceof Response) {
      throw error;
    }
    return redirect('/login');
  }
};

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) {
    return false;
  }
  return response.headers.has('Location');
}
