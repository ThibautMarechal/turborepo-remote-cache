import type { ActionFunction } from 'remix';
import { json, type LoaderFunction, useLoaderData } from 'remix';
import { useTable } from 'react-table';
import { requireCookieAuth } from '~/services/authentication.server';
import { createUser, deleteUser, getUsers } from '~/services/users.server';
import type { User } from '@prisma/client';
import { useId, useMemo } from 'react';
import Modal from '~/component/Modal';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return json(await getUsers());
};

const actions = {
  DELETE: 'DELETE',
  CREATE: 'CREATE',
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  switch (formData.get('_action')) {
    case actions.CREATE:
      await createUser(
        {
          name: formData.get('name') as string,
          username: formData.get('username') as string,
          email: formData.get('email') as string,
        },
        formData.get('password') as string,
      );
      break;
    case actions.DELETE:
      await deleteUser(formData.get('id') as string);
      break;
    default:
      break;
  }
  return json(await getUsers());
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
  const modalId = useId();

  return (
    <div>
      <Modal.Opener id={modalId} className="btn btn-circle btn-primary fixed bottom-5 right-5">
        +
      </Modal.Opener>
      <Modal id={modalId}>
        <form method="POST">
          <h2>Create a new user</h2>
          <input name="_action" value={actions.CREATE} type="hidden" />
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input type="text" name="username" required autoFocus className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input type="text" name="name" required className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input type="email" name="email" required className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input type="password" name="password" required className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full mt-3">
            <button className="btn btn-primary">Log In</button>
          </div>
        </form>
      </Modal>
      <table {...getTableProps()} className="table table-zebra w-full">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
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
  );
}
