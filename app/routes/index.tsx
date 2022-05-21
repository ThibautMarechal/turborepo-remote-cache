import { json, type LoaderFunction, useLoaderData } from 'remix';
import { getTimeSaved } from '~/services/events.server';
import { requireCookieAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return json(await getTimeSaved());
};

export default function Index() {
  const data = useLoaderData();

  return (
    <div>
      <h1>TurboRepo Remote Cache</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
