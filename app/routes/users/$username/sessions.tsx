import type { LoaderFunction } from '@remix-run/node';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getPaginationFromRequest } from '~/utils/pagination';
import type { User } from '@prisma/client';
import { getUser } from '~/services/users.server';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { TablePage } from '~/component/TablePage';
import type { SessionDetail } from '~/types/prisma';
import { getSessions, getSessionsCount } from '~/services/session.server';
import { requireAdmin } from '~/roles/rights';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const user = await getUser(params.username as string);
  const [items, count] = await Promise.all([getSessions({ userId: user.id, skip, take, orderBy }), getSessionsCount({ userId: user.id })]);
  return json({
    user,
    items,
    count,
  });
};

export default function Sessions() {
  const { user, items, count } = useTablePageLoaderData<SessionDetail, { user: User }>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title={`${user?.name}'s sessions`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
