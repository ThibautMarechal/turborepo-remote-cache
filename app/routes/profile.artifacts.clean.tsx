import type { ActionFunction, LoaderFunction } from 'react-router';
import { requireCookieAuth } from '~/services/authentication.server';
import { cleanAction } from '~/clean/cleanAction.server';
import { CleanForm } from '~/clean/CleanForm';

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  return cleanAction(request, { userId: user.id, successPath: '/profile/artifacts' });
};

export default CleanForm;
