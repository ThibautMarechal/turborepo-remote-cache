import type { Team } from '~/types/Team';
import { client, DB_NAME } from './mongoClient.server';

const TEAMS_COLLECTION = 'teams';

export async function getTeams(): Promise<Team[]> {
  try {
    await client.connect();
    return (await client.db(DB_NAME).collection(TEAMS_COLLECTION).aggregate().toArray()).map((teamDoc) => ({
      id: teamDoc._id.toString(),
      teamSlug: teamDoc.teamSlug,
      name: teamDoc.name,
    }));
  } finally {
    await client.close();
  }
}

export async function getTeam(id: string): Promise<Team> {
  try {
    await client.connect();
    const [teamDoc] = await client.db(DB_NAME).collection(TEAMS_COLLECTION).find({ _id: id }).toArray();
    if (!teamDoc) {
      throw new Error('Not found');
    }
    return {
      id: teamDoc._id.toString(),
      teamSlug: teamDoc.teamSlug,
      name: teamDoc.name,
    };
  } finally {
    await client.close();
  }
}
