import type { ActionFunction, LoaderFunction } from 'react-router';
import { requireCookieAuth, requireTokenAuth } from '~/services/authentication.server';
import { requireAdmin } from '~/roles/rights';
import type { UserDetail } from '~/types/prisma';
import { cleanAction } from '~/clean/cleanAction.server';
import { CleanForm } from '~/clean/CleanForm';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  let user: UserDetail;
  try {
    user = await requireTokenAuth(request);
  } catch {
    user = await requireCookieAuth(request, false);
  }
  requireAdmin(user);
  return cleanAction(request, { successPath: '/artifacts' });
};

export default CleanForm;
