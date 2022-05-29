import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Team } from '@prisma/client';
import { Form, Link } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';

import * as React from 'react';
import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import HasRights from '~/component/HasRights';

const table = createTable().setRowType<Team>();

const defaultColumns = [
  table.createDataColumn((team) => team.name, {
    id: 'name',
    header: 'Name',
  }),
  table.createDataColumn((team) => team.slug, {
    id: 'slug',
    header: 'Slug',
  }),

  table.createDataColumn((team) => team.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((team) => team.id, {
    id: 'actions',
    enableSorting: false,
    cell: ({ getValue }) => {
      return (
        <div className="flex gap-1">
          <Link to={`/teams/${getValue()}`} prefetch="intent" className="btn btn-xs btn-square">
            <SearchIcon className="h-4 w-4" />
          </Link>
          <HasRights predicate={(u) => u.isSuperAdmin}>
            <Link to={`/teams/${getValue()}/edit`} prefetch="intent" className="btn btn-xs btn-square">
              <PencilIcon className="h-4 w-4" />
            </Link>
            <Form method="post" className="h-6">
              <button className="btn btn-xs btn-square">
                <TrashIcon className="h-4 w-4" />
              </button>
              <input name="id" value={getValue()} type="hidden" />
            </Form>
          </HasRights>
        </div>
      );
    },
  }),
];
export const useTeamsTable = (data: Team[], count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
