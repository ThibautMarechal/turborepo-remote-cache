import type { User as PrismaUser } from '@prisma/client';
import type { User as VercelUser } from '~/types/vercel/User';

export function ToVercelUser(user: PrismaUser): VercelUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    createdAt: user.creationDate.getDate(),
  };
}
