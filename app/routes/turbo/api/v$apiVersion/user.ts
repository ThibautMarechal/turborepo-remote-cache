import { type LoaderFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);

  return json({
    user,
  });
};
