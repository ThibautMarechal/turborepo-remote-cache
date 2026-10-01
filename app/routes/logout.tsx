import { redirect, type LoaderFunction } from 'react-router';
import { destroyUserSession } from '~/services/authentication.server';

export const action: LoaderFunction = async ({ request }) => {
  return redirect('/login', { headers: { 'Set-Cookie': await destroyUserSession(request) } });
};
