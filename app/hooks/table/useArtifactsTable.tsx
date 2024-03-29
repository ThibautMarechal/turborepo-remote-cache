import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import type { Artifact, Team, User } from '@prisma/client';
import { Form, useNavigation } from '@remix-run/react';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { createColumnHelper } from '@tanstack/react-table';
import { formatDuration, formatSize } from '~/utils/intl';
import { usePaginateSortingTable } from './usePaginateSortingTable';
import HasRights from '~/component/HasRights';
import cn from 'classnames';
import { isAdmin, isArtifactOwner } from '~/roles/rights';
import type { ArtifactDetail } from '~/types/prisma';

const columnHelper = createColumnHelper<ArtifactDetail>();

const defaultColumns = [
  columnHelper.accessor((artifact) => artifact.team, {
    id: 'team',
    header: 'Team',
    cell: ({ getValue }) => {
      const team = getValue();
      return team ? <TeamCell team={team} /> : <div className="opacity-50">No Team</div>;
    },
  }),
  columnHelper.accessor((artifact) => artifact.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  columnHelper.accessor((artifact) => artifact.duration, {
    id: 'duration',
    header: 'Duration',
    cell: ({ getValue }) => formatDuration(getValue() / 1000),
  }),
  columnHelper.accessor((artifact) => artifact.contentLength, {
    id: 'contentLength',
    header: 'Size',
    cell: ({ getValue }) => formatSize(getValue()),
  }),
  columnHelper.accessor((artifact) => artifact.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  columnHelper.accessor((artifact) => artifact.lastHitDate, {
    id: 'lastHitDate',
    header: 'Last hit date',
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? <DateCell date={value} /> : <div className="opacity-50">Never</div>;
    },
  }),
  columnHelper.accessor((artifact) => artifact.hitCount, {
    id: 'hitCount',
    header: 'Hit count',
  }),
  columnHelper.accessor((artifact) => artifact.hitCount * artifact.duration, {
    id: 'timeSaved',
    header: 'Time saved',
    enableSorting: false,
    cell: ({ getValue }) => formatDuration(getValue() / 1000),
  }),
  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => <ArtifactActions artifact={row.original} />,
  }),
];

const ArtifactActions = ({ artifact }: { artifact: ArtifactDetail }) => {
  const { state, formData } = useNavigation();
  const isDeleting = state === 'submitting' && formData?.get('id') === artifact.id;
  return (
    <div className="flex gap-1">
      <HasRights predicate={(u) => isAdmin(u) || isArtifactOwner(u, artifact)}>
        <Form method="post">
          <input name="id" value={artifact.id} type="hidden" />
          <button className={cn('btn btn-xs btn-outline btn-square', { loading: isDeleting })}>{!isDeleting && <TrashIcon className="w-4 h-4" />}</button>
        </Form>
      </HasRights>
      <a className="btn btn-square btn-xs btn-outline" href={`/turbo/api/v8/artifacts/${artifact.hash}`} download>
        <ArrowDownTrayIcon className="w-4 h-4" />
      </a>
    </div>
  );
};

export const useArtifactsTable = (data: Array<Artifact & { user: User; team: Team | null }>, count: number) => usePaginateSortingTable({ data, columns: defaultColumns }, count);
