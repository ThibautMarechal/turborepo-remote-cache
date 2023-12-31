import { compareHash, hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import type { User } from '@prisma/client';
import { type OrderBy, DEFAULT_ORDER_BY } from '~/utils/sort';

export function getUsers(skip: number = 0, take: number = 100, orderBy?: OrderBy[], search?: string) {
  return client.user.findMany({
    where: {
      isDeleted: false,
      OR: search
        ? [
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
          ]
        : undefined,
    },
    skip,
    take,
    orderBy: orderBy?.length ? orderBy : DEFAULT_ORDER_BY,
  });
}

export function getUsersCount() {
  return client.user.count({
    where: {
      isDeleted: false,
    },
  });
}

export function getUsersByTeam(teamId: string, skip: number = 0, take: number = 100, orderBy: OrderBy[]) {
  return client.user.findMany({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
    include: {
      memberships: true,
    },
    skip,
    take,
    orderBy: orderBy.length ? orderBy : DEFAULT_ORDER_BY,
  });
}

export function getUsersByTeamCount(teamId: string) {
  return client.user.count({
    where: {
      memberships: {
        some: {
          teamId,
        },
      },
    },
  });
}

export function getUser(id: string) {
  return client.user.findUniqueOrThrow({ where: { id } });
}

export function getUserByUsername(username: string) {
  return client.user.findUniqueOrThrow({ where: { username } });
}

export function getUserDetail(id: string) {
  return client.user.findUniqueOrThrow({
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

export function getUserDetailByUsername(username: string) {
  return client.user.findUniqueOrThrow({
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

export async function createUser(user: Pick<User, 'email' | 'name' | 'username' | 'role'>, password: string) {
  return client.user.create({
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

export async function userExist(id: string) {
  return (await client.user.count({ where: { id } })) === 1;
}

export function createExternalUser(user: Pick<User, 'email' | 'name' | 'username' | 'role' | 'id'>) {
  return client.user.create({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      isExternal: true,
    },
  });
}

export function updateUser(id: string, user: Pick<User, 'email' | 'name' | 'role'>) {
  return client.user.update({
    where: { id },
    data: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export async function deleteUser(userId: string) {
  const { isSuperAdmin } = await client.user.findUniqueOrThrow({
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

export async function getUserByUsernameAndPassword(username: string, password: string) {
  const user = await client.user.findUniqueOrThrow({
    where: {
      username,
    },
  });
  const { passwordHash } = await client.password.findFirstOrThrow({
    where: {
      userId: user.id,
    },
  });
  if (await compareHash(password, passwordHash)) {
    return user;
  }
}

export async function updateUserPassword(userId: string, password: string) {
  return client.$transaction([
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
