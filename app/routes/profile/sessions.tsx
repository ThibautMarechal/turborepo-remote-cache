import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import type { getSessions } from '~/services/session.server';
import { getSessionsByUser } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  return getSessionsByUser(user.id);
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
