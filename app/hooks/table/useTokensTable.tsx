import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { Token, User } from '@prisma/client';
import { createColumnHelper } from '@tanstack/react-table';
import { Form, useTransition } from '@remix-run/react';
import { DateCell } from '~/component/DateCell';
import { UserCell } from '~/component/UserCell';
import cn from 'classnames';
import { usePaginateSortingTable } from './usePaginateSortingTable';

const columnHelper = createColumnHelper<Token & { user: User }>();

const defaultColumns = [
  columnHelper.accessor((token) => token.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  columnHelper.accessor((token) => token.name, {
    header: 'Name',
  }),
  columnHelper.accessor((token) => token.creationDate, {
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  columnHelper.accessor((token) => token.lastUsedDate, {
    header: 'Last used date',
    cell: ({ getValue }) => {
      const date = getValue();
      return date ? <DateCell date={date} /> : <div className="opacity-50">Never</div>;
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ row }) => {
      const { id } = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { state, submission } = useTransition();
      const isDeleting = state === 'submitting' && submission.formData.get('id') === id;

      return (
        <div className="flex">
          <Form method="post">
            <input name="id" value={id} type="hidden" />
            <button className={cn('btn btn-xs btn-square', { loading: isDeleting })}>{!isDeleting && <TrashIcon className="h-4 w-4" />}</button>
          </Form>
        </div>
      );
    },
  }),
];
export const useTokensTable = (data: Array<Token & { user: User }>, count: number) => usePaginateSortingTable({ data, columns: defaultColumns }, count);
