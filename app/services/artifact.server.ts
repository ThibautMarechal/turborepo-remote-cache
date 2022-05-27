import type { Artifact } from '@prisma/client';
import type { TurboContext } from '~/types/TurboContext';
import { client } from './prismaClient.server';

export function getArtifactId(turboCtx: TurboContext) {
  return `${turboCtx.team?.id ?? turboCtx.user.id}/${turboCtx.hash}`;
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

export async function getArtifacts() {
  try {
    await client.$connect();
    return client.artifact.findMany({
      include: {
        user: true,
        team: true,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsByUser(userId: string) {
  try {
    await client.$connect();
    return await client.artifact.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
      include: {
        user: true,
        team: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getArtifactsByTeam(teamId: string) {
  try {
    await client.$connect();
    return client.artifact.findMany({
      where: {
        teamId,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
      include: {
        user: true,
        team: true,
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
