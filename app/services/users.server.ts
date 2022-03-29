import type { User } from '~/types/User';
import { client } from './prismaClient.Server';

export async function getUsers(): Promise<User[]> {
  try {
    await client.$connect();
    return await client.user.findMany();
  } finally {
    await client.$disconnect();
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    await client.$connect();
    return await client.user.findUnique({ where: { id } });
  } finally {
    await client.$disconnect();
  }
}
