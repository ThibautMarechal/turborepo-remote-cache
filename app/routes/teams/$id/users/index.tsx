import PlusIcon from '@heroicons/react/outline/PlusIcon';
import type { Team, User } from '@prisma/client';
import type { ActionFunction } from 'remix';
import { Link, type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeam, removeUserFromTeam } from '~/services/teams.server';
import { getUsersByTeam, getUsersByTeamCount } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { take, skip } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [team, items, count] = await Promise.all([
    getTeam(params.id as string),
    getUsersByTeam(params.id as string, skip, take, orderBy),
    getUsersByTeamCount(params.id as string),
  ]);
  return {
    items,
    team,
    count,
  };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await removeUserFromTeam(params.id as string, formData.get('id') as string);
  return null;
};

export default function Users() {
  const { items, team, count } = useTablePageLoaderData<User, { team: Team }>();
  const { tableProps, paginationProps } = useUsersTable(items, count);
  return (
    <>
      <TablePage title={`${team.name}'s users`} count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <Link to="./add" className="btn btn-circle btn-primary fixed bottom-5 right-5">
        <PlusIcon className="w-8" />
      </Link>
    </>
  );
}
