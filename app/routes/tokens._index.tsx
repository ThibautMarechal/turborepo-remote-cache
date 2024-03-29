import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { TablePage } from '~/component/TablePage';
import { useTokensTable } from '~/hooks/table/useTokensTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireAdmin } from '~/roles/rights';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, getTokensCount, revokeToken } from '~/services/tokens.server';
import type { TokenDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getTokens({ skip, take, orderBy }), getTokensCount()]);
  return json({ items, count });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const formData = await request.formData();
  await revokeToken(formData.get('id') as string);
  return null;
};

export default function Tokens() {
  const { items, count } = useTablePageLoaderData<TokenDetail>();
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
