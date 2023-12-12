import { PrismaClient } from '@prisma/client';
import { hash } from '../app/utils/hash.js';
import { v4 as newGuid } from 'uuid';
import { ServerRole } from '../app/roles/ServerRole.js';

const { ADMIN_USERNAME, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;

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
    process.exit(0);
  }
  const adminId = newGuid();
  await client.user.create({
    data: {
      id: adminId,
      name: ADMIN_NAME || 'Admin',
      username: ADMIN_USERNAME || 'admin',
      email: ADMIN_EMAIL || adminId,
      isSuperAdmin: true,
      role: ServerRole.ADMIN,
      password: {
        create: {
          passwordHash: await hash(ADMIN_PASSWORD || 'turbo'),
        },
      },
    },
  });
  console.log(`🔌 Admin created`);
} finally {
  await client.$disconnect();
}
