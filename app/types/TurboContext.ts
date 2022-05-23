import type { Team } from './vercel/Team';
import type { User } from './vercel/User';

export type TurboContext = {
  artifactId?: string;
  apiVersion: string;
  duration?: string | null;
  user: User;
  team: Team;
};
