import type { User } from '@prisma/client';
import Gravatar from 'react-gravatar';
import { Link } from '@remix-run/react';

type Props = {
  user: User;
};

export const UserCell = ({ user }: Props) => {
  return (
    <Link className="flex" to={`/users/${user.username}`}>
      <Gravatar className="w-6 rounded-full mr-2" email={user.email} /> {user.name} ({user.username})
    </Link>
  );
};

export default UserCell;
