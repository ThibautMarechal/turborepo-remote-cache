import { type LoaderFunction } from 'remix';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByUserCount, getSessionsByUser } from '~/services/session.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import TablePage from '~/component/TablePage';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getSessionsByUser(user.id as string, skip, take, orderBy), getSessionsByUserCount(user.id as string)]);
  return {
    items,
    count,
  };
};

export default function Sessions() {
  const { items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getSessionsByUser>>[number]>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title="My sessions" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
