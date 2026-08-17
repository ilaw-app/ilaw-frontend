import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  IoChevronBack,
  IoChatbubbleOutline,
  IoCreateOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { qnaApi } from '../api/qna';
import './myAnswers.css';

export default function MyAnswers() {
  const navigate = useNavigate();
  const { data, loading } = useAsyncData(() => qnaApi.myAnswers(), []);
  const posts = Array.isArray(data) ? data : [];

  return (
    <div className="screen">
      <div className="ma-header">
        <button className="ma-back" onClick={() => navigate(-1)}>
          <IoChevronBack size={24} color="#586144" />
          <span>내 답변</span>
        </button>
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll ma-list">
          {posts.length === 0 ? (
            <div className="ma-empty">
              <IoChatbubbleOutline size={40} color="#ccd9ba" />
              <p>아직 답변한 질문이 없습니다</p>
            </div>
          ) : (
            posts.map((item) => (
              <button
                key={item.id}
                className="ma-card"
                onClick={() => navigate(`/qna/${item.id}`)}
              >
                <div className="ma-badge-row">
                  <span className="ma-cat">{item.category}</span>
                  <span className="ma-answered">답변완료</span>
                </div>
                <div className="ma-title">{item.title}</div>
                {item.content ? <div className="ma-content">{item.content}</div> : null}
                <div className="ma-divider" />
                <div className="ma-date-meta">
                  <span className="ma-date-item">
                    <IoCreateOutline size={12} color="#9CAF88" />
                    <span className="ma-date-label">질문일자</span>
                    <span className="ma-date-value">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </span>
                  {item.answeredAt ? (
                    <span className="ma-date-item">
                      <IoCheckmarkCircleOutline size={12} color="#2B56B5" />
                      <span className="ma-date-label answered">답변일자</span>
                      <span className="ma-date-value answered">
                        {new Date(item.answeredAt).toLocaleDateString('ko-KR')}
                      </span>
                    </span>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
