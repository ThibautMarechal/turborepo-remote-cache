import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireTokenAuth } from '~/services/authentication.server';
import { CachingStatus } from '~/types/vercel/turborepo';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET);
  await requireTokenAuth(request);
  return json({
    status: CachingStatus.ENABLED,
  });
};
