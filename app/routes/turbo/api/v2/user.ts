import { type LoaderFunction, json } from 'remix';
import { ToVercelUser } from '~/mapper/user';
import { requireTokenAuth } from '~/services/authentication.server';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  const user = await requireTokenAuth(request);
  return json({ user: ToVercelUser(user) });
};
