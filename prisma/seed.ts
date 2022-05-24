import { PrismaClient } from '@prisma/client';
import invariant from 'tiny-invariant';
import { hash } from '../app/utils/hash';

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;

  invariant(ADMIN_USERNAME, 'process.env.ADMIN_USERNAME required');
  invariant(ADMIN_PASSWORD, 'process.env.ADMIN_PASSWORD required');

  const client = new PrismaClient();

  try {
    await client.$connect();
    const adminExist = await client.user.findUnique({
      where: {
        username: ADMIN_USERNAME,
      },
    });
    if (adminExist) {
      return;
    }
    await client.user.create({
      data: {
        name: 'Admin',
        username: ADMIN_USERNAME,
        passwordHash: hash(ADMIN_PASSWORD),
        email: ADMIN_EMAIL ?? '',
      },
    });
  } finally {
    await client.$disconnect();
  }
}

main();
