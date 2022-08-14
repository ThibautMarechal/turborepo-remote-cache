import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { createUser } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { requireAdmin } from '~/roles/rights';
import { ServerRole } from '~/roles/ServerRole';

const schema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
  password: z.string().min(1).max(50),
  role: z.enum([ServerRole.DEVELOPER, ServerRole.ADMIN]),
});

const mutation = makeDomainFunction(schema)(async ({ password, ...user }) => await createUser(user, password));

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return null;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/users',
  });
};

export default function New() {
  return (
    <div className="flex justify-center">
      <Form schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Field name="email" />
            <Field name="username" />
            <Field name="password" type="password" />
            <Field name="role" />
            <Button>Add</Button>
          </>
        )}
      </Form>
    </div>
  );
}
