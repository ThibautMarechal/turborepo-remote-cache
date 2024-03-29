import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from '~/formAction';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'domain-functions';
import { Form } from '~/component/Form';
import { createTeam } from '~/services/teams.server';
import { requireAdmin } from '~/roles/rights';

const schema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
});

const mutation = makeDomainFunction(schema)(async (team) => await createTeam(team));

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
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
