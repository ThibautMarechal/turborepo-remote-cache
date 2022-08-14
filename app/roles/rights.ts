import type { Artifact } from '@prisma/client';
import type { UserDetail } from '~/types/prisma';
import { forbidden } from '~/utils/response';
import { ServerRole } from './ServerRole';
import { TeamRole } from './TeamRole';

export function isAdmin(user: UserDetail): boolean {
  return user.isSuperAdmin || user.role === ServerRole.ADMIN;
}

export function requireAdmin(user: UserDetail): boolean {
  if (isAdmin(user)) {
    return true;
  }
  throw forbidden('You are not an admin');
}

export function isTeamOwner(user: UserDetail, teamId: string): boolean {
  return isAdmin(user) || user.memberships.some((m) => m.teamId === teamId && m.role === TeamRole.OWNER);
}

export function requireTeamOwner(user: UserDetail, teamId: string): boolean {
  if (isAdmin(user)) {
    return true;
  }
  if (isTeamOwner(user, teamId)) {
    return true;
  }
  throw forbidden('You are not team owner');
}

export function isTeamMember(user: UserDetail, teamId: string): boolean {
  return user.memberships.some((m) => m.teamId === teamId);
}

export function requireTeamMember(user: UserDetail, teamId: string): boolean {
  if (isAdmin(user)) {
    return true;
  }
  if (isTeamMember(user, teamId)) {
    return true;
  }
  throw forbidden('You are not team member');
}

export function isArtifactOwner(user: UserDetail, artifact: Artifact): boolean {
  return user.id === artifact.userId;
}
