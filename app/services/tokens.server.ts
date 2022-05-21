import type { Token } from '@prisma/client';
import { hash } from '~/utils/hash';
import { client } from './prismaClient.Server';

export async function getToken(token: string): Promise<Token> {
  try {
    console.log(hash(token));
    await client.$connect();
    await client.token.create({
      data: {
        creationDate: new Date(),
        hash: hash(token),
        name: 'test-token',
        userId: '62436b935f72d961d5f6cac4',
      },
    });
    return await client.token.findUnique({ where: { hash: hash(token) } });
  } finally {
    await client.$disconnect();
  }
}
