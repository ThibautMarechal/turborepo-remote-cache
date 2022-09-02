import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/authentication.server';

export const action: ActionFunction = ({ request }) => login(request);
export const loader: LoaderFunction = ({ request }) => login(request);

async function login(request: Request) {
  // TODO handle redirect_to
  // const url = new URL(request.url);
  // const redirectTo = url.searchParams.get('redirect_to') || '/';
  try {
    return await authenticator.authenticate('oidc', request, {
      successRedirect: '/',
      failureRedirect: '/login',
    });
  } catch (error) {
    if (error instanceof Response && isRedirect(error)) {
      return error;
    }
    throw error;
  }
}

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) {
    return false;
  }
  return response.headers.has('Location');
}
