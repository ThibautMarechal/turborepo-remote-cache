import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ToVercelUser } from '~/mapper/user';
import { requireTokenAuth } from '~/services/authentication.server';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  const user = await requireTokenAuth(request);
  return json({ user: ToVercelUser(user) });
};
