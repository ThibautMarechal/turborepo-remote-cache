import { useSearchParams, type ActionFunction, type LoaderFunction, redirect } from 'remix';
import { z } from 'zod';
import Form from '~/component/Form';
import { authenticator } from '~/services/authentication.server';
import { getUser } from '~/services/users.server';

const schema = z.object({
  redirect_to: z.string().optional(),
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(50),
});

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect_to') ?? '/dashboard';
  if (userId) {
    try {
      await getUser(userId);
      return redirect(redirectTo);
    } catch (e) {
      // Logout deleted users
      return await authenticator.logout(request, { redirectTo: '/login' });
    }
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone(); // cannot read 2 times the formData without clone
  const formData = await request.formData();
  const redirectUri = formData.get('redirect_to')?.toString() ?? '/';
  return await authenticator.authenticate('user-pass', clonedRequest, {
    successRedirect: redirectUri,
    failureRedirect: `/login?redirect_to=${redirectUri}`,
  });
};

export default function Login() {
  const [searchParams] = useSearchParams();
  return (
    <div className="container mx-auto flex justify-center">
      <Form
        schema={schema}
        hiddenFields={['redirect_to']}
        method="post"
        values={{
          redirect_to: searchParams.get('redirect_to') || '/',
        }}
      >
        {({ Field, Button }) => (
          <>
            <Field name="redirect_to" />
            <Field name="username" />
            <Field name="password" type="password" />
            <Button>Log In</Button>
          </>
        )}
      </Form>
    </div>
  );
}
