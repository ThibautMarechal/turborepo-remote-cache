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
  await client.artifact.create({ data: artifact });
}

export async function hitArtifact(id: string) {
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
}

export async function getArtifact(id: string) {
  return client.artifact.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: true,
      team: true,
    },
  });
}

export async function getArtifactDuration(id: string) {
  return client.artifact
    .findUniqueOrThrow({
      where: {
        id,
      },
    })
    .then((artifact) => artifact.duration);
}

export async function getArtifacts({ userId, teamId, skip, take, orderBy }: { userId?: string; teamId?: string; skip: number; take: number; orderBy: OrderBy[] }) {
  return client.artifact.findMany({
    orderBy: mapOrderBy(orderBy.length ? orderBy : DEFAULT_ORDER_BY),
    include: {
      user: true,
      team: true,
    },
    skip,
    take,
  });
}

export async function getArtifactsCount({ userId, teamId }: { userId?: string; teamId?: string } = {}) {
  return client.artifact.count({
    where: {
      userId,
      teamId,
    },
  });
}

export async function deleteArtifact(id: string) {
  await client.artifact.delete({
    where: {
      id,
    },
  });
}
