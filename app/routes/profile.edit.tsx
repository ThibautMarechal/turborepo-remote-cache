import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from '~/formAction';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail, updateUser } from '~/services/users.server';
import { makeDomainFunction } from 'domain-functions';
import { Form } from '~/component/Form';
import { ServerRole } from '~/roles/ServerRole';
import { json, useLoaderData } from '~/utils/superjson';
import type { User } from '@prisma/client';
import { forbidden } from '~/utils/response';

const schema = z.object({
  id: z.string(),
  username: z.string().min(1).max(255),
  email: z.string().min(1).email(),
  name: z.string().min(1).max(255),
  role: z.enum([ServerRole.DEVELOPER, ServerRole.ADMIN]),
});

export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCookieAuth(request);
  if (currentUser.isExternal) {
    throw forbidden("Cannot update external user's password");
  }
  return json(await getUserDetail(currentUser.id));
};

export const action: ActionFunction = async ({ request }) => {
  const currentUser = await requireCookieAuth(request);
  const mutation = makeDomainFunction(schema)(async ({ id, ...user }) => {
    if (user.role !== currentUser.role) {
      forbidden('The current user cannot change his current role');
    }
    await updateUser(id, user);
  });

  return formAction({
    request,
    schema,
    mutation,
    successPath: `/profile`,
  });
};

export default function Edit() {
  const user = useLoaderData<User>();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={user}>
        {({ Field, Button }) => (
          <>
            <Field name="username" />
            <Field name="name" />
            <Field name="email" />
            <Field name="id" hidden />
            <Field name="role" hidden />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
