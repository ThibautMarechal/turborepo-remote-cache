import type { ActionFunction, LoaderFunction } from 'remix';
import { Form, redirect, useSearchParams } from 'remix';
import invariant from 'tiny-invariant';
import { requireCookieAuth } from '~/services/authentication.server';
import { generateToken } from '~/services/tokens.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  if (request.method === 'POST') {
    const formData = await request.formData();
    const formAction = formData.get('_action')?.toString();
    switch (formAction) {
      case 'allow': {
        const redirectUri = formData.get('redirect_uri')?.toString();
        invariant(redirectUri, 'missing redirectUri');
        const [newToken] = await generateToken(user.id);
        const redirectUrlWithToken = new URL(redirectUri);
        redirectUrlWithToken.searchParams.set('token', newToken);
        return redirect(redirectUrlWithToken.toString());
      }
      case 'deny': {
        return redirect('/');
      }
    }
  } else {
    return redirect('/');
  }
};

export default function Index() {
  const [searchParams] = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');

  return (
    <Form method="post">
      <input type="hidden" name="redirect_uri" value={redirectUri ?? ''} />
      <button name="_action" value="allow">
        Allow
      </button>
      <button name="_action" value="deny">
        Deny
      </button>
    </Form>
  );
}
