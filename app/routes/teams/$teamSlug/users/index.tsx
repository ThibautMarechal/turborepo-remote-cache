import PlusIcon from '@heroicons/react/outline/PlusIcon';
import type { Team, User } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { Link } from '@remix-run/react';
import HasRights from '~/component/HasRights';
import { TablePage } from '~/component/TablePage';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { isTeamOwner, requireTeamOwner } from '~/roles/rights';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeamBySlug, removeUserFromTeam } from '~/services/teams.server';
import { getUsersByTeam, getUsersByTeamCount } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  const { take, skip } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getUsersByTeam(team.id as string, skip, take, orderBy), getUsersByTeamCount(team.id as string)]);
  return json({
    items,
    team,
    count,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  const formData = await request.formData();
  await removeUserFromTeam(team.id as string, formData.get('id') as string);
  return null;
};

export default function Users() {
  const { items, team, count } = useTablePageLoaderData<User, { team: Team }>();
  const { tableProps, paginationProps } = useUsersTable(items, count);
  return (
    <>
      <TablePage title={`${team.name}'s users`} count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <HasRights predicate={(u) => isTeamOwner(u, team.id)}>
        <Link to="./add" className="btn btn-circle btn-primary fixed bottom-5 right-5">
          <PlusIcon className="w-8" />
        </Link>
      </HasRights>
    </>
  );
}
