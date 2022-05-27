import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessions } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  return getSessions();
};

export default function New() {
  const sessions = useLoaderData<Awaited<ReturnType<typeof getSessions>>>();

  const tableProps = useSessionsTable(sessions);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
