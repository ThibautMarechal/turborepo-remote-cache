import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { makeDomainFunction } from 'domain-functions';
import { formAction } from '~/formAction';
import { z } from 'zod';
import { Form } from '~/component/Form';
import { requireTeamOwner } from '~/roles/rights';
import { TeamRole } from '~/roles/TeamRole';
import { requireCookieAuth } from '~/services/authentication.server';
import { changeTeamRole, getTeamDetailBySlug } from '~/services/teams.server';
import { getUserDetailByUsername } from '~/services/users.server';
import type { TeamDetail, UserDetail } from '~/types/prisma';
import { json, useLoaderData } from '~/utils/superjson';

const schema = z.object({
  role: z.enum([TeamRole.OWNER, TeamRole.MEMBER]),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  const team = await getTeamDetailBySlug(params.teamSlug as string);
  requireTeamOwner(currentUser, team.id);
  const user = await getUserDetailByUsername(params.username as string);
  return json({
    team,
    user,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  const team = await getTeamDetailBySlug(params.teamSlug as string);
  requireTeamOwner(currentUser, team.id);
  const user = await getUserDetailByUsername(params.username as string);
  return formAction({
    request,
    schema,
    mutation: makeDomainFunction(schema)(({ role }) => changeTeamRole(team.id, user.id, role)),
    successPath: `/teams/${team.slug}/users`,
  });
};

export default function Add() {
  const { team, user } = useLoaderData<{ user: UserDetail; team: TeamDetail }>();
  return (
    <div className="flex justify-center">
      <Form method="post" schema={schema} values={{ role: user.memberships.find((membership) => membership.teamId === team.id)?.role }}>
        {({ Field, Button }) => (
          <>
            <Field name="role" />
            <Button>Update role</Button>
          </>
        )}
      </Form>
    </div>
  );
}
