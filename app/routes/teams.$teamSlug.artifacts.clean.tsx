import type { ActionFunction, LoaderFunction } from 'react-router';
import { requireCookieAuth } from '~/services/authentication.server';
import { requireTeamOwner } from '~/roles/rights';
import { getTeamBySlug } from '~/services/teams.server';
import { cleanAction } from '~/clean/cleanAction.server';
import { CleanForm } from '~/clean/CleanForm';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  return cleanAction(request, { teamId: team.id, successPath: `/teams/${team.slug}/artifacts` });
};

export default CleanForm;
