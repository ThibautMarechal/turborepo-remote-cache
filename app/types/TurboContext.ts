import type { Team, User } from '@prisma/client';

export type TurboContext = {
  artifactId?: string;
  apiVersion: string;
  duration?: number | null;
  user: User;
  team: Team | null;
};
