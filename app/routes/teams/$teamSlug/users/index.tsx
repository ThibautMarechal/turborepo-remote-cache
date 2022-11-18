import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { Team, User } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, Link, useTransition } from '@remix-run/react';
import HasRights from '~/component/HasRights';
import { TablePage } from '~/component/TablePage';
import { useCurrentUser } from '~/context/CurrentUser';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { isTeamOwner, requireTeamOwner } from '~/roles/rights';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeamBySlug, removeUserFromTeam } from '~/services/teams.server';
import { getUsersByTeam, getUsersByTeamCount } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';
import cn from 'classnames';
import { useTeamUsersTable } from '~/hooks/table/useTeamUsersTable';
import type { UserDetail } from '~/types/prisma';

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

export const UserActions = ({ resource: user }: { resource: User }) => {
  const { state, submission } = useTransition();
  const isRemoving = state === 'submitting' && submission.formData.get('id') === user.id;
  return (
    <div className="flex gap-1">
      <Form method="post">
        <button className={cn('btn btn-xs btn-square', { loading: isRemoving })} title="Remove user from team">
          {!isRemoving && <TrashIcon className="h-4 w-4" />}
        </button>
        <input name="id" value={user.id} type="hidden" />
      </Form>
    </div>
  );
};

export default function Users() {
  const { items, team, count } = useTablePageLoaderData<UserDetail, { team: Team }>();
  const currentUser = useCurrentUser();
  const { tableProps, paginationProps } = useTeamUsersTable(items, count, currentUser && isTeamOwner(currentUser, team.id) ? UserActions : undefined);
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
