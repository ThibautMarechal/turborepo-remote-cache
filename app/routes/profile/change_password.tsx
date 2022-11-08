import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from '~/formAction';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { updateUserPassword } from '~/services/users.server';
import { makeDomainFunction } from 'domain-functions';
import { Form } from '~/component/Form';
import { forbidden, unprocessableEntity } from '~/utils/response';

const schema = z.object({
  password: z.string().min(1),
  repeatedPassword: z.string().min(1),
});

export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCookieAuth(request);
  if (currentUser.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  if (currentUser.isExternal) {
    throw forbidden("Cannot update external user's password");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const currentUser = await requireCookieAuth(request);
  if (currentUser.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  const mutation = makeDomainFunction(schema)(async ({ password, repeatedPassword }) => {
    if (password !== repeatedPassword) {
      throw unprocessableEntity("passwords doesn't match");
    }
    await updateUserPassword(currentUser.id, password);
  });
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/profile`,
  });
};

export default function CHangePasswords() {
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
