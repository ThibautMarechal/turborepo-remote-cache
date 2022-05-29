import type { User, Member, Team } from '@prisma/client';

export type UserDetail = User & {
  memberships: Array<Member & { team: Team }>;
};

export type TeamDetail = Team & {
  members: Array<Member & { user: User }>;
};
