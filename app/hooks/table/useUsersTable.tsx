import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { User } from '@prisma/client';
import { Form, Link, useTransition } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';
import Gravatar from 'react-gravatar';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import cn from 'classnames';
import type { ActionSubmission } from '@remix-run/react/transition';
import HasRights from '~/component/HasRights';
import { requireAdmin } from '~/roles/rights';

const table = createTable().setRowType<User>();

const defaultColumns = [
  table.createDataColumn((user) => user.email, {
    id: 'email',
    header: '',
    enableSorting: false,
    cell: ({ getValue }) => <Gravatar className="rounded-full w-6 h-6" email={getValue()} />,
  }),
  table.createDataColumn((user) => user.name, {
    id: 'name',
    header: 'Name',
  }),
  table.createDataColumn((user) => user.username, {
    id: 'username',
    header: 'Username',
  }),
  table.createDataColumn((user) => user.role, {
    id: 'role',
    header: 'Role',
  }),
  table.createDataColumn((user) => user.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((user) => user, {
    id: 'actions',
    enableSorting: false,
    cell: ({ getValue }) => {
      const user = getValue();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { state, submission } = useTransition();
      const isDeleting = state === 'submitting' && (submission as ActionSubmission).formData.get('id') === user.id;
      return (
        <div className="flex gap-1">
          <Link to={`/users/${user.username}`} prefetch="intent" className="btn btn-xs btn-square">
            <SearchIcon className="h-4 w-4" />
          </Link>
          <HasRights predicate={(u) => requireAdmin(u)}>
            <Link to={`/users/${user.username}/edit`} prefetch="intent" className="btn btn-xs btn-square">
              <PencilIcon className="h-4 w-4" />
            </Link>
          </HasRights>
          <HasRights predicate={(u) => requireAdmin(u) && !user.isSuperAdmin}>
            <Form method="post">
              <button className={cn('btn btn-xs btn-square', { loading: isDeleting })}>{!isDeleting && <TrashIcon className="h-4 w-4" />}</button>
              <input name="id" value={user.id} type="hidden" />
            </Form>
          </HasRights>
        </div>
      );
    },
  }),
];

export const useUsersTable = (data: User[], count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
