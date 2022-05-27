import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByUser } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  return getSessionsByUser(params.id as string);
};

export default function Sessions() {
  const sessions = useLoaderData<Awaited<ReturnType<typeof getSessionsByUser>>>();

  const tableProps = useSessionsTable(sessions);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
