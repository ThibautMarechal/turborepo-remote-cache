import type { Team } from '~/types/Team';
import { client } from './prismaClient.Server';

export async function getTeams(): Promise<Team[]> {
  try {
    await client.$connect();
    return await client.team.findMany();
  } finally {
    await client.$disconnect();
  }
}

export async function getUserTeams(userId: string, limit: number = 100, since = new Date(Date.UTC(0, 0, 0)), until = new Date(Date.UTC(3000, 0, 0))): Promise<Team[]> {
  try {
    await client.$connect();
    return await client.team.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
        AND: {
          createdAt: {
            gt: since,
          },
          AND: {
            createdAt: {
              lt: until,
            },
          },
        },
      },
      take: limit,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTeam(id: string): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.findUnique({ where: { id } });
  } finally {
    await client.$disconnect();
  }
}
