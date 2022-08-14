import type { User } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { TablePage } from '~/component/TablePage';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireAdmin } from '~/roles/rights';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, getTokensCount } from '~/services/tokens.server';
import { getUserByUsername } from '~/services/users.server';
import type { TokenDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const user = await getUserByUsername(params.username as string);
  const [items, count] = await Promise.all([getTokens({ userId: user.id, skip, take, orderBy }), getTokensCount({ userId: user.id })]);
  return json({
    user,
    items,
    count,
  });
};

export default function Tokens() {
  const { user, items, count } = useTablePageLoaderData<TokenDetail, { user: User }>();
  const { paginationProps, tableProps } = useTokensTable(items, count);
  return <TablePage title={`${user.name}'s token`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
