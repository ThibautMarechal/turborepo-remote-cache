import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { User } from '@prisma/client';
import { Form, Link } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';

import * as React from 'react';
import Gravatar from 'react-gravatar';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { useSortingTable } from './useSortingTable';

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
    cell: ({ getValue }) => (
      <div className="flex gap-1">
        <Link to={`./${getValue()}`} prefetch="intent" className="btn btn-xs">
          <SearchIcon className="h-4 w-4" />
        </Link>
        <Link to={`./${getValue()}/edit`} prefetch="intent" className="btn btn-xs">
          <PencilIcon className="h-4 w-4" />
        </Link>
        <Form method="post">
          <button className="btn btn-xs">
            <TrashIcon className="h-4 w-4" />
          </button>
          <input name="id" value={getValue()} type="hidden" />
        </Form>
      </div>
    ),
  }),
];
export const useUsersTable = (data: User[]) => useSortingTable(table, defaultColumns, data);
