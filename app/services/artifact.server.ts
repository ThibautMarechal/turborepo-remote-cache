import type { Artifact } from '@prisma/client';
import { client } from './prismaClient.server';

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
