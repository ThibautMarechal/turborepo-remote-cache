import type { Event, Session, Team, User } from '@prisma/client';
import { useMemo } from 'react';
import { useTable } from 'react-table';
import DateCell from '~/component/DateCell';
import TeamCell from '~/component/TeamCell';
import UserCell from '~/component/UserCell';
import { EventType, SourceType } from '~/types/vercel/turborepo';
import { formatDuration } from '~/utils/intl';

export const useSessionsTable = (data: Array<Session & { user: User; team: Team | null; events: Event[] }>) =>
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
          id: 'creationDate',
          Header: 'Date',
          accessor: 'creationDate',
          Cell: ({ value }) => <DateCell date={value} />,
        },
        {
          id: 'events',
          Header: 'Events',
          accessor: 'events',
          Cell: ({ value }) => (
            <div>
              {value.reduce((acc, event) => {
                if (event.eventType === EventType.HIT) {
                  return acc + 1;
                }
                return acc;
              }, 0)}
            </div>
          ),
        },
        {
          id: 'hit-events',
          Header: 'Hit events',
          accessor: 'events',
          Cell: ({ value }) => (
            <div>
              {value.reduce((acc, event) => {
                if (event.eventType === EventType.HIT) {
                  return acc + 1;
                }
                return acc;
              }, 0)}
            </div>
          ),
        },
        {
          id: 'miss-events',
          Header: 'Miss events',
          accessor: 'events',
          Cell: ({ value }) => (
            <div>
              {value.reduce((acc, event) => {
                if (event.eventType === EventType.MISS) {
                  return acc + 1;
                }
                return acc;
              }, 0)}
            </div>
          ),
        },
        {
          id: 'local-saved',
          Header: 'Duration saved locally',
          accessor: 'events',
          Cell: ({ value }) => (
            <div>
              {formatDuration(
                value.reduce((acc, event) => {
                  if (event.eventType === EventType.HIT && event.sourceType === SourceType.LOCAL) {
                    return acc + event.duration;
                  }
                  return acc;
                }, 0),
              )}
            </div>
          ),
        },
        {
          id: 'remoate-saved',
          Header: 'Duration saved remotly',
          accessor: 'events',
          Cell: ({ value }) => (
            <div>
              {formatDuration(
                value.reduce((acc, event) => {
                  if (event.eventType === EventType.HIT && event.sourceType === SourceType.REMOTE) {
                    return acc + event.duration;
                  }
                  return acc;
                }, 0),
              )}
            </div>
          ),
        },
      ],
      [],
    ),
  });
