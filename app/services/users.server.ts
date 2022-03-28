import { PrismaClient } from '@prisma/client';
import type { User } from '~/types/User';

const prisma = new PrismaClient();

export async function getUsers(): Promise<User[]> {
  try {
    await prisma.$connect();
    return await prisma.user.findMany();
  } finally {
    await prisma.$disconnect();
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    await prisma.$connect();
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Not found');
    }
    return user;
  } finally {
    await prisma.$disconnect();
  }
}
