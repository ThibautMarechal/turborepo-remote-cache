import type { LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { authenticator } from '~/services/authentication.server';
import { redirectToCookie } from '~/services/cookie.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.authStrategy);
  const redirectTo = (await redirectToCookie.parse(request.headers.get('Cookie'))) ?? '/';

  return authenticator.authenticate(params.authStrategy, request, {
    successRedirect: redirectTo,
    failureRedirect: '/login',
  });
};
