import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'remix';
import type { MetaFunction, LinksFunction, LoaderFunction } from 'remix';
import tailwind from './tailwind.css';
import { authenticator } from './services/authentication.server';
import { getUserDetail } from './services/users.server';
import { CurrentUserProvider } from './context/CurrentUser';
import Navigation from './component/Navigation';

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

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: tailwind }];

export default function Root() {
  const { user } = useLoaderData<{ user: Awaited<ReturnType<typeof getUserDetail>> }>();

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
