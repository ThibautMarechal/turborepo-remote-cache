import * as React from 'react';
import type { UserDetail } from '~/types/prisma';

type ContextType = UserDetail | null;

const Context = React.createContext<ContextType>(null);
Context.displayName = 'CurrentUserProvider';

export const CurrentUserProvider = ({ children, user }: { children?: React.ReactNode; user: ContextType }) => <Context.Provider value={user}>{children}</Context.Provider>;

export const useCurrentUser = () => React.useContext(Context);
