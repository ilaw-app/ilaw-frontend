import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const { ready, isAuthed, user } = useAuth();

  // 이미 로그인된 사용자는 스플래시를 건너뛴다
  useEffect(() => {
    if (ready && isAuthed) {
      navigate(user && !user.profileCompleted ? '/onboarding' : '/home', { replace: true });
    }
  }, [ready, isAuthed, user, navigate]);

  return (
    <div className="splash">
      <div className="splash-hero">
        <div className="splash-text">
          <p className="splash-tagline font-airo">
            아이들을 위한 길,
            <br />
            아이들을 위한 LAW
          </p>
          <p className="splash-name font-airo">아이로</p>
        </div>
        <img className="splash-logo" src="/assets/logo1.png" alt="아이로" />
      </div>

      <div className="splash-card">
        <button className="splash-start" onClick={() => navigate('/login')}>
          시작하기
        </button>
        <p className="splash-existing">App Version 1.0.0</p>
      </div>
    </div>
  );
}
