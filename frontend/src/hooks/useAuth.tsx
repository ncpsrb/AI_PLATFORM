import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, login as loginRequest, type Session } from '../services/auth';
import type { User } from '../types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  login: (email: string, password: string, admin?: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'ai-agent-platform-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      setUser(null);
      return;
    }

    getMe(session.access_token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
        setUser(null);
      });
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user,
      login: async (email: string, password: string, admin = false) => {
        const nextSession = await loginRequest(email, password, admin);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
        setUser(null);
      },
    }),
    [session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
