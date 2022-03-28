import { PrismaClient, Token } from '@prisma/client';
import { hash } from '~/helpers/hash';

const prisma = new PrismaClient();

export async function getToken(token: string): Promise<Token> {
  try {
    await prisma.$connect();
    const tokenDb = await prisma.token.findUnique({ where: { hash: hash(token) } });
    if (!tokenDb) {
      throw new Error('Not found');
    }
    return tokenDb;
  } finally {
    await prisma.$disconnect();
  }
}
