import type { User } from '~/types/User';
import { client, DB_NAME } from './mongoClient.server';

const TOKEN_COLLECTION = 'users';

export async function getUserId(token: string): Promise<string> {
  try {
    await client.connect();
    throw new Error('Implement me!');
  } finally {
    await client.close();
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    client.connect();
    const [userDoc] = await client.db(DB_NAME).collection(TOKEN_COLLECTION).find({ _id: id }).toArray();
    if (!userDoc) {
      throw new Error('Not found');
    }
    return {
      id: userDoc.id.toString(),
      username: userDoc.username,
      email: userDoc.email,
    };
  } finally {
    client.close();
  }
}
