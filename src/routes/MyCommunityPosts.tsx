import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import { IoArrowBack } from 'react-icons/io5';
import { communityApi } from '../api/community';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import { ClockIcon, EmptyChatIcon } from '../components/MyListIcons';
import './myQuestions.css';

export default function MyCommunityPosts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // BE가 내 글만 반환하는 전용 엔드포인트 제공 (요청 1번).
  const { data, loading } = useAsyncData(() => communityApi.myPosts(), [user?.id]);
  const posts = Array.isArray(data) ? data : [];

  return (
    <div className="screen mq">
      <div className="mq-header">
        <button className="mq-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={22} color="#101828" />
        </button>
        <h1 className="mq-title-bar">내 커뮤니티 글</h1>
      </div>

      {loading ? (
        <div className="spinner-center"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="mq-empty">
          <span className="mq-empty-icon"><EmptyChatIcon /></span>
          <span className="mq-empty-text">아직 작성한 커뮤니티 글이 없습니다.</span>
        </div>
      ) : (
        <div className="screen-scroll mq-list">
          {posts.map((item) => (
            <button key={item.id} className="mq-card" onClick={() => navigate(`/community/${item.id}`)}>
              <div className="mq-card-title">{item.title}</div>
              {item.content ? <div className="mq-card-desc">{item.content}</div> : null}
              <div className="mq-card-date">
                <ClockIcon />
                <span>{new Date(item.createdAt).toISOString().slice(0, 10)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <TabBar />
    </div>
  );
}
