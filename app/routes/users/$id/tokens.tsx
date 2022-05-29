import type { User } from '@prisma/client';
import { type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokensByUser, getTokensByUserCount } from '~/services/tokens.server';
import { getUser } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [user, items, count] = await Promise.all([
    getUser(params.id as string),
    getTokensByUser(params.id as string, skip, take, orderBy),
    getTokensByUserCount(params.id as string),
  ]);
  return {
    user,
    items,
    count,
  };
};

export default function Tokens() {
  const { user, items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getTokensByUser>>[number], { user: User }>();
  const { paginationProps, tableProps } = useTokensTable(items, count);
  return <TablePage title={`${user.name}'s token`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
