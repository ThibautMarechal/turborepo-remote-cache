import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Team } from '@prisma/client';
import { Form, Link } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';

import * as React from 'react';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';

const table = createTable().setRowType<Team>();

const defaultColumns = [
  table.createDataColumn((artifact) => artifact.name, {
    id: 'name',
    header: 'Name',
  }),
  table.createDataColumn((artifact) => artifact.slug, {
    id: 'slug',
    header: 'Slug',
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
      <div className="flex h-6 gap-1">
        <Link to={`./${getValue()}`} prefetch="intent" className="btn btn-xs">
          <SearchIcon className="h-4 w-4" />
        </Link>
        <Link to={`./${getValue()}/edit`} prefetch="intent" className="btn btn-xs">
          <PencilIcon className="h-4 w-4" />
        </Link>
        <Form method="post" className="h-6">
          <button className="btn btn-xs">
            <TrashIcon className="h-4 w-4" />
          </button>
          <input name="id" value={getValue()} type="hidden" />
        </Form>
      </div>
    ),
  }),
];
export const useTeamsTable = (data: Team[], count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
