import type { Session } from '@prisma/client';
import { DEFAULT_ORDER_BY, type OrderBy } from '~/utils/sort';
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
  return client.session.upsert({
    update: session,
    create: session,
    where: {
      id: session.id,
    },
  });
}

export async function getSessionsCount({ userId, teamId }: { userId?: string; teamId?: string } = {}) {
  return await client.session.count({
    where: {
      userId,
      teamId,
    },
  });
}

export async function getSessions({ userId, teamId, skip, take, orderBy }: { userId?: string; teamId?: string; skip: number; take: number; orderBy: OrderBy[] }) {
  return await client.session.findMany({
    orderBy: mapOrderBy(orderBy.length ? orderBy : DEFAULT_ORDER_BY),
    where: {
      userId,
      teamId,
    },
    include: {
      events: true,
      team: true,
      user: true,
    },
    skip,
    take,
  });
}
