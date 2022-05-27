import type { Team, User } from '@prisma/client';

export type TurboContext = {
  hash?: string;
  duration?: number | null;
  user: User;
  team: Team | null;
};
