import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { qnaApi } from '../api/qna';
import TabBar from '../components/TabBar';
import './qnaAnswer.css';

export default function QnaAnswer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      window.alert('답변 내용을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await qnaApi.answer(id!, answer);
      window.alert('답변이 등록되었습니다.');
      navigate(-1);
    } catch (e: any) {
      if (e?.status === 409) {
        window.alert('이미 답변이 등록된 질문입니다.');
        navigate(-1);
        return;
      }
      window.alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen qa-answer">
      <div className="qa-answer-topbar">
        <button className="qa-answer-back" onClick={() => navigate(-1)}>
          {'< 답변 작성'}
        </button>
      </div>

      <div className="qa-answer-scroll">
        <div className="qa-answer-label">
          답변 내용 <span className="qa-answer-required">*</span>
        </div>
        <textarea
          className="qa-answer-input"
          placeholder="답변 내용을 작성해 주세요"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="qa-answer-notice">
          * 답변은 질문자 및 모든 사용자에게 공개됩니다.{'\n'}
          * 신중하게 작성해 주세요.
        </div>

        <button
          className={`qa-answer-submit${submitting ? ' disabled' : ''}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '등록 중...' : '답변 등록하기'}
        </button>
      </div>

      <TabBar />
    </div>
  );
}
