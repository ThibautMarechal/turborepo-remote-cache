import type { Event } from '@prisma/client';
import { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';
import type { SourceType } from '~/types/vercel/turborepo';
import { EventType } from '~/types/vercel/turborepo';
import { client } from './prismaClient.server';
import { validate } from 'uuid';

export async function insertEvents(events: Omit<Event, 'id' | 'creationDate'>[]) {
  return await client.event.createMany({ data: events });
}

export async function getEvents() {
  return await client.event.findMany();
}

export async function getEvent(id: string) {
  return await client.event.findUnique({
    where: {
      id,
    },
  });
}

export async function getEventDetail(id: string) {
  return await client.event.findUnique({
    where: {
      id,
    },
    include: {
      session: {
        include: {
          events: true,
          team: true,
          user: true,
        },
      },
    },
  });
}

export type TimeSavedByMonth = { timeSaved: number; month: number; year: number };

export async function getTimeSavedByMonth(sourceType: SourceType, { userId, teamId }: { userId?: string; teamId?: string } = {}) {
  // We use queryRaw because Prisma doesn't support grouping by month.

  invariant(!userId || validate(userId), 'userId is not a valid uuid');
  invariant(!teamId || validate(teamId), 'teamId is not a valid uuid');

  const conditions: string[] = [
    `"${Prisma.EventScalarFieldEnum.eventType}" = '${EventType.HIT}'`,
    `"${Prisma.EventScalarFieldEnum.sourceType}" = '${sourceType}'`,
    !userId
      ? ''
      : `"${Prisma.EventScalarFieldEnum.id}" IN (
  SELECT "${Prisma.ModelName.Event}"."${Prisma.SessionScalarFieldEnum.id}"
  FROM "${Prisma.ModelName.Event}" 
  INNER JOIN "${Prisma.ModelName.Session}" AS "${Prisma.ModelName.Session}" ON ("${Prisma.ModelName.Session}"."${Prisma.EventScalarFieldEnum.id}") = ("${Prisma.ModelName.Event}"."${Prisma.EventScalarFieldEnum.sessionId}") 
  WHERE "${Prisma.SessionScalarFieldEnum.userId}" = '${userId}'
)
          `,
    !teamId
      ? ''
      : `"${Prisma.EventScalarFieldEnum.id}" IN (
  SELECT "${Prisma.ModelName.Event}"."${Prisma.SessionScalarFieldEnum.id}"
  FROM "${Prisma.ModelName.Event}" 
  INNER JOIN "${Prisma.ModelName.Session}" AS "${Prisma.ModelName.Session}" ON ("${Prisma.ModelName.Session}"."${Prisma.EventScalarFieldEnum.id}") = ("${Prisma.ModelName.Event}"."${Prisma.EventScalarFieldEnum.sessionId}") 
  WHERE "${Prisma.SessionScalarFieldEnum.teamId}" = '${teamId}'
)`,
  ].filter(Boolean);

  const query = `
SELECT
  SUM("${Prisma.EventScalarFieldEnum.duration}") as "timeSaved",
  extract(month from "${Prisma.EventScalarFieldEnum.creationDate}") as month,
  extract(year from "${Prisma.EventScalarFieldEnum.creationDate}") as year
FROM "${Prisma.ModelName.Event}"
WHERE ${conditions.join('\nAND ')}
GROUP BY month, year
ORDER BY year ASC, month ASC;
`;
  return await client.$queryRawUnsafe<TimeSavedByMonth[]>(query);
}
