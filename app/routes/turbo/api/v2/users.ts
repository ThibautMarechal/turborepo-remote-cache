import { type LoaderFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request }) => {
  return json(await requireTokenAuth(request));
};
