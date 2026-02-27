'use client';

import { createContext, useContext } from 'react';

const UserContext = createContext<{ email: string }>({ email: '' });

interface UserProviderProps {
  email: string;
  children: React.ReactNode;
}

export function UserProvider({ email, children }: UserProviderProps) {
  return <UserContext.Provider value={{ email }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
