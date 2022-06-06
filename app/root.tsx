import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, useLoaderData } from 'remix';
import type { MetaFunction, LinksFunction, LoaderFunction } from 'remix';
import { authenticator } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';
import { CurrentUserProvider } from '~/context/CurrentUser';
import Navigation from '~/component/Navigation';
import type { UserDetail } from '~/types/prisma';
import tailwind from '~/styles/tailwind.css';
import fullturboStyle from '~/styles/fullturbo.css';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Turborepo Remote Cache',
  viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const userFromCookie = await authenticator.isAuthenticated(request);
  try {
    return { user: userFromCookie ? await getUserDetail(userFromCookie) : null };
  } catch (e) {
    return { user: null };
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

export const CatchBoundary = () => {
  const caught = useCatch();
  console.log(caught);
  return (
    <html lang="en" className="bg-base-300" data-theme="turbo">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        <div className="text-error text-4xl text-center m-20">{caught.status}</div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};
