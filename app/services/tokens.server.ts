import type { Token } from '@prisma/client';
import { hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import { v4 as newGuid } from 'uuid';
import { type OrderBy, DEFAULT_ORDER_BY } from '~/utils/sort';

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
  return await client.token.update({
    where: {
      hash: await hash(token),
    },
    data: {
      lastUsedDate: new Date(),
    },
  });
}

export async function getTokens({ userId, skip, take, orderBy }: { userId?: string; skip: number; take: number; orderBy: OrderBy[] }) {
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
}

export async function getTokensCount({ userId }: { userId?: string } = {}) {
  return await client.token.count({
    where: {
      userId,
    },
  });
}

export async function generateToken(userId: string, name: string = 'turborepo-cli'): Promise<[string, Token]> {
  const token = newGuid();
  return [
    token,
    await client.token.create({
      data: {
        hash: await hash(token),
        name,
        userId,
      },
    }),
  ];
}

export async function revokeToken(id: string) {
  await client.token.delete({
    where: {
      id,
    },
  });
}
