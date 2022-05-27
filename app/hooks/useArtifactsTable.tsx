import TrashIcon from '@heroicons/react/outline/TrashIcon';
import type { Artifact, Team, User } from '@prisma/client';
import { useMemo } from 'react';
import { useTable } from 'react-table';
import { Form } from 'remix';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { formatDuration, formatSize } from '~/utils/intl';

export const useArtifactsTable = (data: Array<Artifact & { user: User; team: Team | null }>) =>
  useTable<typeof data[number]>({
    data,
    columns: useMemo(
      () => [
        {
          id: 'team',
          Header: 'Team',
          accessor: 'team',
          Cell: ({ value }) => (value ? <TeamCell team={value} /> : <div className="opacity-50">No Team</div>),
        },
        {
          id: 'user',
          Header: 'User',
          accessor: 'user',
          Cell: ({ value }) => <UserCell user={value} />,
        },
        {
          id: 'duration',
          Header: 'Duration',
          accessor: 'duration',
          Cell: ({ value }) => <>{formatDuration(value)}</>,
        },
        {
          id: 'contentLength',
          Header: 'Size',
          accessor: 'contentLength',
          Cell: ({ value }) => <>{formatSize(value)}</>,
        },
        {
          id: 'creationDate',
          Header: 'Creation date',
          accessor: 'creationDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'lastHitDate',
          Header: 'Last hit date',
          accessor: 'lastHitDate',
          Cell: ({ value }) => (value ? <DateCell date={value} /> : <div className="opacity-50">Never</div>),
        },
        {
          id: 'hitCount',
          Header: 'hit count',
          accessor: 'hitCount',
        },
        {
          id: 'timeSaved',
          Header: 'Time saved',
          accessor: 'id',
          Cell: ({ row }) => <>{formatDuration(row.original.hitCount * row.original.duration)}</>,
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
