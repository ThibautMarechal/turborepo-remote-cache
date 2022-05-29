import { hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import type { User } from '@prisma/client';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';

export async function getUsers(skip: number = 0, take: number = 100, orderBy?: OrderBy[]): Promise<User[]> {
  try {
    await client.$connect();
    return await client.user.findMany({
      skip,
      take,
      orderBy: orderBy?.length ? orderBy : DEFAULT_ORDER_BY,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getUsersCount(): Promise<number> {
  try {
    await client.$connect();
    return await client.user.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getUsersByTeam(teamId: string, skip: number = 0, take: number = 100, orderBy?: OrderBy[]): Promise<User[]> {
  try {
    await client.$connect();
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
      orderBy: orderBy?.length ? orderBy : DEFAULT_ORDER_BY,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getUsersByTeamCount(teamId: string) {
  try {
    await client.$connect();
    return await client.user.count({
      where: {
        memberships: {
          some: {
            teamId,
          },
        },
      },
    });
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

export async function getUserDetail(id: string) {
  try {
    await client.$connect();
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
  } finally {
    await client.$disconnect();
  }
}

export async function createUser(user: Pick<User, 'email' | 'name' | 'username'>, password: string): Promise<User> {
  try {
    await client.$connect();
    return await client.user.create({
      data: {
        email: user.email,
        name: user.name,
        username: user.username,
        password: {
          create: {
            passwordHash: hash(password),
          },
        },
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function updateUser(id: string, user: Pick<User, 'email' | 'name' | 'username'>): Promise<User> {
  try {
    await client.$connect();
    return await client.user.update({
      where: { id },
      data: {
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function deleteUser(userId: string) {
  try {
    await client.$connect();
    await client.user.delete({
      where: {
        id: userId,
      },
      include: {
        password: {},
        tokens: true,
        memberships: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getUserByUsernameAndPassword(username: string, password: string): Promise<User> {
  try {
    await client.$connect();
    return await client.user.findFirst({
      where: {
        username,
        AND: {
          password: {
            some: {
              passwordHash: hash(password),
            },
          },
        },
      },
    });
  } finally {
    await client.$disconnect();
  }
}
