import Gravatar from 'react-gravatar';
import { Form, Link, NavLink, useLocation } from '@remix-run/react';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import UserGroup from '@heroicons/react/24/outline/UserGroupIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon';
import cn from 'classnames';
import { useCurrentUser } from '~/context/CurrentUser';
import HasRights from './HasRights';
import { isAdmin } from '~/roles/rights';

export const Navigation = () => {
  const user = useCurrentUser();
  const { pathname } = useLocation();
  return (
    <div className="sticky top-0 z-20 pt-0 pb-0 shadow-xl navbar bg-base-100 min-h-16">
      <div className="flex-1 whitespace-nowrap navbar-start">
        <Link to="/" className={cn({ fullturbo: pathname === '/' })} prefetch="intent">
          <h1 className="text-2xl font-bold">
            Turbo Remote Cache
            <img src="/favicon.svg" alt="logo" className="inline-block w-10 mr-5 -translate-x-3/4" />
          </h1>
        </Link>
      </div>
      <div className="flex-none h-fit">
        {user && (
          <ul className="gap-1 p-0 menu menu-horizontal">
            <li className="justify-center">
              <NavLink to="/users">
                <UsersIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/users'), 'text-secondary': pathname.startsWith('/users') })} />
                Users
              </NavLink>
            </li>
            <li className="justify-center">
              <NavLink to="/teams">
                <UserGroup className={cn('h-5', { 'text-primary': !pathname.startsWith('/teams'), 'text-secondary': pathname.startsWith('/teams') })} />
                Teams
              </NavLink>
            </li>
            <li className="justify-center">
              <HasRights predicate={(u) => isAdmin(u)}>
                <NavLink to="/sessions">
                  <BoltIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/sessions'), 'text-secondary': pathname.startsWith('/sessions') })} />
                  Sessions
                </NavLink>
              </HasRights>
            </li>
            <li className="justify-center">
              <HasRights predicate={(u) => isAdmin(u)}>
                <NavLink to="/artifacts">
                  <ArchiveBoxIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/artifacts'), 'text-secondary': pathname.startsWith('/artifacts') })} />
                  Artifacts
                </NavLink>
              </HasRights>
            </li>
            <HasRights predicate={(u) => isAdmin(u)}>
              <li className="justify-center">
                <NavLink to="/tokens">
                  <FingerPrintIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/tokens'), 'text-secondary': pathname.startsWith('/tokens') })} />
                  Tokens
                </NavLink>
              </li>
            </HasRights>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="m-2 btn btn-ghost btn-circle avatar">
                <Gravatar className="w-10 rounded-full" email={user.email} />
              </label>
              <ul tabIndex={0} className="p-2 mt-3 shadow-2xl menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                <li className="w-full">
                  <Link className="flex justify-between w-full" to="/profile">
                    Profile
                    <UserIcon className="h-5 text-primary" />
                  </Link>
                </li>
                <Form method="post" action="logout">
                  <li className="w-full">
                    <button className="flex justify-between w-full">
                      Logout
                      <ArrowRightOnRectangleIcon className="h-5 text-primary" />
                    </button>
                  </li>
                </Form>
              </ul>
            </div>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navigation;
