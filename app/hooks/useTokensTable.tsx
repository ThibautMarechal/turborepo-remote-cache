import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Token, User } from '@prisma/client';
import { useMemo } from 'react';
import { useTable } from 'react-table';
import { Form } from 'remix';
import DateCell from '~/component/DateCell';
import UserCell from '~/component/UserCell';

export const useTokensTable = (data: Array<Token & { user: User }>) =>
  useTable<typeof data[number]>({
    data,
    columns: useMemo(
      () => [
        {
          id: 'user',
          Header: 'User',
          accessor: 'user',
          Cell: ({ value }) => <UserCell user={value} />,
        },
        {
          id: 'name',
          Header: 'Name',
          accessor: 'name',
        },
        {
          id: 'creationDate',
          Header: 'Creation date',
          accessor: 'creationDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'lastUsedDate',
          Header: 'Last used date',
          accessor: 'lastUsedDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'actions',
          accessor: 'id',
          Cell: ({ value }) => (
            <div className="flex">
              <Form method="post">
                <input name="id" value={value} type="hidden" />
                <button className="btn btn-xs">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </Form>
            </div>
          ),
        },
      ],
      [],
    ),
  });
