import type { Token as PrismaToken } from '@prisma/client';
import type { Token as VercelToken } from '~/types/vercel/Token';

export function ToVercelToken(token: PrismaToken): VercelToken {
  const createdAt = token.creationDate.getTime();
  return {
    id: token.id,
    name: token.name,
    type: 'oauth2-token',
    origin: 'manual',
    scopes: [
      {
        type: 'user',
        origin: 'manual',
        createdAt,
      },
    ],
    activeAt: createdAt,
    createdAt,
  };
}
