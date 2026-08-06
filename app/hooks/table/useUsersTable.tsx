import type { User } from '@prisma/client';
import DateCell from '~/component/DateCell';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { appTableFeatures, type AppTableFeatures } from './tableFeatures';
import Gravatar from 'react-gravatar';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import { usePaginateSortingTable } from './usePaginateSortingTable';

export const columnHelper = createColumnHelper<AppTableFeatures, User>();

const defaultColumns: ColumnDef<AppTableFeatures, User, any>[] = [
  columnHelper.accessor((user) => user.isExternal, {
    id: 'isExternal',
    header: '',
    enableSorting: true,
    cell: ({ getValue }) => (getValue() ? <ArrowTopRightOnSquareIcon className="h-4 w-4" /> : null),
  }),
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
  columnHelper.accessor((user) => user.role, {
    id: 'role',
    header: 'Role',
  }),
  columnHelper.accessor((user) => user.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
];

export const useUsersTable = (data: User[], count: number, Actions?: React.ComponentType<{ resource: User }>) =>
  usePaginateSortingTable({ data, columns: defaultColumns }, count, Actions);
