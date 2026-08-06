import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearch,
  IoClose,
  IoChatbubbleOutline,
  IoTimeOutline,
  IoAdd,
} from 'react-icons/io5';
import { qnaApi } from '../api/qna';
import type { QnAListItem } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import './qna.css';

type TabKey = 'all' | 'answered' | 'pending';

function mmdd(iso: string) {
  const s = String(iso).slice(0, 10); // YYYY-MM-DD
  return s.length >= 10 ? `${s.slice(5, 7)}.${s.slice(8, 10)}` : s;
}

function QnaCard({
  item,
  keyword,
  mine,
  onClick,
}: {
  item: QnAListItem;
  keyword: string;
  mine?: boolean;
  onClick: () => void;
}) {
  const answered = item.status === 'answered';
  const thumb = item.imageUrls?.[0];
  return (
    <button className="qna-card" onClick={onClick}>
      <div className="qna-card-top">
        <span className={`qna-status ${item.status}`}>
          <span className="qna-status-dot" />
          {answered ? '답변완료' : '답변대기'}
        </span>
        {item.category?.trim() && (
          <span className="qna-cat">
            <span className="qna-dot" />
            <span className="qna-cat-label">{item.category}</span>
          </span>
        )}
        {mine && (
          <span className="qna-mine">
            <span className="qna-dot" />
            내 질문
          </span>
        )}
        <span className="qna-date">{mmdd(item.createdAt)}</span>
      </div>

      <div className="qna-card-main">
        <div className="qna-card-texts">
          <div className="qna-card-title">
            <HighlightText text={item.title} keyword={keyword} />
          </div>
          <div className="qna-card-content">
            <HighlightText text={item.content} keyword={keyword} />
          </div>
        </div>
        {thumb && <img className="qna-card-thumb" src={thumb} alt="" />}
      </div>
    </button>
  );
}

// 임시: 변호사님 답변이 있는 질문만 화면에 노출 (DB 삭제가 아니라 화면 필터).
// 나중에 전체를 다시 보이려면 SHOW_ONLY_LAWYER_QNA=false 로 바꾸면 됨.
const SHOW_ONLY_LAWYER_QNA = true;
const LAWYER_Q_KEYWORDS = ['통금', '주휴수당', '인스타', '무관심', '경찰조사'];
const isLawyerQuestion = (title: string) => {
  const t = (title ?? '').replace(/\s/g, '');
  return LAWYER_Q_KEYWORDS.some((k) => t.includes(k));
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'answered', label: '답변완료' },
  { key: 'pending', label: '답변대기' },
];

