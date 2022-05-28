import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Token, User } from '@prisma/client';
import { createTable } from '@tanstack/react-table';
import { Form } from 'remix';
import DateCell from '~/component/DateCell';
import UserCell from '~/component/UserCell';
import { useSortingTable } from './useSortingTable';

const table = createTable().setRowType<Token & { user: User }>();
const defaultColumns = [
  table.createDataColumn((token) => token.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  table.createDataColumn((token) => token.name, {
    id: 'name',
    header: 'Name',
  }),
  table.createDataColumn((token) => token.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((token) => token.lastUsedDate, {
    id: 'lastUsedDate',
    header: 'Last used date',
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? <DateCell date={date} /> : <div className="opacity-50">Never</div>;
    },
  }),
  table.createDataColumn((token) => token.id, {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ getValue }) => (
      <div className="flex">
        <Form method="post">
          <input name="id" value={getValue()} type="hidden" />
          <button className="btn btn-xs">
            <TrashIcon className="h-4 w-4" />
          </button>
        </Form>
      </div>
    ),
  }),
];
export const useTokensTable = (data: Array<Token & { user: User }>) => useSortingTable(table, defaultColumns, data);
