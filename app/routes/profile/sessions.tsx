import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import type { getSessions } from '~/services/session.server';
import { getSessionsByUserCount, getSessionsByUser } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [sessions, count] = await Promise.all([getSessionsByUser(user.id as string, skip, take, orderBy), getSessionsByUserCount(user.id as string)]);
  return {
    sessions,
    count,
  };
};

export default function Sessions() {
  const { sessions, count } = useLoaderData<{ sessions: Awaited<ReturnType<typeof getSessions>>; count: number }>();
  const paginationProps = usePaginateSearchParams();
  const tableProps = useSessionsTable(sessions);
  return (
    <>
      <ListTitle title="My sessions" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
    </>
  );
}
