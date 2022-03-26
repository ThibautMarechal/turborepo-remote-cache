import { type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return null;
};

export default function Index() {
  return <div>All set!</div>;
}
