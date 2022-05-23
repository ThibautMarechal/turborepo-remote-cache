import { type LoaderFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';
import { CachingStatus } from '~/types/vercel/turborepo';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireTokenAuth(request);
  return json({
    status: CachingStatus.ENABLED,
  });
};
