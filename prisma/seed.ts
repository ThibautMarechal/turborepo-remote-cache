import { PrismaClient } from '@prisma/client';
import { hash } from '../app/utils/hash';
import { v4 as newGuid } from 'uuid';
import { ServerRole } from '~/roles/ServerRole';

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
      console.log(`🔌 Admin already created`);
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
            passwordHash: await hash(ADMIN_PASSWORD),
          },
        },
      },
    });
    console.log(`🔌 Admin created`);
  } finally {
    await client.$disconnect();
  }
}

main();
