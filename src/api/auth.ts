import { API_BASE, api } from './client';
import type { Role, User } from './types';

// OAuth 시작 URL — 로그인 후 백엔드가 `${origin}/auth?code=<일회용코드>`로 리다이렉트
export function oauthStartUrl(provider: 'kakao' | 'google'): string {
  const host = window.location.hostname;
  const target = host === 'localhost' || host === '127.0.0.1' ? 'local' : 'web';
  return `${API_BASE}/auth/${provider}?target=${target}`;
}

export const authApi = {
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.del('/auth/me'),

  // OAuth 콜백 일회용 코드 → 토큰 교환
  exchange: (code: string) =>
    api.post<{ accessToken: string; refreshToken: string; profileCompleted: boolean }>(
      '/auth/exchange',
      { code },
    ),

  // 온보딩(최초 프로필 완성)
  submitOnboarding: (body: {
    nickname: string;
    region?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    agreedTermsOfService: boolean;
    agreedPrivacyPolicy: boolean;
    agreedAge14: boolean;
    agreedMarketing?: boolean;
  }) => api.patch('/auth/profile', body),

  // 프로필 수정
  updateProfile: (body: {
    nickname: string;
    region?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    affiliation?: string | null;
  }) => api.patch('/auth/me', body),

  // 개발용: 본인 role 전환 (마이페이지 앱버전 5탭). 서버 ALLOW_SELF_ROLE_SWITCH 꺼져 있으면 404
  setRole: (role: Role) => api.patch<{ id: string; role: Role }>('/auth/role', { role }),
};
