import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessions, getSessionsCount } from '~/services/session.server';
import Pagination from '~/component/Pagination';
import { getPaginationFromRequest } from '~/utils/pagination';
import ListTitle from '~/component/ListTitle';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [sessions, count] = await Promise.all([getSessions(skip, take, orderBy), getSessionsCount()]);
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
      <ListTitle title="All sessions" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
    </>
  );
}
