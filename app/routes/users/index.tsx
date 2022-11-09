import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Form, Link, useTransition } from '@remix-run/react';
import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUser, getUsers, getUsersCount } from '~/services/users.server';
import type { User } from '@prisma/client';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { getOrderByFromRequest } from '~/utils/sort';
import { getPaginationFromRequest } from '~/utils/pagination';
import TablePage from '~/component/TablePage';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import HasRights from '~/component/HasRights';
import { isAdmin } from '~/roles/rights';
import { getSearchFromRequest } from '~/utils/search';
import { forbidden } from '~/utils/response';
import { json } from '~/utils/superjson';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import cn from 'classnames';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const search = getSearchFromRequest(request);
  const [items, count] = await Promise.all([getUsers(skip, take, orderBy, search), getUsersCount()]);
  return json({ items, count });
};

export const action: ActionFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  const userId = formData.get('id') as string;
  const user = await getUser(userId);
  if (user.isSuperAdmin) {
    throw forbidden('Cannot delete super-admin');
  }
  await deleteUser(userId);
  return null;
};

const UserActions = ({ resource: user }: { resource: User }) => {
  const { state, submission } = useTransition();
  const isDeleting = state === 'submitting' && submission.formData.get('id') === user.id;
  return (
    <div className="flex gap-1">
      <Link to={`/users/${user.username}`} prefetch="intent" title="Show user" className="btn btn-xs btn-square">
        <MagnifyingGlassIcon className="h-4 w-4" />
      </Link>
      <HasRights predicate={(u) => isAdmin(u) && !user.isSuperAdmin}>
        <Link to={`/users/${user.username}/edit`} prefetch="intent" title="Edit user" className="btn btn-xs btn-square">
          <PencilIcon className="h-4 w-4" />
        </Link>
        <Link to={`/users/${user.username}/change_password`} prefetch="intent" title="Change password" className="btn btn-xs btn-square">
          <KeyIcon className="h-4 w-4" />
        </Link>
        <Form method="post">
          <button className={cn('btn btn-xs btn-square', { loading: isDeleting })} title="Delete user">
            {!isDeleting && <TrashIcon className="h-4 w-4" />}
          </button>
          <input name="id" value={user.id} type="hidden" />
        </Form>
      </HasRights>
    </div>
  );
};

export default function Users() {
  const { items, count } = useTablePageLoaderData<User>();
  const { tableProps, paginationProps } = useUsersTable(items, count, UserActions);
  return (
    <>
      <TablePage title="Users" count={count} tableProps={tableProps} paginationProps={paginationProps} searchable />
      <HasRights predicate={(u) => isAdmin(u)}>
        <Link to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
          <PlusIcon className="w-8" />
        </Link>
      </HasRights>
    </>
  );
}
