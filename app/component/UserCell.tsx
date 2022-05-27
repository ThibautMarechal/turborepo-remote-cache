import type { User } from '@prisma/client';
import * as React from 'react';
import Gravatar from 'react-gravatar';
import { Link } from 'remix';

type Props = {
  user: User;
};

export const UserCell = ({ user }: Props) => {
  return (
    <Link className="flex" to={`/users/${user.id}`}>
      <Gravatar className="w-6 rounded-full mr-2" email={user.email} /> {user.name} ({user.username})
    </Link>
  );
};

export default UserCell;
