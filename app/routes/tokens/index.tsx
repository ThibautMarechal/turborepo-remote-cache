import PlusIcon from '@heroicons/react/outline/PlusIcon';
import type { ActionFunction, LoaderFunction } from 'remix';
import { Link } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, getTokensCount, revokeToken } from '~/services/tokens.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getTokens(skip, take, orderBy), getTokensCount()]);
  return { items, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await revokeToken(formData.get('id') as string);
  return null;
};

export default function Tokens() {
  const { items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getTokens>>[number]>();
  const { paginationProps, tableProps } = useTokensTable(items, count);
  return (
    <>
      <TablePage title="All tokens" count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <Link to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
        <PlusIcon className="w-8" />
      </Link>
    </>
  );
}
