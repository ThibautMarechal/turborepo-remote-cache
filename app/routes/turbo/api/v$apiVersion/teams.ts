import { type LoaderFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';
import { getTeams } from '~/services/teams.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireTokenAuth(request);

  const teams = await getTeams();
  return json({
    teams,
  });
};
