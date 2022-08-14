import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useSearchParams } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { requireCookieAuth } from '~/services/authentication.server';
import { generateToken } from '~/services/tokens.server';
import { METHOD } from '~/utils/method';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireCookieAuth(request);
  if (request.method === METHOD.POST) {
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
    <>
      <h1 className="text-center text-4xl font-bold m-10">Authorize</h1>
      <p className="text-center m-10">Please authorize to connect with Turborepo CLI</p>
      <Form method="post" className="flex w-full justify-center gap-10">
        <input type="hidden" name="redirect_uri" value={redirectUri ?? ''} />
        <button name="_action" value="allow" autoFocus className="btn btn-primary">
          Allow
        </button>
        <button name="_action" value="deny" className="btn btn-error">
          Deny
        </button>
      </Form>
    </>
  );
}
