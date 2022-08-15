import type { LoaderFunction } from '@remix-run/node';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessions, getSessionsCount } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { TablePage } from '~/component/TablePage';
import { requireAdmin } from '~/roles/rights';
import type { SessionDetail } from '~/types/prisma';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getSessions({ skip, take, orderBy }), getSessionsCount()]);
  return json({
    items,
    count,
  });
};

export default function Sessions() {
  const { items, count } = useTablePageLoaderData<SessionDetail>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title="All sessions" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
