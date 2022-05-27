import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByTeam } from '~/services/session.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const sessions = await getSessionsByTeam(params.id as string);
  return sessions;
};

export default function New() {
  const sessions = useLoaderData<Awaited<ReturnType<typeof getSessionsByTeam>>>();

  const tableProps = useSessionsTable(sessions);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
