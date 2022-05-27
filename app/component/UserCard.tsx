import * as React from 'react';
import type { Member, Team, User } from '@prisma/client';
import Gravatar from 'react-gravatar';
import { Link } from 'remix';
import PencilIcon from '@heroicons/react/outline/PencilIcon';

type Props = {
  user: User & {
    memberships: Array<Member & { team: Team }>;
  };
  children?: React.ReactNode;
};

export const UserCard = ({ user, children }: Props) => {
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
          <Link to="./edit" prefetch="intent" className="btn btn-xs absolute top-0 right-0">
            <PencilIcon className="h-4 w-4" />
          </Link>
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
