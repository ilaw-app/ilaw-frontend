import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

// 웹 OAuth 콜백: 백엔드가 /auth?code=<일회용코드> 로 리다이렉트 → 코드로 토큰 교환
export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setTokens, refreshMe } = useAuth();

  useEffect(() => {
    (async () => {
      const error = params.get('error');
      const code = params.get('code');

      if (error || !code) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const { accessToken, refreshToken, profileCompleted } = await authApi.exchange(code);
        setTokens(accessToken, refreshToken);
        await refreshMe();
        navigate(profileCompleted ? '/home' : '/onboarding', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="spinner-center">
      <div className="spinner" />
    </div>
  );
}
