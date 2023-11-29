import * as React from 'react';
import Gravatar from 'react-gravatar';
import { Link } from '@remix-run/react';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import type { UserDetail } from '~/types/prisma';
import HasRights from './HasRights';
import { isAdmin } from '~/roles/rights';

type Props = {
  user: UserDetail;
  children?: React.ReactNode;
  editable?: boolean;
  baseRoute?: string;
};

export const UserCard = ({ user, children, editable, baseRoute }: Props) => {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <div className="avatar">
            <div className="rounded-full">
              <Gravatar email={user.email} title={user.email} />
            </div>
          </div>
          {user.name}
          {editable && !user.isSuperAdmin && (
            <HasRights predicate={(u) => isAdmin(u) || u.id === user.id}>
              <div className="absolute top-1 right-1">
                <Link to={`${baseRoute}/edit`} prefetch="intent" title="Edit user" className="btn btn-xs btn-outline mx-1">
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <Link to={`${baseRoute}/change_password`} prefetch="intent" title="Change password" className="btn btn-xs btn-outline">
                  <KeyIcon className="h-4 w-4" />
                </Link>
              </div>
            </HasRights>
          )}
        </h2>
        <div>
          <span className="font-bold mr-2">Name:</span>
          {user.name}
          <br />
          <span className="font-bold mr-2">Username:</span>
          {user.username}
          <br />
          <span className="font-bold mr-2">Email:</span>
          {user.email}
          <br />
          <span className="font-bold mr-2">Role:</span>
          {user.role}
          <br />
          <span className="font-bold mr-2">Teams:</span>
          {user.memberships.length ? (
            user.memberships.map((membership) => (
              <Link to={`/teams/${membership.team.slug}`} className="badge mr-2" key={membership.id}>
                {membership.team.name}
              </Link>
            ))
          ) : (
            <span className="opacity-50">No Teams</span>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
