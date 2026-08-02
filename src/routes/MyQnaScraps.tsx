import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qnaApi } from '../api/qna';
import './myQnaScraps.css';

export default function MyQnaScraps() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qnaApi
      .myScraps()
      .then((data) => {
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="screen">
      <div className="mqs-header">
        <button className="mqs-back" onClick={() => navigate(-1)}>
          {'<'}
        </button>
        <h1>스크랩한 Q&amp;A</h1>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div className="mqs-empty">
          <span className="icon">🔖</span>
          <p>스크랩한 Q&amp;A가 없습니다.</p>
        </div>
      ) : (
        <div className="screen-scroll mqs-list">
          {posts.map((item) => (
            <button
              key={item.id}
              className="mqs-card"
              onClick={() => navigate(`/qna/${item.id}`)}
            >
              <div className="mqs-card-top">
                <span className="mqs-badge">{item.category}</span>
                <span className={`mqs-status ${item.status === 'answered' ? 'answered' : ''}`}>
                  {item.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
              </div>
              <div className="mqs-title">{item.title}</div>
              <div className="mqs-meta">
                {(item.author?.nickname ?? '익명')} · {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
