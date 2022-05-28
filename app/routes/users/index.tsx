import type { ActionFunction } from 'remix';
import { type LoaderFunction, useLoaderData, NavLink } from 'remix';

import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUsers, getUsersCount } from '~/services/users.server';
import type { User } from '@prisma/client';
import Table from '~/component/Table';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import ListTitle from '~/component/ListTitle';
import PlusIcon from '@heroicons/react/outline/PlusIcon';
import { getOrderByFromRequest } from '~/utils/sort';
import { getPaginationFromRequest } from '~/utils/pagination';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import Pagination from '~/component/Pagination';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [users, count] = await Promise.all([getUsers(skip, take, orderBy), getUsersCount()]);
  return { users, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteUser(formData.get('id') as string);
  return null;
};

export default function Users() {
  const { users, count } = useLoaderData<{ users: User[]; count: number }>();
  const tableProps = useUsersTable(users);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title="Users" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={users.length} />
      <NavLink to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5" style={({ isActive }) => (isActive ? { display: 'none' } : {})}>
        <PlusIcon className="w-8" />
      </NavLink>
    </>
  );
}
