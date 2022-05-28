import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import {} from '~/hooks/table/useArtifactsTable';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, getTokensCount, revokeToken } from '~/services/tokens.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [tokens, count] = await Promise.all([getTokens(skip, take, orderBy), getTokensCount()]);
  return { tokens, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await revokeToken(formData.get('id') as string);
  return null;
};

export default function Tokens() {
  const { tokens, count } = useLoaderData<{ tokens: Awaited<ReturnType<typeof getTokens>>; count: number }>();
  const paginationProps = usePaginateSearchParams();
  const tableProps = useTokensTable(tokens);
  return (
    <>
      <ListTitle title="All tokens" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={tokens.length} />
    </>
  );
}
