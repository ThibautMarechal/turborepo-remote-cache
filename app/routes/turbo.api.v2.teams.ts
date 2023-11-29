import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { addTeamUndescore } from '~/mapper/team';
import { ServerRole } from '~/roles/ServerRole';
import { TeamRole } from '~/roles/TeamRole';
import { requireTokenAuth } from '~/services/authentication.server';
import { getTeams, getUserTeams } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  const user = await requireTokenAuth(request);
  const teams = user.role === ServerRole.ADMIN ? await getTeams(0, 100) : await getUserTeams(user.id, 100);
  return json({
    teams: teams.map((team) => ({
      id: addTeamUndescore(team.slug),
      name: team.name,
      slug: team.slug,
      createdAt: team.creationDate.getTime(),
      created: team.creationDate,
      membership: {
        role: user.role === ServerRole.ADMIN ? TeamRole.OWNER : user.memberships.find((m) => m.teamId === team.id)?.role,
      },
    })),
    pagination: {
      count: 0,
      next: 0,
      prev: 0,
    },
  });
};
