import type { Team as PrismaTeam } from '@prisma/client';
import type { Team as VercelTeam } from '~/types/vercel/Team';

// Turbo has specific behavior for teamId Starting with 'team_'
export function addTeamUndescore(slug: string) {
  return slug.startsWith('team_') ? slug : `team_${slug}`;
}

export function removeTeamUndescore(id: string) {
  return id.replace(/^team_/, '');
}

export function ToVercelTeam(team: PrismaTeam): VercelTeam {
  return {
    id: addTeamUndescore(team.slug),
    name: team.name,
    slug: team.slug,
  };
}
