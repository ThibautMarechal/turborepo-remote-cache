import { Prisma, type Event } from '@prisma/client';
import invariant from 'tiny-invariant';
import { EventType, type SourceType } from '~/types/vercel/turborepo';
import { client } from './prismaClient.server';
import { validate } from 'uuid';
import type { Decimal } from '@prisma/client/runtime/library';

export async function insertEvents(events: Omit<Event, 'id' | 'creationDate'>[]) {
  return await client.event.createMany({ data: events });
}

export async function getEvents() {
  return await client.event.findMany();
}

export async function getEvent(id: string) {
  return await client.event.findUniqueOrThrow({
    where: {
      id,
    },
  });
}

export async function getEventDetail(id: string) {
  return await client.event.findUniqueOrThrow({
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
  SUM("${Prisma.EventScalarFieldEnum.duration}") / 1000 as "timeSaved",
  extract(month from "${Prisma.EventScalarFieldEnum.creationDate}") as month,
  extract(year from "${Prisma.EventScalarFieldEnum.creationDate}") as year
FROM "${Prisma.ModelName.Event}"
WHERE ${conditions.join('\nAND ')}
GROUP BY month, year
ORDER BY year ASC, month ASC;
`;
  return await client
    .$queryRawUnsafe<
      Array<{
        timeSaved: bigint;
        month: Decimal;
        year: Decimal;
      }>
    >(query)
    .then((dbResult) => {
      const timeSavedStats = dbResult.map<TimeSavedByMonth>(({ timeSaved, month, year }) => ({
        timeSaved: Number(timeSaved),
        month: month.toNumber(),
        year: year.toNumber(),
      }));
      if (!timeSavedStats.length) {
        return timeSavedStats;
      }
      // Fill month value with no stats.
      // We could do it in the pg query (https://stackoverflow.com/questions/24156202/postgresql-group-month-wise-with-missing-values)
      // We also fill the blanks months from the years presents in our stats to have a better looking graph
      // eslint-disable-next-line prefer-destructuring
      const start = timeSavedStats[0];
      const end = timeSavedStats[timeSavedStats.length - 1];
      const startingYear = start.year;
      const endingYear = end.year;
      return new Array(endingYear - startingYear + 1)
        .fill(0)
        .map((_, i) => i + startingYear)
        .reduce<Array<TimeSavedByMonth>>((acc, year) => {
          for (const month of new Array(12).fill(0).map((_, i) => i + 1)) {
            const stat = timeSavedStats.find((existingStat) => existingStat.year === year && existingStat.month === month);
            acc.push(
              stat ?? {
                timeSaved: 0,
                month,
                year,
              },
            );
          }
          return acc;
        }, []);
    });
}
