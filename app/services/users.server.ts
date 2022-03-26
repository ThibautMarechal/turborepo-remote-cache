import type { User } from '~/types/User';
import { client, DB_NAME } from './mongoClient.server';

const USERS_COLLECTION = 'users';

export async function getUsers(): Promise<User[]> {
  try {
    await client.connect();
    return (await client.db(DB_NAME).collection(USERS_COLLECTION).aggregate().toArray()).map((userDoc) => ({
      id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email,
    }));
  } finally {
    await client.close();
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    await client.connect();
    const [userDoc] = await client.db(DB_NAME).collection(USERS_COLLECTION).find({ _id: id }).toArray();
    if (!userDoc) {
      throw new Error('Not found');
    }
    return {
      id: userDoc._id.toString(),
      username: userDoc.username,
      email: userDoc.email,
    };
  } finally {
    await client.close();
  }
}
