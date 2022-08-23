import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { User } from '@prisma/client';
import { Form, Link, useTransition } from '@remix-run/react';
import DateCell from '~/component/DateCell';
import { createColumnHelper } from '@tanstack/react-table';
import Gravatar from 'react-gravatar';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import cn from 'classnames';
import HasRights from '~/component/HasRights';
import { isAdmin } from '~/roles/rights';

const columnHelper = createColumnHelper<User>();

const defaultColumns = [
  columnHelper.accessor('email', {
    header: '',
    enableSorting: false,
    cell: ({ getValue }) => <Gravatar className="rounded-full w-6 h-6" email={getValue()} />,
  }),
  columnHelper.accessor((user) => user.name, {
    id: 'name',
    header: 'Name',
  }),
  columnHelper.accessor((user) => user.username, {
    id: 'username',
    header: 'Username',
  }),
  columnHelper.accessor((user) => user.role, {
    id: 'role',
    header: 'Role',
  }),
  columnHelper.accessor((user) => user.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
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
    },
  }),
];

export const useUsersTable = (data: User[], count: number) => usePaginateSortingTable({ data, columns: defaultColumns }, count);
