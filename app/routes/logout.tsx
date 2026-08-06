import { redirect, type LoaderFunction } from '@remix-run/node';
import { destroyUserSession } from '~/services/authentication.server';

export const action: LoaderFunction = async ({ request }) => {
  return redirect('/login', { headers: { 'Set-Cookie': await destroyUserSession(request) } });
};
