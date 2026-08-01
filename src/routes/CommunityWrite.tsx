import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoClose, IoCloseCircle } from 'react-icons/io5';
import { communityApi } from '../api/community';
import { uploadImage } from '../api/upload';
import { useAuth } from '../context/AuthContext';
import './communityWrite.css';

type Photo = { url: string; file?: File; isRemote?: boolean };

const NOTICE_ITEMS = [
  '이름, 학교, 주소, 연락처 등 개인을 알아볼 수 있는 정보는 쓰지 말아주세요.',
  '다른 사람을 비난하거나 상처 줄 수 있는 표현은 피해주세요.',
  '정확하지 않은 법률 정보를 단정적으로 작성하지 말아주세요.',
  '긴급한 위험 상황이라면 커뮤니티보다 112, 1388, 가까운 보호기관에 먼저 도움을 요청해주세요.',
  '작성한 글은 운영 기준에 따라 수정되거나 숨김 처리될 수 있어요.',
];

function PhotoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.08333 8.33333C7.77369 8.33333 8.33333 7.77369 8.33333 7.08333C8.33333 6.39298 7.77369 5.83333 7.08333 5.83333C6.39298 5.83333 5.83333 6.39298 5.83333 7.08333C5.83333 7.77369 6.39298 8.33333 7.08333 8.33333Z" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 12.5L13.3333 8.33333L4.16667 17.5" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PollIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M2.5 2.5V15.8317C2.5 16.2739 2.67559 16.6981 2.98816 17.0106C3.30072 17.3232 3.72493 17.4988 4.16708 17.4988H17.4988" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.9977 14.1641V7.5" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8312 14.1644V4.16602" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.6653 14.1637V11.665" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CommunityWrite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthed } = useAuth();

  const editId = params.get('editId') ?? undefined;
  const editTitle = params.get('editTitle') ?? undefined;
  const editContent = params.get('editContent') ?? undefined;
  const editImageUrls = params.get('editImageUrls') ?? undefined;
  const editPoll = params.get('editPoll') ?? undefined;
  const isEditing = !!editId;

  const [title, setTitle] = useState(editTitle ?? '');
  const [content, setContent] = useState(editContent ?? '');

  const initPollData = editPoll ? (() => {
    try {
      const p = JSON.parse(editPoll);
      if (!Array.isArray(p) || p.length < 2) return null;
      if (typeof p[0] === 'string') return { labels: p as string[], votes: p.map(() => 0) };
      return { labels: p.map((o: any) => String(o.label ?? '')), votes: p.map((o: any) => Number(o.votes) || 0) };
    } catch { return null; }
  })() : null;
  const initPollOptions = initPollData?.labels ?? null;
  const initPollVotes = initPollData?.votes ?? [];

  const [pollActive, setPollActive] = useState(!!initPollOptions);
  const [pollOptions, setPollOptions] = useState<string[]>(initPollOptions ?? ['', '']);
  const [photos, setPhotos] = useState<Photo[]>(() => {
    if (editImageUrls) {
      try {
        const urls = JSON.parse(editImageUrls) as string[];
        return urls.map(url => ({ url, isRemote: true }));
      } catch { return []; }
    }
    return [];
  });
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addOption = () => {
    if (pollOptions.length < 5) setPollOptions(prev => [...prev, '']);
  };

  const updateOption = (idx: number, val: string) => {
    setPollOptions(prev => prev.map((o, i) => i === idx ? val : o));
  };

  const removeOption = (idx: number) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotos(prev => [...prev, { url: URL.createObjectURL(file), file }]);
    }
    e.target.value = '';
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const uploadPhoto = async (photo: Photo): Promise<string> => {
    if (photo.isRemote || !photo.file) return photo.url;
    return uploadImage(photo.file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { window.alert('제목을 입력해주세요.'); return; }
    if (!content.trim()) { window.alert('내용을 입력해주세요.'); return; }
    if (!isAuthed) { window.alert('로그인 후 이용해주세요.'); return; }
    setSubmitting(true);
    try {
      const body: Record<string, any> = { title: title.trim(), content: content.trim() || undefined };
      if (pollActive) {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length >= 2) {
          body.poll = {
            options: validOptions.map((label, i) => ({
              label,
              votes: isEditing ? (initPollVotes[i] ?? 0) : 0,
            })),
          };
        }
      }
      if (photos.length > 0) {
        try {
          body.imageUrls = await Promise.all(photos.map(uploadPhoto));
        } catch {
          window.alert('사진을 업로드하지 못했습니다. 사진 없이 게시합니다.');
        }
      }

      try {
        if (isEditing) {
          await communityApi.update(editId!, body);
        } else {
          await communityApi.create(body as { title: string; content?: string; poll?: any; imageUrls?: string[] });
        }
        navigate(-1);
      } catch (err: any) {
        window.alert(err?.message ?? '저장에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showNotice = content.length === 0 && !pollActive;

  return (
    <div className="screen cw-container">
      <div className="cw-topbar">
        <button className="cw-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={24} color="#101828" />
        </button>
        <span className="cw-topbar-title">{isEditing ? '수정하기' : '글쓰기'}</span>
        <button
          className={`cw-done${canSubmit ? ' active' : ''}`}
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
        >
          {submitting ? (isEditing ? '수정 중' : '게시 중') : isEditing ? '수정' : '완료'}
        </button>
      </div>

      <div className="screen-scroll cw-scroll">
        <input
          className="cw-title-input"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={100}
        />

        <textarea
          className="cw-content-input"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        {/* 주의사항 박스 — 내용 입력 전, 투표 미사용 시 */}
        {showNotice && (
          <div className="cw-notice">
            <div className="cw-notice-title">커뮤니티 글쓰기 주의사항</div>
            <div className="cw-notice-desc">커뮤니티는 서로의 고민과 경험을 나누는 공간입니다.</div>
            <div className="cw-notice-desc">안전한 이용을 위해 아래 내용을 지켜주세요.</div>
            <div className="cw-notice-title cw-notice-title-gap">작성 전 꼭 확인해주세요</div>
            {NOTICE_ITEMS.map((text, idx) => (
              <div key={idx} className="cw-notice-item-row">
                <span className="cw-notice-num">{idx + 1}.</span>
                <span className="cw-notice-item">{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* 투표 */}
        {pollActive && !editPoll && (
          <div className="cw-poll-card">
            <div className="cw-poll-header">
              <span className="cw-poll-label">선택지 (2~5개)</span>
              <button
                className="cw-poll-remove"
                onClick={() => { setPollActive(false); setPollOptions(['', '']); }}
              >
                제거
              </button>
            </div>
            {pollOptions.map((opt, i) => (
              <div key={i} className="cw-poll-option-row">
                <input
                  className="cw-poll-option-input"
                  placeholder={`선택지 ${i + 1}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                />
                {pollOptions.length > 2 && (
                  <button className="cw-icon-btn" onClick={() => removeOption(i)} aria-label="선택지 삭제">
                    <IoClose size={18} color="#99A1AF" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 5 && (
              <button className="cw-add-option" onClick={addOption}>+ 선택지 추가</button>
            )}
          </div>
        )}

        {/* 사진 */}
        {photos.length > 0 && (
          <div className="cw-photo-row">
            {photos.map((photo, i) => (
              <div key={i} className="cw-photo-thumb">
                <img className="cw-photo-img" src={photo.url} alt="" />
                <button className="cw-photo-remove" onClick={() => removePhoto(i)} aria-label="사진 삭제">
                  <IoCloseCircle size={18} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 미디어 버튼 */}
        <div className="cw-media-row">
          <button className="cw-media-btn" onClick={handleAddPhoto}>
            <PhotoIcon />
            <span className="cw-media-btn-text">사진 추가</span>
          </button>
          {!pollActive && !editPoll && (
            <button className="cw-media-btn" onClick={() => setPollActive(true)}>
              <PollIcon />
              <span className="cw-media-btn-text">투표 추가</span>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}
