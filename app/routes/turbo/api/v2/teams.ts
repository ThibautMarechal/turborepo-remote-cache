import { type LoaderFunction, json } from 'remix';
import { ToVercelTeam } from '~/mapper/team';
import { requireTokenAuth } from '~/services/authentication.server';
import { getUserTeams } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET);
  const user = await requireTokenAuth(request);
  const teams = await getUserTeams(user.id);
  return json({
    teams: teams.map(ToVercelTeam),
    pagination: {
      count: 0,
      next: 0,
      prev: 0,
    },
  });
};
