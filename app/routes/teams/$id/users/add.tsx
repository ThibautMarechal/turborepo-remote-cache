import type { User } from '@prisma/client';
import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { makeDomainFunction } from 'remix-domains';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { Form } from '~/component/Form';
import { requireCookieAuth } from '~/services/authentication.server';
import { addUserToTteam, getTeamDetail } from '~/services/teams.server';
import { getUsers } from '~/services/users.server';
import type { TeamDetail } from '~/types/prisma';
import { TeamRole } from '~/types/roles';

const schema = z.object({
  userId: z.string().uuid(),
  teamId: z.string().uuid(),
  role: z.enum([TeamRole.OWNER, TeamRole.MEMBER]),
});

const mutation = makeDomainFunction(schema)(async ({ teamId, userId, role }) => await addUserToTteam(teamId, userId, role));

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const [team, users] = await Promise.all([getTeamDetail(params.id as string), getUsers()]);
  return {
    team,
    users,
  };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/teams/${params.id}/users`,
  });
};

export default function Users() {
  const { team, users } = useLoaderData<{ users: User[]; team: TeamDetail }>();
  return (
    <div className="flex justify-center">
      <Form method="post" schema={schema} hiddenFields={['teamId']} values={{ teamId: team.id }}>
        {({ Field, Button }) => (
          <>
            <Field name="teamId" />
            <Field name="userId" options={users.filter((user) => team.members.every((member) => member.userId !== user.id)).map((user) => ({ name: user.name, value: user.id }))} />
            <Field name="role" />
            <Button>Add user</Button>
          </>
        )}
      </Form>
    </div>
  );
}
