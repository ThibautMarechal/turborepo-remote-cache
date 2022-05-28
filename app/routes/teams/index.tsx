import type { ActionFunction } from 'remix';
import { type LoaderFunction, useLoaderData, NavLink } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import type { Team } from '@prisma/client';
import Table from '~/component/Table';
import { deleteTeam, getTeams, getTeamsCount } from '~/services/teams.server';
import { useTeamsTable } from '~/hooks/table/useTeamsTable';
import ListTitle from '~/component/ListTitle';
import PlusIcon from '@heroicons/react/outline/PlusIcon';
import Pagination from '~/component/Pagination';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [teams, count] = await Promise.all([getTeams(skip, take, orderBy), getTeamsCount()]);
  return { teams, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteTeam(formData.get('id') as string);
  return null;
};

export default function Teams() {
  const { teams, count } = useLoaderData<{ teams: Team[]; count: number }>();
  const tableProps = useTeamsTable(teams);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title="Teams" count={count} />
      <Table {...tableProps} />
      <NavLink to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5" style={({ isActive }) => (isActive ? { display: 'none' } : {})}>
        <PlusIcon className="w-8" />
      </NavLink>
      <Pagination {...paginationProps} count={count} currentPageCount={teams.length} />
    </>
  );
}
