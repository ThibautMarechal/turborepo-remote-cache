import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { getTeam, updateTeam } from '~/services/teams.server';

const schema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(10),
});

const mutation = makeDomainFunction(schema)(async ({ id, ...team }) => await updateTeam(id, team));

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  return await getTeam(params.id as string);
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/teams/${params.id}`,
  });
};

export default function Edit() {
  const team = useLoaderData();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={team} hiddenFields={['id']}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Field name="slug" />
            <Field name="id" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
