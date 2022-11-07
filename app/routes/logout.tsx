import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/authentication.server';

export const action: LoaderFunction = async ({ request }) => {
  return await authenticator.logout(request, {
    redirectTo: '/login',
  });
};
