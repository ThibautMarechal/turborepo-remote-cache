import type { Session } from '@prisma/client';
import polly from 'polly-js';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';
import { client } from './prismaClient.server';

export function mapOrderBy(orderBy: OrderBy[]) {
  return orderBy.map((orderBy) => {
    const [[field, direction]] = Object.entries(orderBy);
    if (field === 'user') {
      return { user: { name: direction } };
    }
    if (field === 'team') {
      return { team: { name: direction } };
    }
    if (field === 'events') {
      return {
        events: {
          _count: direction,
        },
      };
    }
    return orderBy;
  });
}

export async function upsertSession(session: Omit<Session, 'creationDate'>) {
  try {
    await client.$connect();
    // https://github.com/prisma/prisma/issues/3242
    // Primsa don't use UPSERT query from postgres, it SELECT then use INSERT or UPDATE dependeing on the result.
    // We use polly to retry the query if the race condition occurs
    // We use 10 retry just to be sure (turbo can run 10 tasks in parrallel), but I doubt that we will retry more than 1 time.
    return polly()
      .retry(10)
      .executeForPromise(() =>
        client.session.upsert({
          update: session,
          create: session,
          where: {
            id: session.id,
          },
        }),
      );
  } finally {
    await client.$disconnect();
  }
}

export async function getSession(id: string) {
  try {
    await client.$connect();
    return await client.session.findUnique({
      where: {
        id,
      },
      include: {
        events: true,
        team: true,
        user: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessionsByUserCount(userId: string) {
  try {
    await client.$connect();
    return await client.session.count({
      where: {
        userId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessionsByTeamCount(teamId: string) {
  try {
    await client.$connect();
    return await client.session.count({
      where: {
        teamId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessionsCount() {
  try {
    await client.$connect();
    return await client.session.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getSessions(skip: number, take: number, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return await client.session.findMany({
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        events: true,
        team: true,
        user: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessionsByUser(userId: string, skip: number, take: number, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return await client.session.findMany({
      where: {
        userId,
      },
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        events: true,
        team: true,
        user: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessionsByTeam(teamId: string, skip: number, take: number, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return await client.session.findMany({
      where: {
        teamId,
      },
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        events: true,
        team: true,
        user: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}
