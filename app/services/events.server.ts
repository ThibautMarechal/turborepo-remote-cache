import type { Event } from '@prisma/client';
import { EventType } from '~/types/vercel/turborepo';
import type { SourceType } from '~/types/vercel/turborepo';
import { client } from './prismaClient.server';

export async function insertEvents(events: Omit<Event, 'id' | 'creationDate'>[]) {
  try {
    await client.$connect();
    await client.event.createMany({ data: events });
  } finally {
    await client.$disconnect();
  }
}

export async function getSessions(teamId?: string) {
  try {
    await client.$connect();
    // return await client.session. ({
    //   pipeline: [
    //     ...(teamId
    //       ? [
    //           {
    //             $match: { teamId },
    //           },
    //         ]
    //       : []),
    //     {
    //       $group: {
    //         _id: '$sessionId',
    //         sessionId: { $first: '$sessionId' },
    //         duration: { $sum: '$duration' },
    //         date: { $min: '$date' },
    //         remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
    //         remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
    //         localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
    //         localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
    //         teamSlug: { $first: '$teamSlug' },
    //         events: {
    //           $push: {
    //             duration: '$duration',
    //             event: '$event',
    //             hash: '$hash',
    //             sessionId: '$sessionId',
    //             source: '$source',
    //             teamSlug: '$teamSlug',
    //             date: '$date',
    //           },
    //         },
    //       },
    //     },
    //     {
    //       $sort: {
    //         date: -1, // Sort by descending date
    //       },
    //     },
    //   ],
    // });
    return [];
  } finally {
    await client.$disconnect();
  }
}

export async function getTimeSaved(teamId?: string) {
  try {
    await client.$connect();
    return [];
    // return await client.session.aggregateRaw({
    //   pipeline: [
    //     ...(teamId
    //       ? [
    //           {
    //             $match: { teamId },
    //           },
    //         ]
    //       : []),
    //     {
    //       $group: {
    //         _id: null,
    //         remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
    //         remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
    //         localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
    //         localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
    //         teamSlug: { $first: '$teamSlug' },
    //       },
    //     },
    //   ].filter(Boolean),
    // });
  } finally {
    await client.$disconnect();
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
