import type { ActionFunction } from 'remix';
import { Outlet, json, type LoaderFunction, useLoaderData } from 'remix';

import { useTable } from 'react-table';
import { requireCookieAuth } from '~/services/authentication.server';
import { deleteUser, getUsers } from '~/services/users.server';
import { formatDate } from '~/utils/intl';
import type { User } from '@prisma/client';
import { useMemo } from 'react';
import { NavLink, useMatch } from 'react-router-dom';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return json(await getUsers());
};

const actions = {
  DELETE: 'DELETE',
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  return await deleteUser(formData.get('id') as string);
};

export default function Users() {
  const users = useLoaderData<User[]>();
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<User>({
    data: users,
    columns: useMemo(
      () => [
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
          Cell: ({ value }) => <span>{formatDate(value as unknown as string)}</span>,
        },
        {
          id: 'delete',
          accessor: 'id',
          Cell: ({ value }) => (
            <form method="POST">
              <input name="_action" value={actions.DELETE} type="hidden" />
              <input name="id" value={value} type="hidden" />
              <button>X</button>
            </form>
          ),
        },
      ],
      [],
    ),
    getRowId: (user) => user.id,
  });
  console.log(headerGroups);
  console.log(rows);
  const isListUrl = useMatch('/users');
  return isListUrl ? (
    <div>
      <NavLink to="./new" className="btn btn-circle btn-primary fixed bottom-5 right-5" style={({ isActive }) => (isActive ? { display: 'none' } : {})}>
        +
      </NavLink>
      <div className="flex flex-row">
        <table {...getTableProps()} className="table table-zebra w-full flex-grow-5">
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} key={column.id}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} key={`${cell.row.id}_${cell.column.id}`}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Outlet />
  );
}
