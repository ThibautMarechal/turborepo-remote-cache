import type { Event, Session, Team, User } from '@prisma/client';
import { createTable } from '@tanstack/react-table';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { EventType, SourceType } from '~/types/vercel/turborepo';
import { formatDuration } from '~/utils/intl';
import { useSortingTable } from './useSortingTable';

const table = createTable().setRowType<Session & { user: User; team: Team | null; events: Event[] }>();

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
  table.createDataColumn((artifact) => artifact.creationDate, {
    id: 'creationDate',
    header: 'Creation date',
    cell: ({ getValue }) => <DateCell date={getValue()} />,
  }),
  table.createDataColumn((artifact) => artifact.events.length, {
    id: 'events',
    header: 'Events',
  }),
  table.createDataColumn((artifact) => artifact.events.filter((event) => event.eventType === EventType.HIT).length, {
    id: 'hit-events',
    header: 'Hit events',
    enableSorting: false,
  }),
  table.createDataColumn((artifact) => artifact.events.filter((event) => event.eventType === EventType.MISS).length, {
    id: 'miss-events',
    header: 'Miss events',
    enableSorting: false,
  }),
  table.createDataColumn(
    (artifact) => artifact.events.filter((event) => event.eventType === EventType.HIT && event.sourceType === SourceType.LOCAL).reduce((acc, event) => acc + event.duration, 0),
    {
      id: 'local-saved',
      header: 'Duration saved locally',
      enableSorting: false,
      cell: ({ getValue }) => formatDuration(getValue()),
    },
  ),
  table.createDataColumn(
    (artifact) => artifact.events.filter((event) => event.eventType === EventType.HIT && event.sourceType === SourceType.REMOTE).reduce((acc, event) => acc + event.duration, 0),
    {
      id: 'remote-saved',
      header: 'Duration saved remotely',
      enableSorting: false,
      cell: ({ getValue }) => formatDuration(getValue()),
    },
  ),
];
export const useSessionsTable = (data: Array<Session & { user: User; team: Team | null; events: Event[] }>) => useSortingTable(table, defaultColumns, data);
