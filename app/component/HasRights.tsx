import * as React from 'react';
import { useCurrentUser } from '~/context/CurrentUser';
import type { UserDetail } from '~/types/prisma';

type Props = {
  children: React.ReactNode;
  predicate: (user: UserDetail) => boolean;
};

export const HasRights = ({ children, predicate }: Props) => {
  const currentUser = useCurrentUser();
  return <>{currentUser && predicate(currentUser) && children} </>;
};

export default HasRights;
