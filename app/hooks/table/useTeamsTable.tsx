import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Team } from '@prisma/client';
import { Form, Link } from 'remix';
import DateCell from '~/component/DateCell';
import { createTable } from '@tanstack/react-table';

import SearchIcon from '@heroicons/react/outline/SearchIcon';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import HasRights from '~/component/HasRights';
import { requireTeamOwner } from '~/roles/rights';

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
  table.createDataColumn((team) => team, {
    id: 'actions',
    enableSorting: false,
    cell: ({ getValue }) => {
      const team = getValue();
      return (
        <div className="flex gap-1">
          <Link to={`/teams/${team.slug}`} prefetch="intent" className="btn btn-xs btn-square">
            <SearchIcon className="h-4 w-4" />
          </Link>
          <HasRights predicate={(u) => requireTeamOwner(u, team.id)}>
            <Link to={`/teams/${team.slug}/edit`} prefetch="intent" className="btn btn-xs btn-square">
              <PencilIcon className="h-4 w-4" />
            </Link>
            <Form method="post" className="h-6">
              <button className="btn btn-xs btn-square">
                <TrashIcon className="h-4 w-4" />
              </button>
              <input name="id" value={team.id} type="hidden" />
            </Form>
          </HasRights>
        </div>
      );
    },
  }),
];
export const useTeamsTable = (data: Team[], count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
