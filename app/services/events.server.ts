import type { Event } from '@prisma/client';
import type { SourceType } from '~/types/vercel/turborepo';
import { EventType } from '~/types/vercel/turborepo';
import { client } from './prismaClient.server';

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

export async function getTimeSaved(sourceType: SourceType, { userId, teamId }: { userId?: string; teamId?: string } = {}) {
  try {
    await client.$connect();
    const saved = await client.event.aggregate({
      where: {
        eventType: EventType.HIT,
        sourceType,
        session: {
          userId,
          teamId,
        },
      },
      _sum: {
        duration: true,
      },
    });
    return saved._sum.duration ?? 0;
  } finally {
    await client.$disconnect();
  }
}
