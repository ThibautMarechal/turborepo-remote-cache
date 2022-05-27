import type { ActionFunction } from 'remix';
import { Form, Link, json, type LoaderFunction, useLoaderData, NavLink } from 'remix';

import { useTable } from 'react-table';
import { requireCookieAuth } from '~/services/authentication.server';
import type { Team } from '@prisma/client';
import { useMemo } from 'react';
import TrashIcon from '@heroicons/react/outline/TrashIcon';
import Table from '~/component/Table';
import { deleteTeam, getTeams } from '~/services/teams.server';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import DateCell from '~/component/DateCell';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return json(await getTeams());
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteTeam(formData.get('id') as string);
  return null;
};

export default function Users() {
  const teams = useLoaderData<Team[]>();
  const tableProps = useTable<Team>({
    data: teams,
    columns: useMemo(
      () => [
        {
          id: 'name',
          Header: 'Name',
          accessor: 'name',
        },
        {
          id: 'slug',
          Header: 'Slug',
          accessor: 'avatar',
        },
        {
          id: 'creationDate',
          Header: 'creation Date',
          accessor: 'creationDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'actions',
          accessor: 'id',
          Cell: ({ value }) => (
            <div className="flex h-6 gap-1">
              <Link to={`./${value}`} prefetch="intent" className="btn btn-xs">
                <SearchIcon className="h-4 w-4" />
              </Link>
              <Link to={`./${value}/edit`} prefetch="intent" className="btn btn-xs">
                <PencilIcon className="h-4 w-4" />
              </Link>
              <Form method="post" className="h-6">
                <button className="btn btn-xs">
                  <TrashIcon className="h-4 w-4" />
                </button>
                <input name="id" value={value} type="hidden" />
              </Form>
            </div>
          ),
        },
      ],
      [],
    ),
    getRowId: (user) => user.id,
  });
  return (
    <div>
      <NavLink to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5" style={({ isActive }) => (isActive ? { display: 'none' } : {})}>
        +
      </NavLink>
      <div className="flex flex-row">
        <Table {...tableProps} />
      </div>
    </div>
  );
}
