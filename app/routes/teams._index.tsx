import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Link, useNavigate } from '@remix-run/react';
import { requireCookieAuth } from '~/services/authentication.server';
import type { Team } from '@prisma/client';
import { deleteTeam, getTeams, getTeamsCount } from '~/services/teams.server';
import { useTeamsTable } from '~/hooks/table/useTeamsTable';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { TablePage } from '~/component/TablePage';
import HasRights from '~/component/HasRights';
import { isAdmin } from '~/roles/rights';
import { getSearchFromRequest } from '~/utils/search';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const search = getSearchFromRequest(request);
  const [items, count] = await Promise.all([getTeams(skip, take, orderBy, search), getTeamsCount()]);
  return json({ items, count });
};

export const action: ActionFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteTeam(formData.get('id') as string);
  return null;
};

export default function Teams() {
  const { items, count } = useTablePageLoaderData<Team>();
  const navigate = useNavigate();
  const { tableProps, paginationProps } = useTeamsTable(items, count);
  return (
    <>
      <TablePage title="Teams" count={count} tableProps={tableProps} paginationProps={paginationProps} searchable onRowDoubleClick={(t) => navigate(`./${t.slug}`)} />
      <HasRights predicate={(u) => isAdmin(u)}>
        <Link to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
          <PlusIcon className="w-8" />
        </Link>
      </HasRights>
    </>
  );
}
