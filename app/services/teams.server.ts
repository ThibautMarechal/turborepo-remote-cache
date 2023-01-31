import type { Team } from '@prisma/client';
import { removeTeamUndescore } from '~/mapper/team';
import type { OrderBy } from '~/utils/sort';
import { client } from './prismaClient.server';

export function getTeams(skip: number, take: number, orderBy: OrderBy[], search: string) {
  return client.team.findMany({
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

export function getTeamsCount() {
  return client.team.count({
    where: {
      isDeleted: false,
    },
  });
}

export function getUserTeams(userId: string, limit: number, since = new Date(Date.UTC(0, 0, 0)), until = new Date(Date.UTC(3000, 0, 0))) {
  return client.team.findMany({
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

export function getTeam(id: string) {
  return client.team.findUniqueOrThrow({ where: { id } });
}

export function getTeamDetail(id: string) {
  return client.team.findUniqueOrThrow({
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

export function getTeamBySlug(slug: string) {
  return client.team.findUniqueOrThrow({ where: { slug } });
}

export function getTeamDetailBySlug(slug: string) {
  return client.team.findUniqueOrThrow({
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

export function createTeam(team: Pick<Team, 'name' | 'slug'>) {
  return client.team.create({
    data: {
      name: team.name,
      slug: team.slug,
    },
  });
}

export function updateTeam(id: string, team: Pick<Team, 'name'>) {
  return client.team.update({ where: { id }, data: team });
}

export function addUserToTteam(teamId: string, userId: string, role: string) {
  return client.team.update({
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
export function removeUserFromTeam(teamId: string, userId: string) {
  return client.team.update({
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

export function changeTeamRole(teamId: string, userId: string, role: string) {
  return client.team.update({
    where: { id: teamId },
    data: {
      members: {
        updateMany: {
          where: {
            userId,
          },
          data: {
            role,
          },
        },
      },
    },
  });
}

export function deleteTeam(teamId: string) {
  return client.team.update({
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
