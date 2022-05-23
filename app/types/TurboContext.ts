import type { Team, User } from '@prisma/client';

export type TurboContext = {
  artifactId?: string;
  apiVersion: string;
  duration?: string | null;
  user: User;
  team: Team | null;
};
