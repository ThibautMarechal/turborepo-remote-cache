import { EventType, SourceType, type TurboContext, type TurboEvent } from '~/types/turborepo';
import { DB_NAME, client } from './mongoClient.server';

const EVENTS_COLLECTION = 'events';

export async function saveEvents(turboCtx: TurboContext, events: TurboEvent[]) {
  try {
    await client.connect();
    await client
      .db(DB_NAME)
      .collection(EVENTS_COLLECTION)
      .insertMany(events.map((event) => ({ teamSlug: turboCtx.teamSlug, ...event, date: new Date() })));
  } finally {
    await client.close();
  }
}

export async function getSessions(teamSlug?: string) {
  try {
    await client.connect();
    return (
      await client
        .db(DB_NAME)
        .collection(EVENTS_COLLECTION)
        .aggregate([
          ...(teamSlug
            ? [
                {
                  $match: { teamSlug },
                },
              ]
            : []),
          {
            $group: {
              _id: '$sessionId',
              sessionId: { $first: '$sessionId' },
              duration: { $sum: '$duration' },
              date: { $min: '$date' },
              remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
              remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
              localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
              localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
              teamSlug: { $first: '$teamSlug' },
              events: {
                $push: {
                  duration: '$duration',
                  event: '$event',
                  hash: '$hash',
                  sessionId: '$sessionId',
                  source: '$source',
                  teamSlug: '$teamSlug',
                  date: '$date',
                },
              },
            },
          },
          {
            $sort: {
              date: -1, // Sort by descending date
            },
          },
        ])
        .toArray()
    ).map((stats) => ({
      sessionId: stats.sessionId,
      duration: stats.duration,
      date: stats.date,
      remoteHits: stats.remoteHits,
      remoteDuration: stats.remoteDuration,
      localHits: stats.localHits,
      localDuration: stats.localDuration,
      teamSlug: stats.teamSlug,
      events: stats.events,
    }));
  } finally {
    await client.close();
  }
}

export async function getTimeSaved(teamSlug?: string) {
  try {
    await client.connect();
    return (
      await client
        .db(DB_NAME)
        .collection(EVENTS_COLLECTION)
        .aggregate(
          [
            ...(teamSlug
              ? [
                  {
                    $match: { teamSlug },
                  },
                ]
              : []),
            {
              $group: {
                _id: null,
                remoteHits: getHitsByLocationFromEvents(SourceType.REMOTE),
                remoteDuration: getDurationByLocationFromEvents(SourceType.REMOTE),
                localHits: getHitsByLocationFromEvents(SourceType.LOCAL),
                localDuration: getDurationByLocationFromEvents(SourceType.LOCAL),
                teamSlug: { $first: '$teamSlug' },
              },
            },
          ].filter(Boolean),
        )
        .toArray()
    ).map((stats) => ({
      remoteHits: stats.remoteHits,
      remoteDuration: stats.remoteDuration,
      localHits: stats.localHits,
      localDuration: stats.localDuration,
      teamSlug: stats.teamSlug,
    }));
  } finally {
    await client.close();
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
