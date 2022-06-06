import TrashIcon from '@heroicons/react/outline/TrashIcon';
import DownloadIcon from '@heroicons/react/outline/DownloadIcon';
import type { Artifact, Team, User } from '@prisma/client';
import { Form, useTransition } from 'remix';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { createTable } from '@tanstack/react-table';

import { formatDuration, formatSize } from '~/utils/intl';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import HasRights from '~/component/HasRights';
import type { ActionSubmission } from '@remix-run/react/transition';
import cn from 'classnames';
import { requireAdmin } from '~/roles/rights';

const table = createTable().setRowType<Artifact & { user: User; team: Team | null }>();

const defaultColumns = [
  table.createDataColumn((artifact) => artifact.team, {
    id: 'team',
    header: 'Team',
    cell: ({ getValue }) => {
      const team = getValue();
      return team ? <TeamCell team={team} /> : <div className="opacity-50">No Team</div>;
    },
  }),
  table.createDataColumn((artifact) => artifact.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  table.createDataColumn((artifact) => artifact.duration, {
    id: 'duration',
    header: 'Duration',
    cell: ({ getValue }) => formatDuration(getValue()),
  }),
  table.createDataColumn((artifact) => artifact.contentLength, {
    id: 'contentLength',
    header: 'Size',
    cell: ({ getValue }) => formatSize(getValue()),
  }),
  table.createDataColumn((artifact) => artifact.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((artifact) => artifact.lastHitDate, {
    id: 'lastHitDate',
    header: 'Last hit date',
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? <DateCell date={value} /> : <div className="opacity-50">Never</div>;
    },
  }),
  table.createDataColumn((artifact) => artifact.hitCount, {
    id: 'hitCount',
    header: 'Hit count',
  }),
  table.createDataColumn((artifact) => artifact.hitCount * artifact.duration, {
    id: 'timeSaved',
    header: 'Time saved',
    enableSorting: false,
    cell: ({ getValue }) => formatDuration(getValue()),
  }),
  table.createDataColumn((artifact) => artifact, {
    id: 'actions',
    enableSorting: false,
    cell: ({ getValue }) => {
      const artifact = getValue();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { state, submission } = useTransition();
      const isDeleting = state === 'submitting' && (submission as ActionSubmission).formData.get('id') === artifact.id;
      return (
        <div className="flex gap-1">
          {/* TODO rights based on route */}
          <HasRights predicate={(u) => requireAdmin(u)}>
            <Form method="post">
              <input name="id" value={artifact.id} type="hidden" />
              <button className={cn('btn btn-xs btn-square', { loading: isDeleting })}>{!isDeleting && <TrashIcon className="h-4 w-4" />}</button>
            </Form>
          </HasRights>
          <a className="btn btn-square btn-xs" href={`/turbo/api/v8/artifacts/${artifact.hash}`} download>
            <DownloadIcon className="h-4 w-4" />
          </a>
        </div>
      );
    },
  }),
];

export const useArtifactsTable = (data: Array<Artifact & { user: User; team: Team | null }>, count: number) => usePaginateSortingTable(table, defaultColumns, data, count);
