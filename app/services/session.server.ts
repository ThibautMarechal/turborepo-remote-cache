import type { Session } from '@prisma/client';
import { client } from './prismaClient.server';

export async function upsertSession(session: Omit<Session, 'creationDate'>) {
  try {
    await client.$connect();
    return await client.session.upsert({
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

export async function getSessions(skip: number = 0, take: number = 10) {
  try {
    await client.$connect();
    return await client.session.findMany({
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
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

export async function getSessionsByUser(userId: string, skip: number = 0, take: number = 10) {
  try {
    await client.$connect();
    return await client.session.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
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

export async function getSessionsByTeam(teamId: string, skip: number = 0, take: number = 10) {
  try {
    await client.$connect();
    return await client.session.findMany({
      where: {
        teamId,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
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
