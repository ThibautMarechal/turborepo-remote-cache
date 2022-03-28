import { EventType, SourceType, type TurboContext, type TurboEvent } from '~/types/turborepo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveEvents(turboCtx: TurboContext, events: TurboEvent[]) {
  try {
    await prisma.$connect();
    await prisma.event.createMany({
      data: events.map((event) => ({
        duration: event.duration,
        eventType: event.event,
        hash: event.hash,
        sessionId: event.sessionId,
        sourceType: event.source,
      })),
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function getSessions(teamSlug?: string) {
  try {
    await prisma.$connect();
    // return (
    //   await client
    //     .db(DB_NAME)
    //     .collection(EVENTS_COLLECTION)
    //     .aggregate([
    //       ...(teamSlug
    //         ? [
    //             {
    //               $match: { teamSlug },
    //             },
    //           ]
    //         : []),
    //       {
    //         $group: {
    //           _id: '$sessionId',
    //           sessionId: { $first: '$sessionId' },
    //           duration: { $sum: '$duration' },
    //           date: { $min: '$date' },
    //           remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
    //           remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
    //           localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
    //           localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
    //           teamSlug: { $first: '$teamSlug' },
    //           events: {
    //             $push: {
    //               duration: '$duration',
    //               event: '$event',
    //               hash: '$hash',
    //               sessionId: '$sessionId',
    //               source: '$source',
    //               teamSlug: '$teamSlug',
    //               date: '$date',
    //             },
    //           },
    //         },
    //       },
    //       {
    //         $sort: {
    //           date: -1, // Sort by descending date
    //         },
    //       },
    //     ])
    //     .toArray()
    // ).map((stats) => ({
    //   sessionId: stats.sessionId,
    //   duration: stats.duration,
    //   date: stats.date,
    //   remoteHits: stats.remoteHits,
    //   remoteDuration: stats.remoteDuration,
    //   localHits: stats.localHits,
    //   localDuration: stats.localDuration,
    //   teamSlug: stats.teamSlug,
    //   events: stats.events,
    // }));
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTimeSaved(teamSlug?: string) {
  try {
    await prisma.$connect();
    // return (
    //   await client
    //     .db(DB_NAME)
    //     .collection(EVENTS_COLLECTION)
    //     .aggregate(
    //       [
    //         ...(teamSlug
    //           ? [
    //               {
    //                 $match: { teamSlug },
    //               },
    //             ]
    //           : []),
    //         {
    //           $group: {
    //             _id: null,
    //             remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
    //             remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
    //             localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
    //             localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
    //             teamSlug: { $first: '$teamSlug' },
    //           },
    //         },
    //       ].filter(Boolean),
    //     )
    //     .toArray()
    // ).map((stats) => ({
    //   remoteHits: stats.remoteHits,
    //   remoteDuration: stats.remoteDuration,
    //   localHits: stats.localHits,
    //   localDuration: stats.localDuration,
    //   teamSlug: stats.teamSlug,
    // }));
  } finally {
    await prisma.$disconnect();
  }
}

function getHitsByLocationFromEvents(source: SourceType) {
  return {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$source', source] }, { $eq: ['$event', EventType.HIT] }],
        },
        1,
        0,
      ],
    },
  };
}

function getDurationByLocationFromEvents(source: SourceType) {
  return {
    $sum: {
      $cond: [
        {
          $and: [{ $eq: ['$source', source] }, { $eq: ['$event', EventType.HIT] }],
        },
        '$duration',
        0,
      ],
    },
  };
}
