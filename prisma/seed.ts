import { PrismaClient } from '@prisma/client';
import { hash } from '../app/utils/hash';

async function main() {
  const { ADMIN_USERNAME = 'admin', ADMIN_PASSWORD = 'turbo', ADMIN_EMAIL } = process.env;

  const client = new PrismaClient();

  try {
    await client.$connect();
    const adminExist = await client.user.findFirst({
      where: {
        isSuperAdmin: true,
      },
    });
    if (adminExist) {
      return;
    }
    await client.user.create({
      data: {
        name: 'Admin',
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL ?? '',
        isSuperAdmin: true,
        password: {
          create: {
            passwordHash: hash(ADMIN_PASSWORD),
          },
        },
      },
    });
  } finally {
    await client.$disconnect();
  }
}

main();
