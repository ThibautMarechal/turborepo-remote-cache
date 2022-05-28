import type { Token } from '@prisma/client';
import { hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import { v4 as newGuid } from 'uuid';
import type { OrderBy } from '~/utils/sort';
import { DEFAULT_ORDER_BY } from '~/utils/sort';

export function mapOrderBy(orderBy: OrderBy[]) {
  return orderBy.map((orderBy) => {
    const [[field, direction]] = Object.entries(orderBy);
    if (field === 'user') {
      return { user: { name: direction } };
    }
    return orderBy;
  });
}

export async function getToken(token: string): Promise<Token> {
  try {
    await client.$connect();
    return await client.token.update({
      where: {
        hash: hash(token),
      },
      data: {
        lastUsedDate: new Date(),
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTokens(skip: number, take: number, orderBy: OrderBy[]) {
  try {
    await client.$connect();
    return await client.token.findMany({
      orderBy: mapOrderBy(orderBy.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        user: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTokensCount() {
  try {
    await client.$connect();
    return await client.token.count();
  } finally {
    await client.$disconnect();
  }
}

export async function getTokensByUser(userId: string, skip: number, take: number, orderBy: OrderBy[]) {
  try {
    await client.$connect();
    return await client.token.findMany({
      where: {
        userId,
      },
      orderBy: mapOrderBy(orderBy.length ? orderBy : DEFAULT_ORDER_BY),
      include: {
        user: true,
      },
      skip,
      take,
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTokensByUserCount(userId: string) {
  try {
    await client.$connect();
    return await client.token.count({
      where: {
        userId,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function generateToken(userId: string, name: string = 'turborepo-cli'): Promise<[string, Token]> {
  try {
    const token = newGuid();
    await client.$connect();
    return [
      token,
      await client.token.create({
        data: {
          creationDate: new Date(),
          hash: hash(token),
          name,
          userId,
        },
      }),
    ];
  } finally {
    await client.$disconnect();
  }
}

export async function revokeToken(id: string) {
  try {
    await client.$connect();
    await client.token.delete({
      where: {
        id,
      },
    });
  } finally {
    await client.$disconnect();
  }
}
