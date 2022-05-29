import { type LoaderFunction, type ActionFunction, NavLink } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUsers, getUsersCount } from '~/services/users.server';
import type { User } from '@prisma/client';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import PlusIcon from '@heroicons/react/outline/PlusIcon';
import { getOrderByFromRequest } from '~/utils/sort';
import { getPaginationFromRequest } from '~/utils/pagination';
import TablePage from '~/component/TablePage';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getUsers(skip, take, orderBy), getUsersCount()]);
  return { items, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteUser(formData.get('id') as string);
  return null;
};

export default function Users() {
  const { items, count } = useTablePageLoaderData<User>();
  const { tableProps, paginationProps } = useUsersTable(items, count);
  return (
    <>
      <TablePage title="Users" count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <NavLink to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
        <PlusIcon className="w-8" />
      </NavLink>
    </>
  );
}
