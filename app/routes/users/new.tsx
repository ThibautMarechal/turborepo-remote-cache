import type { ActionFunction } from 'remix';
import { type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { createUser } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';

const schema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
  password: z.string().min(1).max(50),
});

const mutation = makeDomainFunction(schema)(async ({ password, ...user }) => await createUser(user, password));

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
            <Button>Add</Button>
          </>
        )}
      </Form>
    </div>
  );
}
