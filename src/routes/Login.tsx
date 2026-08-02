import { oauthStartUrl } from '../api/auth';
import './login.css';

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5C4.86 1.5 1.5 4.13 1.5 7.38c0 2.1 1.4 3.94 3.5 4.98-.15.55-.56 2.02-.64 2.34-.1.4.15.4.3.29.12-.08 1.9-1.29 2.67-1.82.4.06.83.09 1.27.09 4.14 0 7.5-2.63 7.5-5.88S13.14 1.5 9 1.5Z"
        fill="#191919"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  return (
    <div className="login-screen">
      <div className="login-top">
        <div className="login-logo-wrap">
          <img className="login-shadow" src="/assets/shadow.png" alt="" aria-hidden="true" />
          <img className="login-logo" src="/assets/logo2.png" alt="아이로" />
        </div>
        <h1 className="login-title font-airo">아이로와 함께 시작해요</h1>
      </div>

      <div className="login-btns">
        <button
          className="login-btn kakao"
          onClick={() => {
            window.location.href = oauthStartUrl('kakao');
          }}
        >
          <KakaoIcon />
          <span>카카오 로그인</span>
        </button>
        <button
          className="login-btn google"
          onClick={() => {
            window.location.href = oauthStartUrl('google');
          }}
        >
          <GoogleIcon />
          <span>구글 로그인</span>
        </button>
      </div>
    </div>
  );
}
