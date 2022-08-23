import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { Team } from '@prisma/client';
import { Form, Link } from '@remix-run/react';
import DateCell from '~/component/DateCell';
import { createColumnHelper } from '@tanstack/react-table';

import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import HasRights from '~/component/HasRights';
import { requireTeamOwner } from '~/roles/rights';

const columnHelper = createColumnHelper<Team>();

const defaultColumns = [
  columnHelper.accessor((team) => team.name, {
    id: 'name',
    header: 'Name',
  }),
  columnHelper.accessor((team) => team.slug, {
    id: 'slug',
    header: 'Slug',
  }),

  columnHelper.accessor((team) => team.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const team = row.original;
      return (
        <div className="flex gap-1">
          <Link to={`/teams/${team.slug}`} prefetch="intent" className="btn btn-xs btn-square">
            <MagnifyingGlassIcon className="h-4 w-4" />
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
export const useTeamsTable = (data: Team[], count: number) => usePaginateSortingTable({ data, columns: defaultColumns }, count);
