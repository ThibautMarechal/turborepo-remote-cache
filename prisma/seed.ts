import { PrismaClient } from '@prisma/client';
import { hash } from '../app/utils/hash';
import { v4 as newGuid } from 'uuid';
import { ServerRole } from '../app/types/roles';

async function main() {
  const { ADMIN_USERNAME = 'admin', ADMIN_NAME = 'Admin', ADMIN_PASSWORD = 'turbo', ADMIN_EMAIL } = process.env;

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
    const adminId = newGuid();
    await client.user.create({
      data: {
        id: adminId,
        name: ADMIN_NAME,
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL ?? adminId,
        isSuperAdmin: true,
        role: ServerRole.ADMIN,
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
