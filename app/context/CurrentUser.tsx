import type { Artifact, Member, Session, Team, User } from '@prisma/client';
import * as React from 'react';

type ContextType = null | (User & { memberships: Array<Member & { team: Team }>; sessions: Session[]; artifacts: Artifact[] });

const Context = React.createContext<ContextType>(null);
Context.displayName = 'CurrentUserProvider';

export const CurrentUserProvider = ({ children, user }: { children?: React.ReactNode; user: ContextType }) => <Context.Provider value={user}>{children}</Context.Provider>;

export const useCurrentUser = () => React.useContext(Context);
