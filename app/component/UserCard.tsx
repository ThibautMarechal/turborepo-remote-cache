import * as React from 'react';
import Gravatar from 'react-gravatar';
import { Link } from 'remix';
import PencilIcon from '@heroicons/react/outline/PencilIcon';
import type { UserDetail } from '~/types/prisma';
import HasRights from './HasRights';
import { requireAdmin } from '~/roles/rights';

type Props = {
  user: UserDetail;
  children?: React.ReactNode;
  editable?: boolean;
};

export const UserCard = ({ user, children, editable }: Props) => {
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
          {editable && (
            <HasRights predicate={(u) => requireAdmin(u) || u.id === user.id}>
              <Link to={`/users/${user.username}/edit`} prefetch="intent" className="btn btn-xs absolute top-0 right-0">
                <PencilIcon className="h-4 w-4" />
              </Link>
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
          <span className="font-bold mr-2">Teams:</span>
          {user.memberships.length ? (
            user.memberships.map((membership) => (
              <div className="badge mr-2" key={membership.id}>
                {membership.team.name}
              </div>
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
