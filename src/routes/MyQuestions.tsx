import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { qnaApi } from '../api/qna';
import TabBar from '../components/TabBar';
import { ClockIcon, EmptyChatIcon } from '../components/MyListIcons';
import './myQuestions.css';

export default function MyQuestions() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qnaApi
      .mine()
      .then(async (data) => {
        if (cancelled) return;
        const list: any[] = Array.isArray(data) ? data : [];
        const withContent = await Promise.all(
          list.map(async (post) => {
            try {
              const detail = await qnaApi.get(post.id);
              return { ...post, content: detail.content ?? undefined };
            } catch {
              return post;
            }
          })
        );
        if (!cancelled) setPosts(withContent);
      })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="screen mq">
      <div className="mq-header">
        <button className="mq-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={22} color="#101828" />
        </button>
        <h1 className="mq-title-bar">내 질문</h1>
      </div>

      {loading ? (
        <div className="spinner-center"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="mq-empty">
          <span className="mq-empty-icon"><EmptyChatIcon /></span>
          <span className="mq-empty-text">아직 작성한 질문이 없습니다.</span>
        </div>
      ) : (
        <div className="screen-scroll mq-list">
          {posts.map((item) => (
            <button key={item.id} className="mq-card" onClick={() => navigate(`/qna/${item.id}`)}>
              <div className="mq-card-top">
                {item.category && <span className="mq-cat">{item.category}</span>}
                <span className={`mq-status ${item.status === 'answered' ? 'answered' : 'pending'}`}>
                  {item.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
              </div>
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
