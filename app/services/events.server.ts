import type { Event } from '@prisma/client';
import { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';
import type { SourceType } from '~/types/vercel/turborepo';
import { EventType } from '~/types/vercel/turborepo';
import { client } from './prismaClient.server';
import { validate } from 'uuid';
import { number } from 'prop-types';

export async function insertEvents(events: Omit<Event, 'id' | 'creationDate'>[]) {
  try {
    await client.$connect();
    return await client.event.createMany({ data: events });
  } finally {
    await client.$disconnect();
  }
}

export async function getEvents() {
  try {
    await client.$connect();
    return await client.event.findMany();
  } finally {
    await client.$disconnect();
  }
}

export async function getEvent(id: string) {
  try {
    await client.$connect();
    return await client.event.findUnique({
      where: {
        id,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getEventDetail(id: string) {
  try {
    await client.$connect();
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
  } finally {
    await client.$disconnect();
  }
}

export type TimeSavedByMonth = { timeSaved: number; month: number; year: number };

export async function getTimeSavedByMonth(sourceType: SourceType, { userId, teamId }: { userId?: string; teamId?: string } = {}) {
  // We use queryRaw because Prisma doesn't support grouping by month.
  try {
    await client.$connect();

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
GROUP BY month, year;
`;
    return await client.$queryRawUnsafe<TimeSavedByMonth[]>(query);
  } finally {
    await client.$disconnect();
  }
}
