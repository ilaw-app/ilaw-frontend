import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { tokenStore } from '../api/client';
import { authApi } from '../api/auth';
import type { Role, User } from '../api/types';

type AuthState = {
  ready: boolean; // 부팅 세션 복구 완료 여부
  user: User | null;
  role: Role; // roleOverride(프론트 프리뷰) ?? 서버 user.role
  isAuthed: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (u: User | null) => void;
  setRoleOverride: (r: Role | null) => void; // 개발용: 마이페이지 앱버전 5탭
  refreshMe: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [authed, setAuthed] = useState<boolean>(!!tokenStore.getAccess());
  // 개발용 역할 프리뷰(마이페이지 앱버전 5탭) — 서버엔 영향 없고 UI만 전환
  const [roleOverride, setRoleOverrideState] = useState<Role | null>(() => {
    const s = typeof localStorage !== 'undefined' ? localStorage.getItem('roleOverride') : null;
    return s === 'lawyer' || s === 'user' ? (s as Role) : null;
  });
  const setRoleOverride = (r: Role | null) => {
    try {
      if (r) localStorage.setItem('roleOverride', r);
      else localStorage.removeItem('roleOverride');
    } catch { /* ignore */ }
    setRoleOverrideState(r);
  };

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
    setRoleOverride(null);
    setAuthed(false);
  }

  const role: Role = roleOverride ?? user?.role ?? 'user';

  const value: AuthState = {
    ready,
    user,
    role,
    isAuthed: authed,
    setTokens,
    setUser: setUserState,
    setRoleOverride,
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
