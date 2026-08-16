import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { qnaApi } from '../api/qna';
import TabBar from '../components/TabBar';
import ProfanityField from '../components/ProfanityField';
import { useProfanityCheck } from '../hooks/useProfanityCheck';
import './qnaAnswer.css';

export default function QnaAnswer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const profanity = useProfanityCheck({ content: answer });

  const handleSubmit = async () => {
    if (!answer.trim()) {
      window.alert('답변 내용을 입력해 주세요.');
      return;
    }
    if (profanity.blocked) {
      window.alert('부적절한 표현이 포함되어 있어 등록할 수 없어요. 빨간색으로 표시된 부분을 수정해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await qnaApi.answer(id!, answer);
      window.alert('답변이 등록되었습니다.');
      navigate(-1);
    } catch (e: any) {
      if (profanity.applyError(e)) {
        window.alert('부적절한 표현이 포함되어 있어 등록할 수 없어요. 빨간색으로 표시된 부분을 수정해주세요.');
        return;
      }
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
        <ProfanityField
          className="qa-answer-input"
          placeholder="답변 내용을 작성해 주세요"
          value={answer}
          onChange={setAnswer}
          matches={profanity.report.content}
        />

        <div className="qa-answer-notice">
          * 답변은 질문자 및 모든 사용자에게 공개됩니다.{'\n'}
          * 신중하게 작성해 주세요.
        </div>

        <button
          className={`qa-answer-submit${submitting || profanity.blocked ? ' disabled' : ''}`}
          onClick={handleSubmit}
          disabled={submitting || profanity.blocked}
        >
          {submitting ? '등록 중...' : '답변 등록하기'}
        </button>
      </div>

      <TabBar />
    </div>
  );
}
