import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokensByUser, getTokensByUserCount, revokeToken } from '~/services/tokens.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [tokens, count] = await Promise.all([getTokensByUser(user.id, skip, take, orderBy), getTokensByUserCount(user.id)]);
  return { tokens, count };
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
  const { tokens, count } = useLoaderData<{ tokens: Awaited<ReturnType<typeof getTokensByUser>>; count: number }>();
  const tableProps = useTokensTable(tokens);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title="My tokens" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={tokens.length} />
    </>
  );
}
