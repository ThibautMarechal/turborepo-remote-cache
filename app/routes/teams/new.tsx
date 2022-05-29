import type { ActionFunction } from 'remix';
import { type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { createTeam } from '~/services/teams.server';

const schema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(10),
});

const mutation = makeDomainFunction(schema)(async (team) => await createTeam(team));

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/teams',
  });
};

export default function New() {
  return (
    <div className="flex justify-center">
      <Form schema={schema} />
    </div>
  );
}
