import type { LoaderFunction } from '@remix-run/node';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessions, getSessionsCount } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import TablePage from '~/component/TablePage';
import type { SessionDetail } from '~/types/prisma';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getSessions({ userId: user.id, skip, take, orderBy }), getSessionsCount({ userId: user.id })]);
  return json({
    items,
    count,
  });
};

export default function Sessions() {
  const { items, count } = useTablePageLoaderData<SessionDetail>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title="My sessions" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
