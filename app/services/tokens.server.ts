import type { Token } from '@prisma/client';
import { hash } from '~/utils/hash';
import { client } from './prismaClient.server';
import { v4 as newGuid } from 'uuid';

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

export async function getTokens() {
  try {
    await client.$connect();
    return await client.token.findMany({
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
      include: {
        user: true,
      },
    });
  } finally {
    await client.$disconnect();
  }
}

export async function getTokensByUser(userId: string) {
  try {
    await client.$connect();
    return await client.token.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          creationDate: 'desc',
        },
      ],
      include: {
        user: true,
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
