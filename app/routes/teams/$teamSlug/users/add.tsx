import type { User } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { makeDomainFunction } from 'remix-domains';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { Form } from '~/component/Form';
import { requireTeamOwner } from '~/roles/rights';
import { TeamRole } from '~/roles/TeamRole';
import { requireCookieAuth } from '~/services/authentication.server';
import { addUserToTteam, getTeamDetailBySlug } from '~/services/teams.server';
import { getUsers } from '~/services/users.server';
import type { TeamDetail } from '~/types/prisma';
import { json, useLoaderData } from '~/utils/superjson';

const schema = z.object({
  userId: z.string().uuid(),
  role: z.enum([TeamRole.OWNER, TeamRole.MEMBER]),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamDetailBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  return json({
    team,
    users: await getUsers(),
  });
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamDetailBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  const mutation = makeDomainFunction(schema)(async ({ userId, role }) => await addUserToTteam(team.id, userId, role));
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/teams/${team.slug}/users`,
  });
};

export default function Users() {
  const { team, users } = useLoaderData<{ users: User[]; team: TeamDetail }>();
  return (
    <div className="flex justify-center">
      <Form method="post" schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="userId" options={users.filter((user) => team.members.every((member) => member.userId !== user.id)).map((user) => ({ name: user.name, value: user.id }))} />
            <Field name="role" />
            <Button>Add user</Button>
          </>
        )}
      </Form>
    </div>
  );
}
