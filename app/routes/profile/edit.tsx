import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail, updateUser } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import Form from '~/component/Form';

const schema = z.object({
  id: z.string(),
  username: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
});

const mutation = makeDomainFunction(schema)(async ({ id, ...user }) => await updateUser(id, user));

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  return getUserDetail(user.id);
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
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
      <Form schema={schema} values={user} hiddenFields={['id']}>
        {({ Field, Button }) => (
          <>
            <Field name="username" />
            <Field name="name" />
            <Field name="email" />
            <Field name="id" />
            <Button>Update</Button>
          </>
        )}
      </Form>
    </div>
  );
}
