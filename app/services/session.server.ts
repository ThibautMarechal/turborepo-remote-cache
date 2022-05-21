import { Session } from '@prisma/client';
import { client } from './prismaClient.Server';

export async function upsertSession(session: Session) {
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
