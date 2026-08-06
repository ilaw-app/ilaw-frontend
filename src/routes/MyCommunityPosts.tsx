import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { communityApi } from '../api/community';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import './myQuestions.css';

function ClockIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <g clipPath="url(#clip_mcp_clock)">
        <path d="M5.99979 10.9996C8.7611 10.9996 10.9996 8.7611 10.9996 5.99979C10.9996 3.23848 8.7611 1 5.99979 1C3.23848 1 1 3.23848 1 5.99979C1 8.7611 3.23848 10.9996 5.99979 10.9996Z" stroke="#99A1AF" strokeWidth="0.999958" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 3V5.99988L7.99992 6.99983" stroke="#99A1AF" strokeWidth="0.999958" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_mcp_clock"><rect width="11.9995" height="11.9995" fill="white" /></clipPath></defs>
    </svg>
  );
}

function EmptyChatIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 21 21" fill="none">
      <path d="M6.9 18.0079C8.80858 18.9869 11.0041 19.2521 13.0909 18.7556C15.1777 18.2592 17.0186 17.0337 18.2818 15.3C19.545 13.5664 20.1474 11.4386 19.9806 9.30002C19.8137 7.16147 18.8886 5.15283 17.3718 3.63605C15.855 2.11928 13.8464 1.19411 11.7078 1.02728C9.56929 0.860441 7.44147 1.46291 5.70782 2.72611C3.97417 3.98931 2.74869 5.83017 2.25222 7.91697C1.75575 10.0038 2.02094 12.1993 3 14.1079L1 20.0079L6.9 18.0079Z" stroke="#D1D5DC" strokeWidth="1.99991" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
