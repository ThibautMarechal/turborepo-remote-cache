import { type LoaderFunction, json } from 'remix';
import invariant from 'tiny-invariant';
import { requireTokenAuth } from '~/services/authentication.server';
import { getUserTeams } from '~/services/teams.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  invariant(params.teamId);
  const teams = await getUserTeams(user.id);
  return json({
    teams,
  });
};
