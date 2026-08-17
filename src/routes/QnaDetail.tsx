import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IoArrowBack,
  IoPersonOutline,
  IoTimeOutline,
  IoBusinessOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCheckmark,
} from 'react-icons/io5';
import { qnaApi } from '../api/qna';
import { QNA_ITEMS } from '../data/qnaData';
import type { QnADetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Overlay } from '../components/Overlay';
import { TrashSheetIcon } from '../components/PostMenuIcons';
import { PersonIcon } from '../components/icons';
import { Markdown } from '../components/Markdown';
import TabBar from '../components/TabBar';
import ProfanityField from '../components/ProfanityField';
import { useProfanityCheck } from '../hooks/useProfanityCheck';
import type { ProfanityMatch } from '../api/moderation';
import './qnaDetail.css';

const genderLabel = (g?: string | null) =>
  g === 'female' ? '여성' : g === 'male' ? '남성' : g === 'other' ? '기타' : '-';

// 백엔드엔 변호사님 답변 본문/소속이 비어 있어서, 그 5개 질문은 정적 데이터로 채워 넣음 (화면 표시용).
const LAWYER_KEY = ['통금', '주휴수당', '인스타', '무관심', '경찰조사'];
function staticLawyerAnswer(title: string) {
  const t = (title ?? '').replace(/\s/g, '');
  const item = QNA_ITEMS.find((q) => {
    const qt = q.title.replace(/\s/g, '');
    return t.includes(qt) || qt.includes(t) || LAWYER_KEY.some((k) => t.includes(k) && qt.includes(k));
  });
  return item?.answer ?? null;
}

