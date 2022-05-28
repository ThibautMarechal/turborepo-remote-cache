import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByUser, getSessionsByUserCount } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import type { User } from '@prisma/client';
import { getUser } from '~/services/users.server';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [user, sessions, count] = await Promise.all([
    getUser(params.id as string),
    getSessionsByUser(params.id as string, skip, take, orderBy),
    getSessionsByUserCount(params.id as string),
  ]);
  return {
    user,
    sessions,
    count,
  };
};

export default function Sessions() {
  const { user, sessions, count } = useLoaderData<{ user: User; sessions: Awaited<ReturnType<typeof getSessionsByUser>>; count: number }>();
  const paginationProps = usePaginateSearchParams();
  const tableProps = useSessionsTable(sessions);
  return (
    <>
      <ListTitle title={`${user?.name}'s sessions`} count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
    </>
  );
}
