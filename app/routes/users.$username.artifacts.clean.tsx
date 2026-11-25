import type { ActionFunction, LoaderFunction } from 'react-router';
import { requireCookieAuth } from '~/services/authentication.server';
import { requireAdmin } from '~/roles/rights';
import { getUserByUsername } from '~/services/users.server';
import { cleanAction } from '~/clean/cleanAction.server';
import { CleanForm } from '~/clean/CleanForm';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  requireAdmin(await requireCookieAuth(request));
  const user = await getUserByUsername(params.username as string);
  return cleanAction(request, { userId: user.id, successPath: `/users/${user.username}/artifacts` });
};

export default CleanForm;
