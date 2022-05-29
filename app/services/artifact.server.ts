import type { Artifact } from '@prisma/client';
import type { TurboContext } from '~/types/TurboContext';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';
import { client } from './prismaClient.server';

export function getArtifactId(turboCtx: TurboContext) {
  return `${turboCtx.team?.id ?? turboCtx.user.id}/${turboCtx.hash}`;
}

export function mapOrderBy(orderBy: OrderBy[]) {
  return orderBy.map((orderBy) => {
    const [[field, direction]] = Object.entries(orderBy);
    if (field === 'user') {
      return { user: { name: direction } };
    }
    if (field === 'team') {
      return { team: { name: direction } };
    }
    return orderBy;
  });
}

export async function insertArtifact(artifact: Omit<Artifact, 'creationDate' | 'hitCount' | 'lastHitDate'>) {
  try {
    await client.$connect();
    await client.artifact.create({ data: artifact });
  } finally {
    await client.$disconnect();
  }
}

export async function hitArtifact(id: string) {
  try {
    await client.$connect();
    await client.artifact.update({
      where: {
        id,
      },
      data: {
        hitCount: {
          increment: 1,
        },
        lastHitDate: new Date(),
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifact(id: string) {
  try {
    await client.$connect();
    return client.artifact.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        team: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifacts(skip: number, take: number, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return client.artifact.findMany({
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        user: true,
        team: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsCount() {
  try {
    await client.$connect();
    return client.artifact.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsByUser(userId: string, skip: number, take: number, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return await client.artifact.findMany({
      where: {
        userId,
      },
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        user: true,
        team: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsCountByUser(userId: string) {
  try {
    await client.$connect();
    return client.artifact.count({
      where: {
        userId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsByTeam(teamId: string, orderBy?: OrderBy[]) {
  try {
    await client.$connect();
    return client.artifact.findMany({
      where: {
        teamId,
      },
      orderBy: mapOrderBy(orderBy?.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        user: true,
        team: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsByTeamCount(teamId: string) {
  try {
    await client.$connect();
    return client.artifact.count({
      where: {
        teamId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function deleteArtifact(id: string) {
  try {
    await client.$connect();
    await client.artifact.delete({
      where: {
        id,
      },
    });
  } finally {
    await client.$disconnect();
  }
}
