import type { Event, Session, Team, User } from '@prisma/client';
import { createColumnHelper } from '@tanstack/react-table';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { EventType, SourceType } from '~/types/vercel/turborepo';
import { formatDuration } from '~/utils/intl';
import { usePaginateSortingTable } from './usePaginateSortingTable';

const columnHelper = createColumnHelper<Session & { user: User; team: Team | null; events: Event[] }>();

const defaultColumns = [
  columnHelper.accessor((session) => session.team, {
    header: 'Team',
    cell: ({ getValue }) => {
      const team = getValue();
      return team ? <TeamCell team={team} /> : <div className="opacity-50">No Team</div>;
    },
  }),
  columnHelper.accessor((session) => session.user, {
    id: 'user',
    header: 'User',
    cell: ({ getValue }) => <UserCell user={getValue()} />,
  }),
  columnHelper.accessor((session) => session.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  columnHelper.accessor((session) => session.events.length, {
    id: 'events',
    header: 'Events',
  }),
  columnHelper.accessor((session) => session.events.filter((event) => event.eventType === EventType.HIT).length, {
    header: 'Hit events',
    enableSorting: false,
  }),
  columnHelper.accessor((session) => session.events.filter((event) => event.eventType === EventType.MISS).length, {
    header: 'Miss events',
    enableSorting: false,
  }),
  columnHelper.accessor(
    (session) => session.events.filter((event) => event.eventType === EventType.HIT && event.sourceType === SourceType.LOCAL).reduce((acc, event) => acc + event.duration, 0),
    {
      id: 'local-saved',
      header: 'Duration saved locally',
      enableSorting: false,
      cell: ({ getValue }) => formatDuration(getValue()),
    },
  ),
  columnHelper.accessor(
    (session) => session.events.filter((event) => event.eventType === EventType.HIT && event.sourceType === SourceType.REMOTE).reduce((acc, event) => acc + event.duration, 0),
    {
      id: 'remote-saved',
      header: 'Duration saved remotely',
      enableSorting: false,
      cell: ({ getValue }) => formatDuration(getValue()),
    },
  ),
];
export const useSessionsTable = (data: Array<Session & { user: User; team: Team | null; events: Event[] }>, count: number) =>
  usePaginateSortingTable({ data, columns: defaultColumns }, count);
