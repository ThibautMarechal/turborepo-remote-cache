import { redirect, type LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { authenticator, commitUserSession } from '~/services/authentication.server';
import { redirectToCookie } from '~/services/cookie.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.authStrategy);
  const redirectTo = (await redirectToCookie.parse(request.headers.get('Cookie'))) ?? '/';

  try {
    const userId = await authenticator.authenticate(params.authStrategy, request);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await commitUserSession(request, userId) } });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return redirect('/login');
  }
};
