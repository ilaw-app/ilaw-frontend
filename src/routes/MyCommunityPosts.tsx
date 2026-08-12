import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { communityApi } from '../api/community';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import { ClockIcon, EmptyChatIcon } from '../components/MyListIcons';
import './myQuestions.css';

export default function MyCommunityPosts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // 커뮤니티 글은 닉네임이 '익명N'으로 익명화돼 목록만으론 내 글을 못 가림.
    // 각 글 상세의 isAuthor로 내가 쓴 글을 판별한다.
    communityApi
      .list(100)
      .then(async (data) => {
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any).posts)
          ? (data as any).posts
          : [];
        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const checked = await Promise.all(
          sorted.slice(0, 60).map((p) =>
            communityApi
              .get(p.id)
              .then((d) => (d && (d as any).isAuthor ? { ...p, isAuthor: true } : null))
              .catch(() => null)
          )
        );
        if (cancelled) return;
        setPosts(checked.filter(Boolean) as any[]);
      })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

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
