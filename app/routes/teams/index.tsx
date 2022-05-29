import { type LoaderFunction, type ActionFunction, Link } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import type { Team } from '@prisma/client';
import { deleteTeam, getTeams, getTeamsCount } from '~/services/teams.server';
import { useTeamsTable } from '~/hooks/table/useTeamsTable';
import PlusIcon from '@heroicons/react/outline/PlusIcon';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { TablePage } from '~/component/TablePage';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  const { skip, take } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getTeams(skip, take, orderBy), getTeamsCount()]);
  return { items, count };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteTeam(formData.get('id') as string);
  return null;
};

export default function Teams() {
  const { items, count } = useTablePageLoaderData<Team>();
  const { tableProps, paginationProps } = useTeamsTable(items, count);
  return (
    <>
      <TablePage title="Teams" count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <Link to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5">
        <PlusIcon className="w-8" />
      </Link>
    </>
  );
}
