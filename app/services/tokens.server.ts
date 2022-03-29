import type { Token } from '@prisma/client';
import { hash } from '~/utils/hash';
import { client } from './prismaClient.Server';

export async function getToken(token: string): Promise<Token> {
  try {
    await client.$connect();
    return await client.token.findUnique({ where: { hash: hash(token) } });
  } finally {
    await client.$disconnect();
  }
}
