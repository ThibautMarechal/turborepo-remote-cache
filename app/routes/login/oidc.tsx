import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/authentication.server';

import { redirect } from '@remix-run/node';

export const loader: LoaderFunction = () => redirect('/login');

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate('oidc', request);
};
