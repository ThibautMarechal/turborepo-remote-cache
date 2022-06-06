import type { Artifact, Team, Token, User } from '@prisma/client';
import { ServerRole } from '~/roles/ServerRole';
import { TeamRole } from '~/roles/TeamRole';
import type { TeamDetail, UserDetail } from './prisma';

export function isAdmin(user: UserDetail): boolean {
  return user.isSuperAdmin || user.role === ServerRole.ADMIN;
}

export enum UserAction {
  CREATE = 'CREATE',
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}

export function canDoUserAction(currentUser: UserDetail, action: UserAction, target: User): boolean {
  if (isAdmin(currentUser)) {
    return true;
  }
  if (action === UserAction.VIEW) {
    return true;
  }
  if (action === UserAction.EDIT) {
    return currentUser.id === target.id;
  }
  return false;
}

export enum TeamAction {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  ADD_USER = 'ADD_USER',
  REMOVE_USER = 'REMOVE_USER',
}

export function canDoTeamAction(currentUser: UserDetail, action: TeamAction, team: Team | TeamDetail): boolean {
  if (isAdmin(currentUser)) {
    return true;
  }
  if (action === TeamAction.VIEW) {
    return true;
  }
  if (action === TeamAction.EDIT || action === TeamAction.DELETE || action === TeamAction.ADD_USER || action === TeamAction.REMOVE_USER) {
    return currentUser.memberships.some((m) => m.teamId === team.id && m.role === TeamRole.OWNER);
  }
  return false;
}

export enum ArtifacyAction {
  VIEW = 'VIEW',
  DELETE = 'DELETE',
}

export function canDoArtifactAction(currentUser: UserDetail, action: ArtifacyAction, artifact: Artifact): boolean {
  if (isAdmin(currentUser)) {
    return true;
  }
  if (action === ArtifacyAction.VIEW) {
    return true;
  }
  if (action === ArtifacyAction.DELETE) {
    return artifact.teamId === null && artifact.id === currentUser.id;
  }
  return false;
}

export enum TokenAction {
  CREATE = 'CREATE',
  REVOKE = 'REVOKE',
}

export function canDoTokenAction(currentUser: UserDetail, action: TokenAction, token: Token): boolean {
  if (isAdmin(currentUser)) {
    return true;
  }
  if (action === TokenAction.REVOKE) {
    return token.userId === currentUser.id;
  }
  return false;
}
