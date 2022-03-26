import { type LoaderFunction } from 'remix';
import { authenticator } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.logout(request, {
    redirectTo: '/login',
  });
};
