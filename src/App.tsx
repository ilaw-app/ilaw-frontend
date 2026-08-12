import { useEffect, useState, lazy, Suspense, type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
// 진입/인증 화면은 즉시 로드(초기 깜빡임 방지), 나머지는 화면별 코드 스플리팅
import Splash from './routes/Splash';
import Login from './routes/Login';

const AuthCallback = lazy(() => import('./routes/AuthCallback'));
const Onboarding = lazy(() => import('./routes/Onboarding'));
const Home = lazy(() => import('./routes/Home'));
const Manual = lazy(() => import('./routes/Manual'));
const ManualList = lazy(() => import('./routes/ManualList'));
const ManualDetail = lazy(() => import('./routes/ManualDetail'));
const ManualHelp = lazy(() => import('./routes/ManualHelp'));
const QnaList = lazy(() => import('./routes/QnaList'));
const QnaDetail = lazy(() => import('./routes/QnaDetail'));
const QnaAsk = lazy(() => import('./routes/QnaAsk'));
const QnaAnswer = lazy(() => import('./routes/QnaAnswer'));
const Community = lazy(() => import('./routes/Community'));
const CommunityDetail = lazy(() => import('./routes/CommunityDetail'));
const CommunityWrite = lazy(() => import('./routes/CommunityWrite'));
const Profile = lazy(() => import('./routes/Profile'));
const EditProfile = lazy(() => import('./routes/EditProfile'));
const MyQuestions = lazy(() => import('./routes/MyQuestions'));
const MyCommunityPosts = lazy(() => import('./routes/MyCommunityPosts'));
const Tutorial = lazy(() => import('./routes/Tutorial'));
const MyAnswers = lazy(() => import('./routes/MyAnswers'));
const MyScraps = lazy(() => import('./routes/MyScraps'));
const MyQnaScraps = lazy(() => import('./routes/MyQnaScraps'));
const Notifications = lazy(() => import('./routes/Notifications'));
const NotificationSettings = lazy(() => import('./routes/NotificationSettings'));
const AiChat = lazy(() => import('./routes/AiChat'));
const Terms = lazy(() => import('./routes/Terms'));
const Privacy = lazy(() => import('./routes/Privacy'));

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
        <Suspense fallback={<div className="spinner-center"><div className="spinner" /></div>}>
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
          <Route path="/my-community-posts" element={<RequireAuth><MyCommunityPosts /></RequireAuth>} />
          <Route path="/tutorial" element={<RequireAuth><Tutorial /></RequireAuth>} />
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
        </Suspense>
      </div>
    </div>
  );
}
