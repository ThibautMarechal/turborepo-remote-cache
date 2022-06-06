import type { User, Member, Team, Artifact, Session, Event, Token } from '@prisma/client';

export type UserDetail = User & {
  memberships: Array<Member & { team: Team }>;
};

export type TeamDetail = Team & {
  members: Array<Member & { user: User }>;
};

export type ArtifactDetail = Artifact & { user: User; team: Team | null };

export type SessionDetail = Session & {
  user: User;
  team: Team | null;
  events: Event[];
};

export type TokenDetail = Token & {
  user: User;
};
