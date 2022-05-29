import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { User } from '@prisma/client';
import { Form, Link, useTransition } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';

import * as React from 'react';
import Gravatar from 'react-gravatar';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import cn from 'classnames';
import type { ActionSubmission } from '@remix-run/react/transition';
import HasRights from '~/component/HasRights';

const table = createTable().setRowType<User>();

const defaultColumns = [
  table.createDataColumn((artifact) => artifact.email, {
    id: 'email',
    header: '',
    enableSorting: false,
    cell: ({ getValue }) => <Gravatar className="rounded-full w-6 h-6" email={getValue()} />,
  }),
  table.createDataColumn((artifact) => artifact.name, {
    id: 'name',
    header: 'Name',
  }),
  table.createDataColumn((artifact) => artifact.username, {
    id: 'username',
    header: 'Username',
  }),
  table.createDataColumn((artifact) => artifact.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((artifact) => artifact.id, {
    id: 'actions',
    enableSorting: false,
    cell: ({ getValue }) => {
      const id = getValue();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { state, submission } = useTransition();
      const isDeleting = state === 'submitting' && (submission as ActionSubmission).formData.get('id') === id;
      return (
        <div className="flex gap-1">
          <Link to={`/users/${getValue()}`} prefetch="intent" className="btn btn-xs btn-square">
            <SearchIcon className="h-4 w-4" />
          </Link>
          <HasRights predicate={(u) => u.isSuperAdmin}>
            <Link to={`/users/${getValue()}/edit`} prefetch="intent" className="btn btn-xs btn-square">
              <PencilIcon className="h-4 w-4" />
            </Link>
            <Form method="post">
              <button className={cn('btn btn-xs btn-square', { loading: isDeleting })}>{!isDeleting && <TrashIcon className="h-4 w-4" />}</button>
              <input name="id" value={id} type="hidden" />
            </Form>
          </HasRights>
        </div>
      );
    },
  }),
];

export const useUsersTable = (data: User[], count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
