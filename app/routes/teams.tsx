import { json, type LoaderFunction, useLoaderData } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeams } from '~/services/teams.server';
import type { Team } from '~/types/Team';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return json(await getTeams());
};

export default function Teams() {
  const teams = useLoaderData<Team[]>();

  return (
    <div>
      <h1>Teams</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            {team.name} ({team.slug})
          </li>
        ))}
      </ul>
    </div>
  );
}
