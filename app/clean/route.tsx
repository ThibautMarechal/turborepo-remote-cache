import type { ActionFunction, LoaderFunction, Params } from 'react-router';
import { z } from 'zod';
import { makeDomainFunction, toComposable } from 'domain-functions';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import classNames from 'classnames';
import { formAction } from '~/formAction';
import { Form } from '~/component/Form';
import { requireCookieAuth, requireTokenAuth } from '~/services/authentication.server';
import { requireAdmin, requireTeamOwner } from '~/roles/rights';
import { startArtifactCleanup } from '~/services/artifact.server';
import { getTeamBySlug } from '~/services/teams.server';
import { getUserByUsername } from '~/services/users.server';
import { CleanPeriod } from './CleanPeriod';

/**
 * Single route module for every "clean artifacts" page, registered in `app/routes.ts` on:
 * - /artifacts/clean                   → all artifacts (admin, or API token of an admin)
 * - /profile/artifacts/clean           → artifacts of the current user
 * - /users/:username/artifacts/clean   → artifacts of a user (admin)
 * - /teams/:teamSlug/artifacts/clean   → artifacts of a team (team owner)
 */

const schema = z.object({
  period: z.enum([CleanPeriod.DAY, CleanPeriod.WEEK, CleanPeriod.MONTH, CleanPeriod.YEAR]),
});

type CleanTarget = { userId?: string; teamId?: string; successPath: string };

/** Check the permissions of the current user and resolve which artifacts the page cleans. */
async function requireCleanTarget(request: Request, params: Params, { isAction }: { isAction: boolean }): Promise<CleanTarget> {
  if (params.teamSlug) {
    const user = await requireCookieAuth(request);
    const team = await getTeamBySlug(params.teamSlug);
    requireTeamOwner(user, team.id);
    return { teamId: team.id, successPath: `/teams/${team.slug}/artifacts` };
  }
  if (params.username) {
    requireAdmin(await requireCookieAuth(request));
    const user = await getUserByUsername(params.username);
    return { userId: user.id, successPath: `/users/${user.username}/artifacts` };
  }
  if (new URL(request.url).pathname.startsWith('/profile/')) {
    const user = await requireCookieAuth(request);
    return { userId: user.id, successPath: '/profile/artifacts' };
  }
  // Global clean: the action can also be called with an API token (e.g. from a scheduled job)
  const user = isAction ? await requireTokenAuth(request).catch(() => requireCookieAuth(request, false)) : await requireCookieAuth(request);
  requireAdmin(user);
  return { successPath: '/artifacts' };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCleanTarget(request, params, { isAction: false });
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { userId, teamId, successPath } = await requireCleanTarget(request, params, { isAction: true });
  const mutation = toComposable(makeDomainFunction(schema)(async ({ period }) => startArtifactCleanup(period, { userId, teamId })));
  return formAction({ request, schema, mutation, successPath });
};

export default function Clean() {
  return (
    <div className="flex justify-center">
      <Form schema={schema}>
        {({ Field, Button, formState }) => (
          <>
            <Field name="period" />
            <Button>
              <TrashIcon className={classNames('w-4 mr-2', { 'animate-spin': formState.isSubmitted })} />
              Clean
            </Button>
          </>
        )}
      </Form>
    </div>
  );
}
