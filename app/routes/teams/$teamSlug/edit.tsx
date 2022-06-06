import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { getTeamBySlug, updateTeam } from '~/services/teams.server';

const schema = z.object({
  name: z.string().min(1).max(50),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  return await getTeamBySlug(params.teamSlug as string);
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  const mutation = makeDomainFunction(schema)(async ({ name }) => await updateTeam(team.id, { name }));
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/teams/${team.slug}`,
  });
};

export default function Edit() {
  const team = useLoaderData();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={team}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
