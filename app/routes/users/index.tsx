import { type LoaderFunction, type ActionFunction, Link } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUser, getUsers, getUsersCount } from '~/services/users.server';
import type { User } from '@prisma/client';
import { useUsersTable } from '~/hooks/table/useUsersTable';
import PlusIcon from '@heroicons/react/outline/PlusIcon';
import { getOrderByFromRequest } from '~/utils/sort';
import { getPaginationFromRequest } from '~/utils/pagination';
import TablePage from '~/component/TablePage';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import HasRights from '~/component/HasRights';
import { requireAdmin } from '~/roles/rights';
import { getSearchFromRequest } from '~/utils/search';
import { forbidden } from '~/utils/response';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const search = getSearchFromRequest(request);
  const [items, count] = await Promise.all([getUsers(skip, take, orderBy, search), getUsersCount()]);
  return { items, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
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

export default function Users() {
  const { items, count } = useTablePageLoaderData<User>();
  const { tableProps, paginationProps } = useUsersTable(items, count);
  return (
    <>
      <TablePage title="Users" count={count} tableProps={tableProps} paginationProps={paginationProps} searchable />
      <HasRights predicate={(u) => requireAdmin(u)}>
        <Link to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
          <PlusIcon className="w-8" />
        </Link>
      </HasRights>
    </>
  );
}
