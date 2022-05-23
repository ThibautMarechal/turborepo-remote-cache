import type { Team } from '@prisma/client';
import { notFound } from 'remix-utils';
import { client } from './prismaClient.server';

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
          creationDate: {
            gt: since,
          },
          AND: {
            creationDate: {
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

export async function getTeamFromRequest(request: Request): Promise<Team | null> {
  const url = new URL(request.url);
  const teamSlug = url.searchParams.get('teamSlug');
  if (teamSlug) {
    return getTeamBySlug(teamSlug);
  }
  const teamId = url.searchParams.get('teamId');
  if (teamId) {
    return getTeam(teamId);
  }
  return null;
}

export async function getTeam(id: string): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.findUnique({ where: { id } });
  } finally {
    await client.$disconnect();
  }
}

export async function getTeamBySlug(slug: string): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.findUnique({ where: { slug } });
  } finally {
    await client.$disconnect();
  }
}

export async function createTeam(team: Omit<Team, 'id'>): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.create({
      data: {
        avatar: '',
        name: team.name,
        slug: team.slug,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    await client.$connect();
    await client.team.delete({
      where: {
        id: teamId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}
