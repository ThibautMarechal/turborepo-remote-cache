import React from 'react';
import { redirect, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams, Form as RemixForm } from '@remix-run/react';
import { z } from 'zod';
import { Button, Form } from '~/component/Form';
import { authenticator } from '~/services/authentication.server';
import { getUser } from '~/services/users.server';

const schema = z.object({
  redirect_to: z.string().optional(),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
});

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect_to') ?? '/';
  if (userId) {
    try {
      await getUser(userId);
      return redirect(redirectTo);
    } catch (e) {
      // Logout deleted users
      return await authenticator.logout(request, { redirectTo: '/login' });
    }
  }
  const authStrategies = [];
  if (process.env.OIDC === 'true') {
    authStrategies.push({
      type: 'oidc',
      name: process.env.OIDC_NAME ?? 'OpenIdConnect',
    });
  }
  if (process.env.AZURE_AD === 'true') {
    authStrategies.push({
      type: 'azure-ad',
      name: 'Azure AD',
    });
  }
  return { authStrategies };
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
  const { authStrategies } = useLoaderData<{ authStrategies: Array<{ type: string; name: string }> }>();
  const redirectTo = searchParams.get('redirect_to') || '/';
  return (
    <div className="container mx-auto flex justify-center">
      <div>
        <Form
          schema={schema}
          hiddenFields={['redirect_to']}
          method="post"
          values={{
            redirect_to: redirectTo,
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
        {authStrategies.map((startegy) => (
          <React.Fragment key={startegy.type}>
            <div className="divider" />
            <RemixForm method="post" action={`/login/${startegy.type}?redirect_to=${redirectTo}`}>
              <Button>{startegy.name}</Button>
            </RemixForm>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
