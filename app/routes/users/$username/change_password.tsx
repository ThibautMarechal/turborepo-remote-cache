import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserByUsername, updateUserPassword } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { requireAdmin } from '~/roles/rights';
import { forbidden, unprocessableEntity } from '~/utils/response';

const schema = z.object({
  password: z.string().min(1),
  repeatedPassword: z.string().min(1),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const user = await getUserByUsername(params.username as string);
  if (user.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const user = await getUserByUsername(params.username as string);
  if (user.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  const mutation = makeDomainFunction(schema)(async ({ password, repeatedPassword }) => {
    if (password !== repeatedPassword) {
      throw unprocessableEntity("passwords doesn't match");
    }
    await updateUserPassword(user.id, password);
  });
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/users/${user.username}`,
  });
};

export default function Edit() {
  return (
    <div className="flex justify-center">
      <Form schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="password" type="password" />
            <Field name="repeatedPassword" type="password" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
