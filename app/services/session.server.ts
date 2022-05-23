import type { Session } from '@prisma/client';
import { client } from './prismaClient.server';

export async function upsertSession(session: Omit<Session, 'creationDate'>) {
  try {
    await client.$connect();
    await client.session.upsert({
      update: session,
      create: session,
      where: {
        id: session.id,
      },
    });
  } finally {
    await client.$disconnect();
  }
}
