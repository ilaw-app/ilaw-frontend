// iLaw 백엔드 API 클라이언트 (전송 계층)
// - JWT Bearer 인증, 401 시 refresh 후 자동 재시도
// - 토큰은 localStorage에 저장 (RN의 expo-secure-store 대체)

// 기본값은 운영 주소. 로컬 개발 시 .env.local의 VITE_API_BASE로 덮어쓴다.
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://ilaw-backend.up.railway.app';

const ACCESS_KEY = 'ilaw.accessToken';
const REFRESH_KEY = 'ilaw.refreshToken';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

// 동시 다발 401을 하나의 refresh로 합치기 위한 in-flight 프라미스
let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    tokenStore.set(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  if (!refreshing) {
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: any; // 객체면 JSON 직렬화, FormData면 그대로
  auth?: boolean; // true면 Authorization 헤더 강제 (기본: 토큰 있으면 부착)
  _retried?: boolean;
};

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, auth, _retried, headers, ...rest } = opts;

  const finalHeaders: Record<string, string> = { ...(headers as any) };
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isForm) {
      finalBody = body;
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(body);
    }
  }

  const token = tokenStore.getAccess();
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders, body: finalBody });

  // 401 → refresh 후 1회 재시도
  if (res.status === 401 && !_retried && tokenStore.getRefresh()) {
    const ok = await refreshOnce();
    if (ok) return apiFetch<T>(path, { ...opts, _retried: true });
    tokenStore.clear();
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// 편의 메서드
export const api = {
  get: <T = any>(path: string, opts?: FetchOptions) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T = any>(path: string, body?: any, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  put: <T = any>(path: string, body?: any, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T = any>(path: string, body?: any, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T = any>(path: string, opts?: FetchOptions) => apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
