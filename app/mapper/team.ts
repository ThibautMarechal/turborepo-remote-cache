import type { Team as PrismaTeam } from '@prisma/client';
import type { Team as VercelTeam } from '~/types/vercel/Team';

// Turbo has specific behavior for teamId Starting with 'team_'
export function addTeamUndescore(id: string) {
  return id.startsWith('team_') ? id : `team_${id}`;
}

export function removeTeamUndescore(id: string) {
  return id.replace(/^team_/, '');
}

export function ToVercelTeam(team: PrismaTeam): VercelTeam {
  return {
    id: addTeamUndescore(team.id),
    name: team.name,
    slug: team.slug,
  };
}
