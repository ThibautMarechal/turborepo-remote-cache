import type { User } from '@prisma/client';
import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import {} from '~/hooks/table/useArtifactsTable';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokensByUser, getTokensByUserCount } from '~/services/tokens.server';
import { getUser } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [user, tokens, count] = await Promise.all([
    getUser(params.id as string),
    getTokensByUser(params.id as string, skip, take, orderBy),
    getTokensByUserCount(params.id as string),
  ]);
  return {
    user,
    tokens,
    count,
  };
};

export default function Tokens() {
  const { user, tokens, count } = useLoaderData<{ tokens: Awaited<ReturnType<typeof getTokensByUser>>; count: number; user: User }>();
  const tableProps = useTokensTable(tokens);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title={`${user.name}'s token`} count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={tokens.length} />
    </>
  );
}
