import DateCell from '~/component/DateCell';
import { createColumnHelper } from '@tanstack/react-table';
import Gravatar from 'react-gravatar';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import type { UserDetail } from '~/types/prisma';
import type { Team } from '@prisma/client';
import React from 'react';

export const columnHelper = createColumnHelper<UserDetail>();

const getDefaultColumns = (team: Team) => [
  columnHelper.accessor((user) => user.email, {
    id: 'email',
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
  columnHelper.accessor((user) => user.memberships.find((membership) => membership.teamId === team.id)?.role, {
    id: 'teamRole',
    header: 'Team role',
  }),
  columnHelper.accessor((user) => user.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
];

export const useTeamUsersTable = (data: UserDetail[], count: number, team: Team, Actions?: React.ComponentType<{ resource: UserDetail }>) => {
  const columns = React.useMemo(() => getDefaultColumns(team), [team]);
  return usePaginateSortingTable({ data, columns }, count, Actions);
};
