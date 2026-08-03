import { useEffect, useState, type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Splash from './routes/Splash';
import Login from './routes/Login';
import AuthCallback from './routes/AuthCallback';
import Onboarding from './routes/Onboarding';
import Home from './routes/Home';
import Manual from './routes/Manual';
import ManualList from './routes/ManualList';
import ManualDetail from './routes/ManualDetail';
import ManualHelp from './routes/ManualHelp';
import QnaList from './routes/QnaList';
import QnaDetail from './routes/QnaDetail';
import QnaAsk from './routes/QnaAsk';
import QnaAnswer from './routes/QnaAnswer';
import Community from './routes/Community';
import CommunityDetail from './routes/CommunityDetail';
import CommunityWrite from './routes/CommunityWrite';
import Profile from './routes/Profile';
import EditProfile from './routes/EditProfile';
import MyQuestions from './routes/MyQuestions';
import MyAnswers from './routes/MyAnswers';
import MyScraps from './routes/MyScraps';
import MyQnaScraps from './routes/MyQnaScraps';
import Notifications from './routes/Notifications';
import NotificationSettings from './routes/NotificationSettings';
import AiChat from './routes/AiChat';
import Terms from './routes/Terms';
import Privacy from './routes/Privacy';

// 390x844 캔버스를 창 크기에 맞춰 균일하게 축소 (Expo 웹과 동일한 방식)
function useCanvasScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      // 높이를 꽉 채우되 위아래 약간(24px)만 여백 — 폭이 좁으면 폭 기준
      const s = Math.min(window.innerWidth / 390, (window.innerHeight - 24) / 844);
      setScale(s > 0.1 ? s : 0.1);
    };
    calc();
    window.addEventListener('resize', calc);
    window.visualViewport?.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.visualViewport?.removeEventListener('resize', calc);
    };
  }, []);
  return scale;
}

// 로그인이 필요한 라우트 가드 — 세션 복구를 기다렸다가 미인증이면 스플래시로 보냄
// (로컬 개발 서버에서는 가드를 건너뛰어 /home 등에 바로 접근 가능)
function RequireAuth({ children }: { children: ReactElement }) {
  const { ready, isAuthed } = useAuth();
  if (import.meta.env.DEV) return children;
  if (!ready) return null; // 세션 복구 대기 (깜빡임 방지)
  if (!isAuthed) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const scale = useCanvasScale();
  return (
    <div className="app-viewport">
      <div className="app-frame" id="app-frame" style={{ transform: `scale(${scale})` }}>
        <Routes>
          {/* 진입 / 인증 (공개) */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<AuthCallback />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

          {/* 탭 */}
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/manual" element={<RequireAuth><Manual /></RequireAuth>} />
          <Route path="/qna" element={<RequireAuth><QnaList /></RequireAuth>} />
          <Route path="/community" element={<RequireAuth><Community /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          {/* 매뉴얼 하위 */}
          <Route path="/manual-list" element={<RequireAuth><ManualList /></RequireAuth>} />
          <Route path="/manual-detail" element={<RequireAuth><ManualDetail /></RequireAuth>} />
          <Route path="/manual-help" element={<RequireAuth><ManualHelp /></RequireAuth>} />

          {/* Q&A 하위 */}
          <Route path="/qna/ask" element={<RequireAuth><QnaAsk /></RequireAuth>} />
          <Route path="/qna/answer/:id" element={<RequireAuth><QnaAnswer /></RequireAuth>} />
          <Route path="/qna/:id" element={<RequireAuth><QnaDetail /></RequireAuth>} />

          {/* 커뮤니티 하위 */}
          <Route path="/community/write" element={<RequireAuth><CommunityWrite /></RequireAuth>} />
          <Route path="/community/:id" element={<RequireAuth><CommunityDetail /></RequireAuth>} />

          {/* 마이 / 기타 */}
          <Route path="/edit-profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/my-questions" element={<RequireAuth><MyQuestions /></RequireAuth>} />
          <Route path="/my-answers" element={<RequireAuth><MyAnswers /></RequireAuth>} />
          <Route path="/my-scraps" element={<RequireAuth><MyScraps /></RequireAuth>} />
          <Route path="/my-qna-scraps" element={<RequireAuth><MyQnaScraps /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/notification-settings" element={<RequireAuth><NotificationSettings /></RequireAuth>} />
          <Route path="/ai-chat" element={<RequireAuth><AiChat /></RequireAuth>} />
          <Route path="/terms" element={<RequireAuth><Terms /></RequireAuth>} />
          <Route path="/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
