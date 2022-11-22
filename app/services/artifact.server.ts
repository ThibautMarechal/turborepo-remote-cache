import type { Artifact } from '@prisma/client';
import type { CleanPeriod } from '~/clean/CleanPeriod';
import { getDateFromPeriod } from '~/clean/utils';
import type { TurboContext } from '~/types/TurboContext';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';
import { client } from './prismaClient.server';
import { CacheStorage } from './storage.server';

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

export async function getArtifactByHash(hash: string) {
  return client.artifact.findFirst({
    where: {
      hash,
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
    where: {
      userId,
      teamId,
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

export async function getArtifactsSize({ userId, teamId }: { userId?: string; teamId?: string } = {}) {
  return await client.artifact
    .aggregate({
      _sum: {
        contentLength: true,
      },
      where: {
        userId,
        teamId,
      },
    })
    .then((res) => res._sum.contentLength ?? 0);
}

export async function deleteArtifactByPeriod(period: CleanPeriod, { teamId, userId }: { userId?: string; teamId?: string } = {}) {
  await client.$transaction(async (tx) => {
    const fromDate = getDateFromPeriod(period);

    const artifactsToRemoved = await tx.artifact.findMany({
      include: {
        user: true,
        team: true,
      },
      where: {
        AND: {
          userId,
          teamId,
          OR: [
            {
              lastHitDate: {
                equals: null,
              },
              creationDate: {
                lte: fromDate,
              },
            },
            {
              lastHitDate: {
                lte: fromDate,
              },
            },
          ],
        },
      },
    });
    console.log(`🚮 Deleting ${artifactsToRemoved.length} artifacts older than last ${period} for ${JSON.stringify({ userId, teamId })}`);

    const storage = new CacheStorage();
    const storageCleaning = await Promise.allSettled(artifactsToRemoved.map((a) => storage.removeArtifact(a)));
    const dbCleaning = await Promise.allSettled(
      artifactsToRemoved.map((a) =>
        tx.artifact.delete({
          where: {
            id: a.id,
          },
        }),
      ),
    );
    let failedCount = 0;
    artifactsToRemoved.forEach((artifact, index) => {
      let failed = false;
      if (storageCleaning[index].status === 'rejected') {
        console.warn(`Failed to clean artifact ${artifact.id} from storage`);
        failed = true;
      }
      if (dbCleaning[index].status === 'rejected') {
        console.warn(`Failed to clean artifact ${artifact.id} from database`);
        failed = true;
      }
      if (failed) {
        failedCount++;
      }
    });

    if (failedCount > 0) {
      const errorMessage = `Failed to remove ${failedCount} artifacts`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    console.log(`🚮 Successfully deleted ${artifactsToRemoved.length} artifacts`);
  });
}
