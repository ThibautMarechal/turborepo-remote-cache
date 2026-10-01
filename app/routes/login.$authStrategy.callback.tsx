import { redirect, type LoaderFunction } from 'react-router';
import invariant from 'tiny-invariant';
import { authenticateExternal, commitUserSession } from '~/services/authentication.server';
import { redirectToCookie } from '~/services/cookie.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.authStrategy);
  const redirectTo = (await redirectToCookie.parse(request.headers.get('Cookie'))) ?? '/';

  try {
    const userId = await authenticateExternal(params.authStrategy, request);
    return redirect(redirectTo, { headers: { 'Set-Cookie': await commitUserSession(request, userId) } });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(`External login with ${params.authStrategy} failed:`, error);
    return redirect('/login');
  }
};
