// Turbo has specific behavior for teamId Starting with 'team_'
export function addTeamUndescore(slug: string) {
  return slug.startsWith('team_') ? slug : `team_${slug}`;
}

export function removeTeamUndescore(id: string) {
  return id.replace(/^team_/, '');
}
