import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { useSessionsTable } from '~/hooks/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import type { getSessions } from '~/services/session.server';
import { getSessionsByUserCount, getSessionsByUser } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [sessions, count] = await Promise.all([getSessionsByUser(user.id as string, skip, take), getSessionsByUserCount(user.id as string)]);
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
      <ListTitle title="My sessions" count={count} />
      <div className="flex">
        <Table {...tableProps} />
      </div>
      <div className="flex justify-center m-5">
        <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
      </div>
    </>
  );
}