export default function QnaList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [posts, setPosts] = useState<QnAListItem[]>([]);
  const [mineIds, setMineIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    let cancelled = false;
    qnaApi
      .list()
      .then((data) => {
        if (cancelled) return;
        let list = Array.isArray(data) ? data : [];
        if (SHOW_ONLY_LAWYER_QNA) {
          // 변호사 답변이 있는 5개는 답변완료로 표시하고,
          // 그 외 질문은 '대기중(pending)'인 것만 노출 (새로 등록한 질문이 답변대기로 보이도록).
          // 답변완료된 다른 잡질문은 계속 숨김.
          list = list
            .map((p) => (isLawyerQuestion(p.title) ? { ...p, status: 'answered' as const } : p))
            .filter((p) => isLawyerQuestion(p.title) || p.status === 'pending');
        }
        // 최신순 정렬 (createdAt 내림차순)
        list = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(list);
        // 썸네일 보강(임시): 리스트 API가 imageUrls를 안 주므로 상세를 병렬 조회해 대표 이미지를 채운다.
        // TODO(BE): GET /qa 응답에 imageUrls(또는 대표 이미지)를 추가하면 이 보강은 제거 가능.
        Promise.all(
          list.map((p) =>
            qnaApi
              .get(p.id)
              .then((d) => ({ id: p.id, imageUrls: d.imageUrls }))
              .catch(() => null)
          )
        ).then((details) => {
          if (cancelled) return;
          const map = new Map(
            details.filter((d): d is { id: number; imageUrls: string[] } => !!d && Array.isArray(d.imageUrls)).map((d) => [d.id, d.imageUrls])
          );
          if (map.size === 0) return;
          setPosts((prev) => prev.map((p) => (map.has(p.id) ? { ...p, imageUrls: map.get(p.id) } : p)));
        });
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // 내가 쓴 질문 id 집합 (로그인 시에만 성공 → '내 질문' 배지 표시)
    qnaApi
      .mine()
      .then((mineList) => {
        if (cancelled) return;
        setMineIds(new Set((Array.isArray(mineList) ? mineList : []).map((m: any) => m.id)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = posts;
    if (tab !== 'all') list = list.filter((p) => p.status === tab);
    const q = submitted.trim();
    if (q) {
      list = list.filter(
        (p) => p.title.includes(q) || p.content?.includes(q) || p.category.includes(q)
      );
    }
    return list;
  }, [submitted, posts, tab]);

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) {
        setQuery('');
        setSubmitted('');
      }
      return !open;
    });
  }

  // ── 변호사 화면: 답변 대기 / 답변 완료 섹션 ──
  if (role === 'lawyer') {
    const pending = posts.filter((p) => p.status === 'pending');
    const answered = posts.filter((p) => p.status !== 'pending');
    return (
      <div className="screen qna-screen">
        <div className="qna-header">
          <div className="qna-header-text">
            <h1>Q&amp;A 답변 관리</h1>
            <p>아이들의 질문에 답변해주세요</p>
          </div>
        </div>
        {loading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="screen-scroll qna-lawyer-list">
            <section className="qna-section">
              <div className="qna-section-row">
                <IoTimeOutline size={17} color="#c10007" />
                <span style={{ color: '#c10007' }}>답변 대기 중 ({pending.length})</span>
              </div>
              {pending.length === 0 ? (
                <p className="qna-section-empty">대기 중인 질문이 없습니다</p>
              ) : (
                <div className="qna-section-cards">
                  {pending.map((item) => (
                    <QnaCard key={item.id} item={item} keyword="" onClick={() => navigate(`/qna/${item.id}`)} />
                  ))}
                </div>
              )}
            </section>
            <section className="qna-section">
              <div className="qna-section-row">
                <IoChatbubbleOutline size={17} color="#2b56b5" />
                <span style={{ color: '#2b56b5' }}>답변 완료 ({answered.length})</span>
              </div>
              {answered.length === 0 ? (
                <p className="qna-section-empty">완료된 답변이 없습니다</p>
              ) : (
                <div className="qna-section-cards">
                  {answered.map((item) => (
                    <QnaCard key={item.id} item={item} keyword="" onClick={() => navigate(`/qna/${item.id}`)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        <TabBar />
      </div>
    );
  }

  // ── 사용자 화면 ──
  return (
    <div className="screen qna-screen">
      <div className="qna-header">
        <div className="qna-header-text">
          <h1>Q&amp;A</h1>
          <p>변호사님이 직접 답변해 드립니다</p>
        </div>
        <button className="qna-header-search" onClick={toggleSearch} aria-label="검색">
          {searchOpen ? <IoClose size={24} color="#6a7282" /> : <IoSearch size={22} color="#6a7282" />}
        </button>
      </div>

      {searchOpen && (
        <div className="qna-search-area">
          <form
            className="qna-search-box"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(query);
            }}
          >
            <IoSearch size={18} color="#99a1af" />
            <input
              autoFocus
              placeholder="질문 검색..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) setSubmitted('');
              }}
            />
            {query && (
              <button
                type="button"
                className="qna-search-clear"
                onClick={() => {
                  setQuery('');
                  setSubmitted('');
                }}
              >
                <IoClose size={16} color="#99a1af" />
              </button>
            )}
          </form>
        </div>
      )}

      <div className="qna-divider" />

      <div className="qna-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`qna-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll qna-list">
          {filtered.length === 0 ? (
            <div className="qna-empty">
              <IoChatbubbleOutline size={40} color="#ccd9ba" />
              <p>{submitted ? '검색 결과가 없습니다' : '아직 등록된 질문이 없습니다'}</p>
            </div>
          ) : (
            filtered.map((item) => (
              <QnaCard
                key={item.id}
                item={item}
                keyword={submitted}
                mine={mineIds.has(item.id)}
                onClick={() => navigate(`/qna/${item.id}`)}
              />
            ))
          )}
        </div>
      )}

      <button className="qna-fab" title="질문하기" onClick={() => navigate('/qna/ask')}>
        <IoAdd size={30} color="#fff" />
      </button>

      <TabBar />
    </div>
  );
}
