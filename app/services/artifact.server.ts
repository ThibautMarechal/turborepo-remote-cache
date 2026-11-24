import type { Artifact } from '@prisma/client';
import type { CleanPeriod } from '~/clean/CleanPeriod';
import { getDateFromPeriod } from '~/clean/utils';
import type { TurboContext } from '~/types/TurboContext';
import { DEFAULT_ORDER_BY, type OrderBy } from '~/utils/sort';
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

export async function existArtifactByHash(hash: string) {
  return client.artifact
    .count({
      where: {
        hash,
      },
    })
    .then((c) => c > 0);
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

const CLEAN_BATCH_SIZE = 100;
const runningCleanups = new Set<string>();

type CleanScope = { userId?: string; teamId?: string };

function getCleanupKey({ userId, teamId }: CleanScope) {
  return `user:${userId ?? '*'}|team:${teamId ?? '*'}`;
}

/**
 * Start the cleanup of artifacts older than the given period in background.
 * Returns immediately so the request (and the UI) is not blocked while the storage is being cleaned.
 * Only one cleanup per scope can run at the same time.
 */
export function startArtifactCleanup(period: CleanPeriod, scope: CleanScope = {}) {
  const key = getCleanupKey(scope);
  if (runningCleanups.has(key)) {
    console.log(`🚮 A cleanup is already running for ${JSON.stringify(scope)}, skipping`);
    return { started: false };
  }
  runningCleanups.add(key);
  deleteArtifactByPeriod(period, scope)
    .catch((e) => console.error(`🚮 Cleanup failed for ${JSON.stringify(scope)}`, e))
    .finally(() => runningCleanups.delete(key));
  return { started: true };
}

/**
 * Delete artifacts older than the given period, batch by batch.
 * Each batch removes the files from the storage first, then deletes from the database only the artifacts
 * whose file has been successfully removed (failed ones are kept so they can be retried by a next cleanup).
 */
export async function deleteArtifactByPeriod(period: CleanPeriod, { teamId, userId }: CleanScope = {}) {
  const fromDate = getDateFromPeriod(period);
  const where = {
    userId,
    teamId,
    OR: [
      {
        lastHitDate: null,
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
  };
  console.log(`🚮 Deleting artifacts older than last ${period} for ${JSON.stringify({ userId, teamId })}`);

  const storage = new CacheStorage();
  let deletedCount = 0;
  let failedCount = 0;
  let cursor: string | undefined;

  for (;;) {
    const batch = await client.artifact.findMany({
      include: {
        user: true,
        team: true,
      },
      // Paginate on id (not with prisma cursor, as the cursor row is deleted by the previous batch)
      where: cursor ? { ...where, id: { gt: cursor } } : where,
      orderBy: { id: 'asc' },
      take: CLEAN_BATCH_SIZE,
    });
    if (batch.length === 0) {
      break;
    }
    cursor = batch[batch.length - 1].id;

    const storageCleaning = await Promise.allSettled(batch.map((a) => storage.removeArtifact(a)));
    const removedIds: string[] = [];
    batch.forEach((artifact, index) => {
      if (storageCleaning[index].status === 'rejected') {
        console.warn(`Failed to clean artifact ${artifact.id} from storage`);
        failedCount++;
      } else {
        removedIds.push(artifact.id);
      }
    });

    if (removedIds.length) {
      try {
        const { count } = await client.artifact.deleteMany({ where: { id: { in: removedIds } } });
        deletedCount += count;
      } catch (e) {
        console.warn(`Failed to clean ${removedIds.length} artifacts from database`, e);
        failedCount += removedIds.length;
      }
    }

    // Let the event loop breathe between batches so the server keeps answering other requests
    await new Promise((resolve) => setImmediate(resolve));
  }

  if (failedCount > 0) {
    console.error(`🚮 Deleted ${deletedCount} artifacts, failed to remove ${failedCount} artifacts`);
  } else {
    console.log(`🚮 Successfully deleted ${deletedCount} artifacts`);
  }
  return { deletedCount, failedCount };
}
