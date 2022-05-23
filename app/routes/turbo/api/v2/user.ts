import { type LoaderFunction, json } from 'remix';
import { ToVercelUser } from '~/mapper/user';
import { requireTokenAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request }) => {
  return json(ToVercelUser(await requireTokenAuth(request)));
};
