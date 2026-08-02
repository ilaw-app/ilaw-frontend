import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { tokenStore } from '../api/client';
import { authApi } from '../api/auth';
import type { Role, User } from '../api/types';

type AuthState = {
  ready: boolean; // 부팅 세션 복구 완료 여부
  user: User | null;
  role: Role; // 항상 서버(GET /auth/me)의 user.role
  isAuthed: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (u: User | null) => void;
  refreshMe: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [authed, setAuthed] = useState<boolean>(!!tokenStore.getAccess());

  async function refreshMe(): Promise<User | null> {
    if (!tokenStore.getAccess()) return null;
    try {
      const me = await authApi.me();
      setUserState(me);
      setAuthed(true);
      return me;
    } catch {
      // client가 401 시 refresh를 시도하고, 실패하면 토큰을 지움
      if (!tokenStore.getAccess()) {
        setUserState(null);
        setAuthed(false);
      }
      return null;
    }
  }

  // 부팅 시 세션 복구
  useEffect(() => {
    (async () => {
      await refreshMe();
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTokens(accessToken: string, refreshToken: string) {
    tokenStore.set(accessToken, refreshToken);
    setAuthed(true);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      /* best-effort */
    }
    tokenStore.clear();
    setUserState(null);
    setAuthed(false);
  }

  const role: Role = user?.role ?? 'user';

  const value: AuthState = {
    ready,
    user,
    role,
    isAuthed: authed,
    setTokens,
    setUser: setUserState,
    refreshMe,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
