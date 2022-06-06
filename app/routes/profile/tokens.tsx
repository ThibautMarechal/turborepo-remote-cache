import type { ActionFunction } from 'remix';
import { type LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import { TablePage } from '~/component/TablePage';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, getTokensCount, revokeToken } from '~/services/tokens.server';
import type { TokenDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getTokens({ userId: user.id, skip, take, orderBy }), getTokensCount({ userId: user.id })]);
  return { items, count };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  const tokenId = formData.get('id')?.toString();
  invariant(typeof tokenId === 'string', 'tokenId must be a string');
  await revokeToken(tokenId);
  return null;
};

export default function Tokens() {
  const { items, count } = useTablePageLoaderData<TokenDetail>();
  const { paginationProps, tableProps } = useTokensTable(items, count);
  return <TablePage title="My tokens" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
