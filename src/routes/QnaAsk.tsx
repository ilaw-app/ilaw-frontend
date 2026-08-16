import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCheckmark } from 'react-icons/io5';
import { qnaApi } from '../api/qna';
import { uploadImage } from '../api/upload';
import { Overlay } from '../components/Overlay';
import ProfanityField from '../components/ProfanityField';
import { useProfanityCheck } from '../hooks/useProfanityCheck';
import './qnaAsk.css';

const QNA_CATEGORIES = ['노동', '금융', '온라인폭력', '아동학대', '성폭력', '출생', '법정대리인', '기타'];

function PhotoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M15.8262 2.49902H4.16492C3.24487 2.49902 2.49902 3.24487 2.49902 4.16492V15.8262C2.49902 16.7463 3.24487 17.4921 4.16492 17.4921H15.8262C16.7463 17.4921 17.4921 16.7463 17.4921 15.8262V4.16492C17.4921 3.24487 16.7463 2.49902 15.8262 2.49902Z" stroke="#6a7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.49647 9.16285C8.41652 9.16285 9.16237 8.41701 9.16237 7.49695C9.16237 6.5769 8.41652 5.83105 7.49647 5.83105C6.57642 5.83105 5.83057 6.5769 5.83057 7.49695C5.83057 8.41701 6.57642 9.16285 7.49647 9.16285Z" stroke="#6a7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.4918 12.4938L14.9213 9.9233C14.6089 9.61099 14.1853 9.43555 13.7435 9.43555C13.3018 9.43555 12.8781 9.61099 12.5657 9.9233L4.99756 17.4915" stroke="#6a7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NOTICE_ITEMS = [
  '이름·주민번호·주소·연락처는 쓰지 마세요.',
  '신원이 드러나는 사진은 올리지 마세요.',
  '구체적으로 쓸수록 더 정확한 답변을 받아요.',
  '욕설·비방·장난성 질문은 삼가 주세요.',
  '변호사 답변은 보통 1~3일 걸릴 수 있어요.',
  '위급하면 112·관련 기관에 먼저 연락하세요.',
  '질문은 익명 공개되어 다른 사용자도 볼 수 있어요.',
];

type PickedImage = { file: File; url: string };

export default function QnaAsk() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  const handlePickImage = () => {
    if (images.length >= 3) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (images.length >= 3) return;
    setImages((prev) => [...prev, { file, url: URL.createObjectURL(file) }]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 금칙어는 서버가 등록 시점에 막지만, 입력 중에도 같은 로직으로 미리 검사해 어떤 표현인지 표시한다.
  const profanity = useProfanityCheck({ title, content });
  const canSubmit =
    title.trim().length > 0 && content.trim().length > 0 && selectedCategories.length > 0 && !profanity.blocked;

  const handleSubmit = async () => {
    if (submittingRef.current) return; // 중복 제출(더블탭) 방지
    if (!canSubmit) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const img of images) {
        imageUrls.push(await uploadImage(img.file));
      }
      await qnaApi.create({
        title,
        content,
        category: selectedCategories.join(','),
        imageUrls,
      });
      setShowSuccess(true);
    } catch (err) {
      if (profanity.applyError(err)) {
        window.alert('부적절한 표현이 포함되어 있어 등록할 수 없어요. 빨간색으로 표시된 부분을 수정해주세요.');
      }
      // 그 외 실패는 폼에 머물러 다시 시도
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="screen qa-ask">
      <div className="qa-topbar">
        <button className="qa-back" onClick={() => navigate(-1)}>
          <IoArrowBack size={24} color="#101828" />
        </button>
        <span className="qa-topbar-title">질문하기</span>
        <button
          className={`qa-done${canSubmit ? ' active' : ''}`}
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
        >
          {submitting ? '등록 중' : '완료'}
        </button>
      </div>

      <div className="qa-scroll">
        <ProfanityField
          as="input"
          className="qa-title-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={setTitle}
          matches={profanity.report.title}
        />

        <ProfanityField
          className="qa-content-input"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={setContent}
          matches={profanity.report.content}
        />

        {/* 안내 박스 — 내용을 입력하면 숨김 */}
        {!content && (
          <div className="qa-notice">
            <div className="qa-notice-title">질문 전 꼭 확인해 주세요</div>
            {NOTICE_ITEMS.map((item, i) => (
              <div key={i} className="qa-note-row">
                <span className="qa-note-bullet">•</span>
                <span className="qa-note-text">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* 사진 추가 */}
        <div className="qa-photo-row">
          {images.length < 3 && (
            <button className="qa-photo-btn" onClick={handlePickImage}>
              <PhotoIcon />
              <span className="qa-photo-btn-text">사진 추가</span>
            </button>
          )}
          {images.map((img, i) => (
            <div key={i} className="qa-thumb-wrap">
              <img src={img.url} className="qa-thumb" alt="" />
              <button className="qa-thumb-remove" onClick={() => handleRemoveImage(i)}>
                ✕
              </button>
            </div>
          ))}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>

        {/* 카테고리 */}
        <div className="qa-category-section">
          <div className="qa-category-label">카테고리</div>
          <div className="qa-category-grid">
            {QNA_CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  className={`qa-chip${selected ? ' selected' : ''}`}
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                    )
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Overlay visible={showSuccess}>
        <div className="qa-success-card">
          <div className="qa-check-circle">
            <IoCheckmark size={40} color="#fff" />
          </div>
          <div className="qa-success-textblock">
            <div className="qa-success-title">제출 완료!</div>
            <div className="qa-success-desc">빠른 시일 내로{'\n'}답변 드리겠습니다!</div>
          </div>
          <div className="qa-success-btns">
            <button
              className="qa-home-btn"
              onClick={() => {
                setShowSuccess(false);
                navigate('/home');
              }}
            >
              홈으로
            </button>
            <button
              className="qa-myqna-btn"
              onClick={() => {
                setShowSuccess(false);
                navigate('/my-questions');
              }}
            >
              내 질문 보기
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}
