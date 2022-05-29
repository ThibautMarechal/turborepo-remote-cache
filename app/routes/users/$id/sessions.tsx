import { type LoaderFunction } from 'remix';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByUser, getSessionsByUserCount } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import type { User } from '@prisma/client';
import { getUser } from '~/services/users.server';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { TablePage } from '~/component/TablePage';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [user, items, count] = await Promise.all([
    getUser(params.id as string),
    getSessionsByUser(params.id as string, skip, take, orderBy),
    getSessionsByUserCount(params.id as string),
  ]);
  return {
    user,
    items,
    count,
  };
};

export default function Sessions() {
  const { user, items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getSessionsByUser>>[number], { user: User }>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title={`${user?.name}'s sessions`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