function ClockIcon({ size = 32, color = '#8c937d' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M31.9985 58.664C46.7255 58.664 58.664 46.7255 58.664 31.9985C58.664 17.2716 46.7255 5.33301 31.9985 5.33301C17.2716 5.33301 5.33301 17.2716 5.33301 31.9985C5.33301 46.7255 17.2716 58.664 31.9985 58.664Z"
        stroke={color} strokeWidth="5.3331" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M31.9985 15.999V31.9983L42.6647 37.3314"
        stroke={color} strokeWidth="5.3331" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function QnaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [post, setPost] = useState<QnADetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [scrapped, setScrapped] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingPopupOpen, setPendingPopupOpen] = useState(false);
  const [ownedByList, setOwnedByList] = useState(false); // /qa/mine 로 보강한 소유권

  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  // 변호사 답변 작성/수정도 서버 금칙어 필터와 같은 로직으로 입력 중 미리 표시한다.
  const answerProfanity = useProfanityCheck({ content: answerText });
  const editProfanity = useProfanityCheck({ content: editing ? editText : '' });

  const isLawyer = role === 'lawyer';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    qnaApi
      .get(id!)
      .then((data) => {
        if (cancelled) return;
        // 변호사님 답변이 있는 5개 질문은 정적 데이터로 답변 본문+소속을 채움
        const sa = staticLawyerAnswer(data.title);
        const merged: QnADetail = sa
          ? {
              ...data,
              status: 'answered',
              answer: {
                id: data.answer?.id ?? 0,
                postId: data.id,
                content: sa.content,
                createdAt: sa.createdAt,
                updatedAt: sa.createdAt,
                lawyer: { nickname: sa.lawyerName, role: 'lawyer', affiliation: sa.lawyerOrg },
                isMyAnswer: false,
              },
            }
          : data;
        setPost(merged);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));
    // 소유권 보강: 로그인 시 /qa/mine 목록에 이 질문이 있으면 내 질문으로 간주
    qnaApi
      .mine()
      .then((mineList) => {
        if (cancelled) return;
        const ids = new Set((Array.isArray(mineList) ? mineList : []).map((m: any) => m.id));
        setOwnedByList(ids.has(Number(id)));
      })
      .catch(() => {});
    // 스크랩 상태 (로그인 시)
    qnaApi
      .getScrap(id!)
      .then((s) => {
        if (cancelled) return;
        setScrapped(s.scrapped);
        setScrapCount(s.count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, isLawyer]);

  // 내 질문(백엔드 isAuthor 또는 /qa/mine)
  const owned = !!post && (post.isAuthor || ownedByList);

  // 본인 질문이 답변 대기 중이면 안내 팝업 (사용자 화면)
  useEffect(() => {
    if (!isLawyer && post && post.status === 'pending' && owned) {
      setPendingPopupOpen(true);
    }
  }, [isLawyer, post, owned]);

  async function toggleScrap() {
    if (!post) return;
    const prev = scrapped;
    setScrapped(!prev);
    setScrapCount((c) => c + (prev ? -1 : 1));
    try {
      const r = await qnaApi.toggleScrap(post.id);
      setScrapped(r.scrapped);
    } catch {
      setScrapped(prev);
      setScrapCount((c) => c + (prev ? 1 : -1));
    }
  }

  async function submitAnswer() {
    if (!post || !answerText.trim() || submitting || answerProfanity.blocked) return;
    setSubmitting(true);
    try {
      await qnaApi.answer(post.id, answerText.trim());
      setSuccessOpen(true);
    } catch (e: any) {
      if (answerProfanity.applyError(e)) {
        alert('부적절한 표현이 포함되어 있어 등록할 수 없어요. 빨간색으로 표시된 부분을 수정해주세요.');
        return;
      }
      alert(e?.status === 409 ? '이미 답변이 등록된 질문입니다.' : '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!post?.answer || !editText.trim() || submitting || editProfanity.blocked) return;
    setSubmitting(true);
    try {
      await qnaApi.editAnswer(post.id, editText.trim());
      setPost({ ...post, answer: { ...post.answer, content: editText.trim() } });
      setEditing(false);
    } catch (e) {
      if (editProfanity.applyError(e)) {
        alert('부적절한 표현이 포함되어 있어 저장할 수 없어요. 빨간색으로 표시된 부분을 수정해주세요.');
        return;
      }
      alert('수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!post) return;
    try {
      await qnaApi.remove(post.id);
      navigate('/qna', { replace: true });
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="qd">
        <div className="qd-nav">
          <button onClick={() => navigate('/qna')}>
            <IoArrowBack size={24} />
          </button>
        </div>
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="qd">
        <div className="qd-nav">
          <button onClick={() => navigate('/qna')}>
            <IoArrowBack size={24} />
          </button>
          <span className="qd-nav-title">질문을 찾을 수 없어요</span>
        </div>
      </div>
    );
  }

  const answered = post.status === 'answered';

  return (
    <div className={`qd${isLawyer ? ' qd-lawyer' : ''}`}>
      <div className="qd-nav">
        <button onClick={() => navigate('/qna')} aria-label="뒤로">
          <IoArrowBack size={24} />
        </button>
        {isLawyer && <span className="qd-nav-title">질문 상세</span>}
        {owned && !isLawyer && (
          <button className="qd-trash" onClick={() => setDeleteOpen(true)} aria-label="삭제">
            <IoTrashOutline size={22} />
          </button>
        )}
      </div>

      <div className="qd-scroll">
        {/* 질문 */}
        <div className="qd-question">
          <div className="qd-tags">
            {post.category?.trim() && (
              <span className="qd-cat">{post.category}</span>
            )}
            {owned && (
              <span className="qd-mine">
                <span className="qd-dot" />
                내 질문
              </span>
            )}
          </div>
          <h2 className="qd-title">{post.title}</h2>
          <p className="qd-body">{post.content}</p>
          {post.imageUrls?.length > 0 && (
            <div className="qd-images">
              {post.imageUrls.map((u, i) => (
                <img key={i} src={u} alt="" />
              ))}
            </div>
          )}
          <div className="qd-qmeta">
            <span>{post.author?.nickname ?? '익명'}</span>
            <span className="qd-qmeta-dot">·</span>
            <IoTimeOutline size={13} />
            <span>{new Date(post.createdAt).toISOString().slice(0, 10)}</span>
          </div>
        </div>

        {/* 사용자 대기 화면(본인/남)에선 두꺼운 구분선 대신 아래 배경 패널로 구분 */}
        {!(!isLawyer && post.status === 'pending') && <div className="qd-sep" />}

        {/* 변호사: 질문자 정보 */}
        {isLawyer && post.author && (
          <div className="qd-student">
            <div className="qd-student-head">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.6671 13.9999V12.6666C12.6671 11.9594 12.3861 11.2811 11.8861 10.781C11.386 10.2809 10.7077 10 10.0005 10H6.00058C5.29336 10 4.6151 10.2809 4.11501 10.781C3.61493 11.2811 3.33398 11.9594 3.33398 12.6666V13.9999" stroke="#99A1AF" strokeWidth="0.999975" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.00058 7.3332C9.47331 7.3332 10.6672 6.13932 10.6672 4.6666C10.6672 3.19388 9.47331 2 8.00058 2C6.52786 2 5.33398 3.19388 5.33398 4.6666C5.33398 6.13932 6.52786 7.3332 8.00058 7.3332Z" stroke="#99A1AF" strokeWidth="0.999975" strokeLinecap="round" strokeLinejoin="round" />
              </svg>{' '}
              질문자 정보
            </div>
            <div className="qd-student-rows">
              <span>나이 {post.author.age != null ? `만 ${post.author.age}세` : '-'}</span>
              <span>지역 {post.author.region ?? '-'}</span>
              <span>성별 {genderLabel(post.author.gender)}</span>
            </div>
          </div>
        )}

        {/* 답변 영역 */}
        {isLawyer ? (
          post.status === 'pending' ? (
            <div className="qd-answer-form">
              <div className="qd-form-title">답변 작성</div>
              <ProfanityField
                className="qd-answer-textarea"
                placeholder="법률 정보를 바탕으로 신중하게 답변을 작성해 주세요."
                value={answerText}
                onChange={setAnswerText}
                matches={answerProfanity.report.content}
              />
              <button
                className="qd-submit"
                disabled={submitting || !answerText.trim() || answerProfanity.blocked}
                onClick={submitAnswer}
              >
                {submitting ? '등록 중...' : '답변 제출'}
              </button>
            </div>
          ) : (
            post.answer && (
              <AnswerCard
                answer={post.answer}
                editable={post.answer.isMyAnswer}
                editing={editing}
                editText={editText}
                editMatches={editProfanity.report.content}
                editBlocked={editProfanity.blocked}
                submitting={submitting}
                onStartEdit={() => {
                  setEditText(post.answer!.content);
                  setEditing(true);
                }}
                onCancel={() => setEditing(false)}
                onChange={setEditText}
                onSave={saveEdit}
              />
            )
          )
        ) : post.status === 'pending' ? (
          // 대기 화면은 질문 밑을 #F9FAFB 패널로 채움.
          // 내 질문이면 팝업으로 안내하므로 인라인 대기박스는 숨김, 남의 질문이면 표시.
          <div className="qd-pending-bg">
            {!owned && (
              <div className="qd-waiting">
                <ClockIcon size={22} color="#8c937d" />
                <div className="qd-waiting-text">
                  <div className="qd-waiting-title">변호사 답변 대기 중</div>
                  <div className="qd-waiting-desc">1~3일 내로 답변이 등록될 예정이에요.</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          post.answer && <AnswerCard answer={post.answer} />
        )}

        {/* 스크랩 (사용자만, 답변 완료 시) */}
        {!isLawyer && answered && (
          <div className="qd-scrap-area">
            <button className={`qd-scrap ${scrapped ? 'on' : ''}`} onClick={toggleScrap}>
              {scrapped ? <IoBookmark size={18} color="#fff" /> : <IoBookmarkOutline size={18} color="#fff" />}
              {scrapped ? '스크랩됨' : '스크랩하기'} {scrapCount > 0 && scrapCount}
            </button>
          </div>
        )}
      </div>

      <TabBar />

      {/* 본인 질문 답변 대기 안내 (바텀시트) */}
      <Overlay visible={pendingPopupOpen} onClose={() => setPendingPopupOpen(false)} align="bottom">
        <div className="qd-sheet">
          <button className="qd-sheet-close" onClick={() => setPendingPopupOpen(false)} aria-label="닫기">
            ✕
          </button>
          <div className="qd-sheet-icon">
            <ClockIcon size={30} color="#586144" />
          </div>
          <div className="qd-sheet-title">답변 대기 중이에요</div>
          <p className="qd-sheet-desc">
            변호사님이 검토 중입니다.
            <br />
            답변까지 <span className="hl">1~3일</span> 정도 소요돼요.
          </p>
          <p className="qd-sheet-note">긴급한 상황이라면 112에 먼저 연락하세요.</p>
          <button className="qd-sheet-confirm" onClick={() => setPendingPopupOpen(false)}>
            확인
          </button>
        </div>
      </Overlay>

      {/* 삭제 확인 (바텀시트) */}
      <Overlay visible={deleteOpen} onClose={() => setDeleteOpen(false)} align="bottom">
        <div className="qd-sheet qd-sheet-delete">
          <div className="qd-del-icon">
            <TrashSheetIcon size={28} />
          </div>
          <div className="qd-sheet-title">질문을 삭제할까요?</div>
          <p className="qd-del-desc">삭제한 질문은 복구할 수 없어요.</p>
          <div className="qd-del-btns">
            <button className="qd-del-btn danger" onClick={doDelete}>
              삭제하기
            </button>
            <button className="qd-del-btn cancel" onClick={() => setDeleteOpen(false)}>
              취소
            </button>
          </div>
        </div>
      </Overlay>

      {/* 답변 완료 (변호사) */}
      <Overlay visible={successOpen}>
        <div className="qd-modal">
          <div className="qd-modal-icon success">
            <IoCheckmark size={36} color="#fff" />
          </div>
          <div className="qd-modal-title">답변 완료!</div>
          <div className="qd-modal-btns">
            <button className="primary" onClick={() => navigate('/qna')}>
              목록으로
            </button>
            <button className="ghost" onClick={() => navigate('/home')}>
              홈으로
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}

function AnswerCard({
  answer,
  editable,
  editing,
  editText,
  editMatches,
  editBlocked,
  submitting,
  onStartEdit,
  onCancel,
  onChange,
  onSave,
}: {
  answer: NonNullable<QnADetail['answer']>;
  editable?: boolean;
  editing?: boolean;
  editText?: string;
  editMatches?: ProfanityMatch[];
  editBlocked?: boolean;
  submitting?: boolean;
  onStartEdit?: () => void;
  onCancel?: () => void;
  onChange?: (v: string) => void;
  onSave?: () => void;
}) {
  return (
    <div className="qd-answer">
      <div className="qd-answer-head">
        <span className="qd-avatar-img">
          <PersonIcon size={20} color="#5EA500" />
        </span>
        <div className="qd-answer-who">
          <div className="qd-answer-name">{answer.lawyer?.nickname ?? '변호사'}</div>
          {answer.lawyer?.affiliation && (
            <div className="qd-answer-org">
              <IoBusinessOutline size={12} /> {answer.lawyer.affiliation}
            </div>
          )}
        </div>
        {editable && !editing && (
          <button className="qd-edit-btn" onClick={onStartEdit}>
            <IoCreateOutline size={18} color="#678720" />
          </button>
        )}
      </div>
      <div className="qd-answer-divider" />
      {editing ? (
        <>
          <ProfanityField
            className="qd-edit-area"
            value={editText ?? ''}
            onChange={(v) => onChange?.(v)}
            matches={editMatches}
          />
          <div className="qd-edit-btns">
            <button className="ghost" onClick={onCancel}>
              취소
            </button>
            <button className="primary" disabled={submitting || editBlocked} onClick={onSave}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </>
      ) : (
        <Markdown text={answer.content} className="qd-md" />
      )}
    </div>
  );
}
