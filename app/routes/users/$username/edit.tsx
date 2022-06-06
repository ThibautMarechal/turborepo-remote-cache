import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserByUsername, updateUser } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { requireAdmin } from '~/roles/rights';

const schema = z.object({
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return getUserByUsername(params.username as string);
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const currentUser = await requireCookieAuth(request);
  requireAdmin(currentUser);
  const user = await getUserByUsername(params.username as string);
  const mutation = makeDomainFunction(schema)(async ({ name, email }) => await updateUser(user.id, { name, email }));
  return formAction({
    request,
    schema,
    mutation,
    successPath: `/users/${user.username}`,
  });
};

export default function Edit() {
  const user = useLoaderData();
  return (
    <div className="flex justify-center">
      <Form schema={schema} values={user}>
        {({ Field, Button }) => (
          <>
            <Field name="name" />
            <Field name="email" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
