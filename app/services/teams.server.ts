import type { Team } from '@prisma/client';
import { removeTeamUndescore } from '~/mapper/team';
import type { TeamDetail } from '~/types/prisma';
import type { OrderBy } from '~/utils/sort';
import { client } from './prismaClient.server';

export async function getTeams(skip: number, take: number, orderBy: OrderBy[], search: string): Promise<Team[]> {
  return await client.team.findMany({
    where: {
      isDeleted: false,
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    },
    skip,
    take,
    orderBy,
  });
}

export async function getTeamsCount(): Promise<number> {
  return await client.team.count({
    where: {
      isDeleted: false,
    },
  });
}

export async function getUserTeams(userId: string, limit: number, since = new Date(Date.UTC(0, 0, 0)), until = new Date(Date.UTC(3000, 0, 0))): Promise<Team[]> {
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
}

export async function getTeamFromRequest(request: Request): Promise<Team | null> {
  const url = new URL(request.url);
  const teamSlug = url.searchParams.get('teamSlug');
  if (teamSlug) {
    return getTeamBySlug(teamSlug);
  }
  const teamId = url.searchParams.get('teamId');
  if (teamId) {
    // Even if it's called teamId, linking a repo with the command 'turbo link', the teamId become 'team_{teamSlug}'
    // But we allow teamId to be 'team_{teamId}'
    try {
      return await getTeamBySlug(removeTeamUndescore(teamId));
    } catch (e) {
      return getTeam(removeTeamUndescore(teamId));
    }
  }
  return null;
}

export async function getTeam(id: string): Promise<Team> {
  return await client.team.findUniqueOrThrow({ where: { id } });
}

export async function getTeamDetail(id: string) {
  return await client.team.findUniqueOrThrow({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function getTeamBySlug(slug: string): Promise<Team> {
  return await client.team.findUniqueOrThrow({ where: { slug } });
}

export async function getTeamDetailBySlug(slug: string): Promise<TeamDetail> {
  return await client.team.findUniqueOrThrow({
    where: { slug },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function createTeam(team: Pick<Team, 'name' | 'slug'>): Promise<Team> {
  return await client.team.create({
    data: {
      name: team.name,
      slug: team.slug,
    },
  });
}

export async function updateTeam(id: string, team: Pick<Team, 'name'>): Promise<Team> {
  return await client.team.update({ where: { id }, data: team });
}

export async function addUserToTteam(teamId: string, userId: string, role: string) {
  return await client.team.update({
    where: { id: teamId },
    data: {
      members: {
        create: {
          userId,
          role,
        },
      },
    },
  });
}
export async function removeUserFromTeam(teamId: string, userId: string) {
  return await client.team.update({
    where: { id: teamId },
    data: {
      members: {
        deleteMany: {
          userId,
        },
      },
    },
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await client.team.update({
    where: {
      id: teamId,
    },
    data: {
      name: '[Deleted Team]',
      slug: teamId,
      avatar: null,
      isDeleted: true,
      members: {
        deleteMany: {
          teamId,
        },
      },
    },
  });
}
