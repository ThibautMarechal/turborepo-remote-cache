import type { LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { authenticator } from '~/services/authentication.server';

export const loader: LoaderFunction = ({ request, params }) => {
  invariant(params.authStrategy);
  return authenticator.authenticate(params.authStrategy, request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
