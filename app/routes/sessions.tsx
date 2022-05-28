import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessions, getSessionsCount } from '~/services/session.server';
import Pagination from '~/component/Pagination';
import { getPaginationFromRequest } from '~/utils/pagination';
import ListTitle from '~/component/ListTitle';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [sessions, count] = await Promise.all([getSessions(skip, take), getSessionsCount()]);
  return {
    sessions,
    count,
  };
};

export default function New() {
  const { sessions, count } = useLoaderData<{ sessions: Awaited<ReturnType<typeof getSessions>>; count: number }>();
  const paginationProps = usePaginateSearchParams();
  const tableProps = useSessionsTable(sessions);
  return (
    <>
      <ListTitle title="All sessions" count={count} />
      <div className="flex">
        <Table {...tableProps} />
      </div>
      <div className="flex justify-center m-5">
        <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
      </div>
    </>
  );
}
