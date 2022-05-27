import { NavLink, Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from 'remix';
import type { MetaFunction, LinksFunction, LoaderFunction } from 'remix';
import Gravatar from 'react-gravatar';
import styles from './tailwind.css';
import { authenticator } from './services/authentication.server';
import type { User } from '@prisma/client';
import { useMatch } from 'react-router';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return { user: await authenticator.isAuthenticated(request) };
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export default function App() {
  const { user } = useLoaderData<{ user: User }>();
  return (
    <html lang="en" className="bg-base-300" data-theme="turbo">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <Link to="/">
              <h1>
                <img src="/favicon.ico" alt="logo" className="mask mask-circle w-10 inline-block mr-5" />
                Turbo Remote Cache
              </h1>
            </Link>
          </div>
          <div className="flex-none">
            {user ? (
              <ul className="menu menu-horizontal p-0">
                <li>
                  <NavLink to="/users">Users</NavLink>
                </li>
                <li>
                  <NavLink to="/teams">Teams</NavLink>
                </li>
                <li>
                  <NavLink to="/sessions">Sessions</NavLink>
                </li>
                <li>
                  <NavLink to="/events">Events</NavLink>
                </li>
                <li>
                  <NavLink to="/artifacts">Artifacts</NavLink>
                </li>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <Gravatar className="w-10 rounded-full" email={user.email} />
                  </label>
                  <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                      <Link to="/logout">Logout</Link>
                    </li>
                  </ul>
                </div>
              </ul>
            ) : null}
          </div>
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
