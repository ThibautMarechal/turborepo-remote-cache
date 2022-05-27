import type { Event } from '@prisma/client';
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
