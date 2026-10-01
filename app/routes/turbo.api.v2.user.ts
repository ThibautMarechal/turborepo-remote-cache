import { type LoaderFunction } from 'react-router';
import { ToVercelUser } from '~/mapper/user';
import { requireTokenAuth } from '~/services/authentication.server';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  const user = await requireTokenAuth(request);
  return Response.json({ user: ToVercelUser(user) });
};
