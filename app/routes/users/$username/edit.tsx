import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserByUsername, updateUser } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { requireAdmin } from '~/roles/rights';
import { ServerRole } from '~/roles/ServerRole';
import { forbidden } from '~/utils/response';
import { json, useLoaderData } from '~/utils/superjson';
import type { User } from '@prisma/client';

const schema = z.object({
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
  role: z.enum([ServerRole.DEVELOPER, ServerRole.ADMIN]),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const user = await getUserByUsername(params.username as string);
  if (user.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's informations");
  }
  return json(user);
};

export const action: ActionFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const user = await getUserByUsername(params.username as string);
  if (user.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's informations");
  }
  const mutation = makeDomainFunction(schema)(async ({ name, email, role }) => {
    await updateUser(user.id, { name, email, role });
  });
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/users/${user.username}`,
  });
};

export default function Edit() {
  const user = useLoaderData<User>();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={user}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Field name="email" />
            <Field name="role" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
