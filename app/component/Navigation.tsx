import Gravatar from 'react-gravatar';
import { Link, NavLink, useLocation } from '@remix-run/react';
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
    <div className="navbar bg-base-100 sticky top-0 z-20 shadow-xl">
      <div className="flex-1 whitespace-nowrap">
        <Link to="/" className={cn({ fullturbo: pathname === '/' })} prefetch="intent">
          <h1 className="text-2xl font-bold">
            Turbo Remote Cache
            <img src="/favicon.svg" alt="logo" className="-translate-x-3/4 w-10 inline-block mr-5" />
          </h1>
        </Link>
      </div>
      <div className="flex-none">
        {user && (
          <ul className="menu menu-horizontal p-0 gap-1">
            <li>
              <NavLink to="/users" className="text-primary-content">
                <UsersIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/users'), 'text-secondary': pathname.startsWith('/users') })} />
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/teams" className="text-primary-content">
                <UserGroup className={cn('h-5', { 'text-primary': !pathname.startsWith('/teams'), 'text-secondary': pathname.startsWith('/teams') })} />
                Teams
              </NavLink>
            </li>
            <li>
              <HasRights predicate={(u) => isAdmin(u)}>
                <NavLink to="/sessions" className="text-primary-content hover:text-red-50">
                  <BoltIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/sessions'), 'text-secondary': pathname.startsWith('/sessions') })} />
                  Sessions
                </NavLink>
              </HasRights>
            </li>
            <li>
              <HasRights predicate={(u) => isAdmin(u)}>
                <NavLink to="/artifacts" className="text-primary-content">
                  <ArchiveBoxIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/artifacts'), 'text-secondary': pathname.startsWith('/artifacts') })} />
                  Artifacts
                </NavLink>
              </HasRights>
            </li>
            <HasRights predicate={(u) => isAdmin(u)}>
              <li>
                <NavLink to="/tokens" className="text-primary-content">
                  <FingerPrintIcon className={cn('h-5', { 'text-primary': !pathname.startsWith('/tokens'), 'text-secondary': pathname.startsWith('/tokens') })} />
                  Tokens
                </NavLink>
              </li>
            </HasRights>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <Gravatar className="w-10 rounded-full" email={user.email} />
              </label>
              <ul tabIndex={0} className="mt-3 p-2 menu menu-compact shadow-2xl dropdown-content bg-base-100 rounded-box w-52">
                <li className="w-full">
                  <Link className="flex justify-between w-full" to="/profile">
                    Profile
                    <UserIcon className="h-5 text-primary" />
                  </Link>
                </li>
                <li className="w-full">
                  <Link className="flex justify-between w-full" to="/logout">
                    Logout
                    <ArrowRightOnRectangleIcon className="h-5 text-primary" />
                  </Link>
                </li>
              </ul>
            </div>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navigation;
