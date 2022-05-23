import { Form, useSearchParams, type ActionFunction, type LoaderFunction } from 'remix';
import { authenticator } from '~/services/authentication.server';
import { getUser } from '~/services/users.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userFromCoockie = await authenticator.isAuthenticated(request);
  if (userFromCoockie) {
    try {
      await getUser(userFromCoockie.id);
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
    <Form method="post">
      <input type="hidden" name="redirect_to" value={searchParams.get('redirect_to') ?? undefined} />
      <input type="text" name="username" required />
      <input type="password" name="password" autoComplete="current-password" required />
      <button>Sign In</button>
    </Form>
  );
}
