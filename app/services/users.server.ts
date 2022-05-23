import { hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import type { User } from '@prisma/client';

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

export async function createUser(user: Pick<User, 'email' | 'name' | 'username'>): Promise<User> {
  try {
    await client.$connect();
    return await client.user.create({
      data: {
        email: user.email,
        name: user.name,
        username: user.username,
        passwordHash: hash('default_password'),
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await client.$connect();
    await client.user.delete({
      where: {
        id: userId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getNumberOfUser(): Promise<number> {
  try {
    await client.$connect();
    return await client.user.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getUserByUsernameAndPassword(username: string, password: string): Promise<User | null> {
  try {
    await client.$connect();
    const user = await client.user.findUnique({
      where: {
        username,
      },
    });
    if (user.passwordHash !== hash(password)) {
      return null;
    }
    return user;
  } finally {
    await client.$disconnect();
  }
}
