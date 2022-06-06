import * as React from 'react';
import { useCurrentUser } from '~/context/CurrentUser';
import type { UserDetail } from '~/types/prisma';

type Props = {
  children: React.ReactNode;
  predicate: (user: UserDetail) => boolean;
};

export const HasRights = ({ children, predicate }: Props) => {
  const currentUser = useCurrentUser();
  let hasAccess = false;
  try {
    if (currentUser && predicate(currentUser)) {
      hasAccess = true;
    }
  } catch (e) {
    hasAccess = false;
  }
  return <>{hasAccess && children} </>;
};

export default HasRights;
