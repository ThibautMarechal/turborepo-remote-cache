import type { ActionFunction } from 'remix';
import { Form, Link, json, type LoaderFunction, useLoaderData, NavLink } from 'remix';

import { useTable } from 'react-table';
import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUsers } from '~/services/users.server';
import type { User } from '@prisma/client';
import TrashIcon from '@heroicons/react/outline/TrashIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import { useMemo } from 'react';
import Table from '~/component/Table';
import Gravatar from 'react-gravatar';
import DateCell from '~/component/DateCell';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return json(await getUsers());
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await deleteUser(formData.get('id') as string);
  return null;
};

export default function Users() {
  const users = useLoaderData<User[]>();
  const tableProps = useTable<User>({
    data: users,
    columns: useMemo(
      () => [
        {
          id: 'gravatar',
          accessor: 'email',
          Cell: ({ value }) => <Gravatar email={value} className="h-6 w-6 rounded-full" />,
        },
        {
          id: 'name',
          Header: 'Name',
          accessor: 'name',
        },
        {
          id: 'username',
          Header: 'Username',
          accessor: 'username',
        },
        {
          id: 'email',
          Header: 'Email',
          accessor: 'email',
        },
        {
          id: 'creationDate',
          Header: 'creationDate',
          accessor: 'creationDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'actions',
          accessor: 'id',
          Cell: ({ value }) => (
            <div className="flex gap-1">
              <Link to={`./${value}`} prefetch="intent" className="btn btn-xs">
                <SearchIcon className="h-4 w-4" />
              </Link>
              <Link to={`./${value}/edit`} prefetch="intent" className="btn btn-xs">
                <PencilIcon className="h-4 w-4" />
              </Link>
              <Form method="post">
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
