import { compareHash, hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import type { User } from '@prisma/client';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';

export async function getUsers(skip: number = 0, take: number = 100, orderBy?: OrderBy[], search?: string): Promise<User[]> {
  return await client.user.findMany({
    where: {
      isDeleted: false,
      OR: [
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    },
    skip,
    take,
    orderBy: orderBy?.length ? orderBy : DEFAULT_ORDER_BY,
  });
}

export async function getUsersCount(): Promise<number> {
  return await client.user.count({
    where: {
      isDeleted: false,
    },
  });
}

export async function getUsersByTeam(teamId: string, skip: number = 0, take: number = 100, orderBy: OrderBy[]): Promise<User[]> {
  return await client.user.findMany({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
    skip,
    take,
    orderBy: orderBy.length ? orderBy : DEFAULT_ORDER_BY,
  });
}

export async function getUsersByTeamCount(teamId: string) {
  return await client.user.count({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
  });
}

export async function getUser(id: string): Promise<User> {
  return await client.user.findUnique({ where: { id } });
}

export async function getUserByUsername(username: string): Promise<User> {
  return await client.user.findUnique({ where: { username } });
}

export async function getUserDetail(id: string) {
  return await client.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          team: true,
        },
      },
    },
  });
}

export async function getUserDetailByUsername(username: string): Promise<User> {
  return await client.user.findUnique({
    where: { username },
    include: {
      memberships: {
        include: {
          team: true,
        },
      },
    },
  });
}

export async function createUser(user: Pick<User, 'email' | 'name' | 'username' | 'role'>, password: string): Promise<User> {
  return await client.user.create({
    data: {
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      password: {
        create: {
          passwordHash: await hash(password),
        },
      },
    },
  });
}

export async function updateUser(id: string, user: Pick<User, 'email' | 'name' | 'role'>): Promise<User> {
  return await client.user.update({
    where: { id },
    data: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export async function deleteUser(userId: string) {
  const { isSuperAdmin } = await client.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  });
  if (isSuperAdmin) {
    throw new Error('Cannot delete super admin');
  }
  await client.user.update({
    where: {
      id: userId,
    },
    data: {
      name: '[Deleted User]',
      email: userId,
      username: userId,
      isDeleted: true,
      memberships: {
        deleteMany: {
          userId,
        },
      },
      tokens: {
        deleteMany: {
          userId,
        },
      },
      password: {
        deleteMany: {
          userId,
        },
      },
    },
  });
}

export async function getUserByUsernameAndPassword(username: string, password: string): Promise<User> {
  const user = await client.user.findUnique({
    where: {
      username,
    },
  });
  const { passwordHash } = await client.password.findFirst({
    where: {
      userId: user.id,
    },
  });
  if (await compareHash(password, passwordHash)) {
    return user;
  }
  throw new Error('User with password not found');
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  await client.$transaction([
    client.password.deleteMany({
      where: {
        userId,
      },
    }),
    client.password.create({
      data: {
        userId,
        passwordHash: await hash(password),
      },
    }),
  ]);
}
