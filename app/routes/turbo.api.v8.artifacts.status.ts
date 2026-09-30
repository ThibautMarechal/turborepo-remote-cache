import { type LoaderFunction } from 'react-router';
import { requireTokenAuth } from '~/services/authentication.server';
import { CachingStatus } from '~/types/vercel/turborepo';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  await requireTokenAuth(request);
  return Response.json({
    status: CachingStatus.ENABLED,
  });
};
