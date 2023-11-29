import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';

import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from '@remix-run/react';

import { authenticator } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';
import { CurrentUserProvider } from '~/context/CurrentUser';
import Navigation from '~/component/Navigation';
import type { UserDetail } from '~/types/prisma';
import tailwind from './tailwind.css';
import fullturboStyle from '~/styles/fullturbo.css';
import { json, useLoaderData } from '~/utils/superjson';

export const meta: MetaFunction = () => [
  {
    title: 'Turborepo Remote Cache',
  },
  {
    charSet: 'utf-8',
  },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1',
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userFromCookie = await authenticator.isAuthenticated(request);
  try {
    return json({ user: userFromCookie ? await getUserDetail(userFromCookie) : null });
  } catch (e) {
    return json({ user: null });
  }
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwind },
  { rel: 'stylesheet', href: fullturboStyle },
  { rel: 'icon', href: '/favicon.svg' },
];

export default function Root() {
  const { user } = useLoaderData<{ user: UserDetail | null }>();

  return (
    <CurrentUserProvider user={user}>
      <html lang="en" className="bg-base-300" data-theme="turbo">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <Navigation />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </CurrentUserProvider>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : '';
  const data = isRouteErrorResponse(error) ? error.data : error instanceof Error ? error.message : 'Unknown error';
  return (
    <html lang="en" className="bg-base-300" data-theme="turbo">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        <div className="m-20 text-4xl text-center text-error">{status}</div>
        <div className="m-0 text-lg text-center text-error">{JSON.stringify(data, null, 2)}</div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};
