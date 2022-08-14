import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { updateUserPassword } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { forbidden, unprocessableEntity } from '~/utils/response';

const schema = z.object({
  password: z.string().min(1),
  repeatedPassword: z.string().min(1),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  if (currentUser.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  return currentUser;
};

export const action: ActionFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  if (currentUser.isSuperAdmin) {
    throw forbidden("Cannot update super-admin's password");
  }
  const mutation = makeDomainFunction(schema)(async ({ password, repeatedPassword }) => {
    if (password !== repeatedPassword) {
      throw unprocessableEntity("passwords doesn't match");
    }
    await updateUserPassword(currentUser.id, password);
    console.log('here');
  });
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/profile`,
  });
};

export default function Edit() {
  const user = useLoaderData();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={user}>
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
