import type { Team } from '@prisma/client';
import { useId } from 'react';
import { json, type LoaderFunction, useLoaderData } from 'remix';
import Modal from '~/component/Modal';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeams } from '~/services/teams.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return json(await getTeams());
};

export default function Teams() {
  const teams = useLoaderData<Team[]>();
  const modalId = useId();
  return (
    <div>
      <h1>Teams</h1>
      <Modal.Opener id={modalId}>Create a team</Modal.Opener>
      <Modal id={modalId}></Modal>
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
