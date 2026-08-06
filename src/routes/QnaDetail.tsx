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
import { Markdown } from '../components/Markdown';
import TabBar from '../components/TabBar';
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

function TrashSheetIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M3.5 7H24.4996" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22.166 7V23.333C22.166 24.4996 20.9994 25.6663 19.8327 25.6663H8.16629C6.99965 25.6663 5.83301 24.4996 5.83301 23.333V7" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.33301 7.00055V4.66727C9.33301 3.50063 10.4996 2.33398 11.6663 2.33398H16.3329C17.4995 2.33398 18.6661 3.50063 18.6661 4.66727V7.00055" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.666 12.834V19.8338" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.333 12.834V19.8338" stroke="#6A7282" strokeWidth="2.33328" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
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
    if (!post || !answerText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await qnaApi.answer(post.id, answerText.trim());
      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.status === 409 ? '이미 답변이 등록된 질문입니다.' : '답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit() {
    if (!post?.answer || !editText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await qnaApi.editAnswer(post.id, editText.trim());
      setPost({ ...post, answer: { ...post.answer, content: editText.trim() } });
      setEditing(false);
    } catch {
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
    <div className="qd">
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
            <span className={`qd-status ${post.status}`}>
              <span className="qd-status-dot" />
              {answered ? '답변완료' : '답변대기'}
            </span>
            {post.category?.trim() && (
              <span className="qd-cat">
                <span className="qd-dot" />
                {post.category}
              </span>
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
              <IoPersonOutline size={16} /> 질문자 정보
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
              <textarea
                placeholder="법률 정보를 바탕으로 신중하게 답변을 작성해 주세요."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <button className="qd-submit" disabled={submitting || !answerText.trim()} onClick={submitAnswer}>
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
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M15.8273 17.4942V15.8282C15.8273 14.9445 15.4763 14.0969 14.8514 13.472C14.2265 12.8472 13.379 12.4961 12.4952 12.4961H7.49712C6.6134 12.4961 5.76587 12.8472 5.14098 13.472C4.5161 14.0969 4.16504 14.9445 4.16504 15.8282V17.4942" stroke="#BEE966" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.99615 9.16417C11.8364 9.16417 13.3282 7.67234 13.3282 5.83208C13.3282 3.99182 11.8364 2.5 9.99615 2.5C8.15589 2.5 6.66406 3.99182 6.66406 5.83208C6.66406 7.67234 8.15589 9.16417 9.99615 9.16417Z" stroke="#BEE966" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          <textarea className="qd-edit-area" value={editText} onChange={(e) => onChange?.(e.target.value)} />
          <div className="qd-edit-btns">
            <button className="ghost" onClick={onCancel}>
              취소
            </button>
            <button className="primary" disabled={submitting} onClick={onSave}>
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
