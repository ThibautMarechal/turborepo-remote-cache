import type { Team } from '@prisma/client';
import { removeTeamUndescore } from '~/mapper/team';
import type { OrderBy } from '~/utils/sort';
import { client } from './prismaClient.server';

export async function getTeams(skip: number, take: number, orderBy: OrderBy[]): Promise<Team[]> {
  try {
    await client.$connect();
    return await client.team.findMany({
      skip,
      take,
      orderBy,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTeamsCount(): Promise<number> {
  try {
    await client.$connect();
    return await client.team.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getUserTeams(userId: string, limit: number, since = new Date(Date.UTC(0, 0, 0)), until = new Date(Date.UTC(3000, 0, 0))): Promise<Team[]> {
  try {
    await client.$connect();
    return await client.team.findMany({
      where: {
        members: {
          some: {
            user: {
              id: userId,
            },
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
    return getTeam(removeTeamUndescore(teamId));
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

export async function getTeamDetail(id: string) {
  try {
    await client.$connect();
    return await client.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        artifacts: true,
        sessions: true,
      },
    });
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

export async function createTeam(team: Omit<Team, 'id' | 'creationDate' | 'avatar'>): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.create({
      data: {
        name: team.name,
        slug: team.slug,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function updateTeam(id: string, team: Pick<Team, 'name' | 'slug'>): Promise<Team> {
  try {
    await client.$connect();
    return await client.team.update({ where: { id }, data: team });
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
