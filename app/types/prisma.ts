import type { User, Member, Team } from '@prisma/client';

export type UserDetail = User & {
  memberships: Array<Member & { team: Team }>;
};
