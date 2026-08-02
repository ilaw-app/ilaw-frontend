import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBookOutline, IoChatbubbleOutline, IoPeopleOutline } from 'react-icons/io5';
import { homeApi } from '../api/home';
import { manualApi } from '../api/manual';
import { communityApi } from '../api/community';
import { qaApi } from '../api/qa';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import type { PopularItem } from '../api/types';
import './home.css';

type ResultType = 'manual' | 'qna' | 'community';
type SearchResult = {
  type: ResultType;
  id: number;
  title: string;
  desc: string;
  category?: string;
  status?: string;
  scrapCount?: number;
};

const TYPE_LABEL: Record<ResultType, string> = { manual: '매뉴얼', qna: 'Q&A', community: '커뮤니티' };
const FILTERS: { key: 'all' | ResultType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'manual', label: '매뉴얼' },
  { key: 'qna', label: 'Q&A' },
  { key: 'community', label: '커뮤니티' },
];

// 타입별 색상 아이콘 (추천 콘텐츠 · 검색 결과 공용)
const TYPE_COLOR: Record<ResultType, string> = { manual: '#9AE600', qna: '#51A2FF', community: '#AD46FF' };
function TypeIcon({ type, size = 14 }: { type: ResultType; size?: number }) {
  const c = TYPE_COLOR[type];
  if (type === 'manual') return <IoBookOutline size={size} color={c} />;
  if (type === 'community') return <IoPeopleOutline size={size} color={c} />;
  return <IoChatbubbleOutline size={size} color={c} />;
}

function BellIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#clip_bell)">
        <path d="M8.55664 17.5C8.70292 17.7533 8.91331 17.9637 9.16666 18.11C9.42001 18.2562 9.7074 18.3332 9.99994 18.3332C10.2925 18.3332 10.5799 18.2562 10.8332 18.11C11.0866 17.9637 11.297 17.7533 11.4432 17.5" stroke="#6A7282" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.7187 12.7717C2.60984 12.891 2.538 13.0394 2.51191 13.1988C2.48583 13.3582 2.50663 13.5217 2.57179 13.6695C2.63694 13.8173 2.74364 13.943 2.8789 14.0312C3.01417 14.1195 3.17217 14.1666 3.33368 14.1667H16.6667C16.8282 14.1667 16.9862 14.1199 17.1216 14.0318C17.2569 13.9437 17.3637 13.8181 17.4291 13.6705C17.4944 13.5228 17.5154 13.3593 17.4895 13.1999C17.4637 13.0405 17.392 12.892 17.2833 12.7725C16.175 11.6301 15.0001 10.4159 15.0001 6.66687C15.0001 5.34082 14.4733 4.06908 13.5356 3.13142C12.598 2.19376 11.3262 1.66699 10.0002 1.66699C8.67413 1.66699 7.40239 2.19376 6.46474 3.13142C5.52708 4.06908 5.00031 5.34082 5.00031 6.66687C5.00031 10.4159 3.8245 11.6301 2.7187 12.7717Z" stroke="#6A7282" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_bell"><rect width="19.9995" height="19.9995" fill="white" /></clipPath></defs>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M7.3332 12.6664C10.2786 12.6664 12.6664 10.2786 12.6664 7.3332C12.6664 4.38775 10.2786 2 7.3332 2C4.38775 2 2 4.38775 2 7.3332C2 10.2786 4.38775 12.6664 7.3332 12.6664Z" stroke="white" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.9994 13.9994L11.1328 11.1328" stroke="white" strokeWidth="1.3333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickScrapIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M10 5.83301V17.4994" stroke="#5EA500" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5003 14.9997C2.2793 14.9997 2.06734 14.9119 1.91106 14.7556C1.75479 14.5993 1.66699 14.3874 1.66699 14.1664V3.33331C1.66699 3.1123 1.75479 2.90035 1.91106 2.74407C2.06734 2.5878 2.2793 2.5 2.5003 2.5H6.66687C7.5509 2.5 8.39873 2.85118 9.02383 3.47629C9.64894 4.10139 10.0001 4.94922 10.0001 5.83325C10.0001 4.94922 10.3513 4.10139 10.9764 3.47629C11.6015 2.85118 12.4493 2.5 13.3334 2.5H17.4999C17.7209 2.5 17.9329 2.5878 18.0892 2.74407C18.2454 2.90035 18.3332 3.1123 18.3332 3.33331V14.1664C18.3332 14.3874 18.2454 14.5993 18.0892 14.7556C17.9329 14.9119 17.7209 14.9997 17.4999 14.9997H12.5001C11.837 14.9997 11.2012 15.2631 10.7323 15.7319C10.2635 16.2007 10.0001 16.8366 10.0001 17.4996C10.0001 16.8366 9.73673 16.2007 9.2679 15.7319C8.79907 15.2631 8.1632 14.9997 7.50018 14.9997H2.5003Z" stroke="#5EA500" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickQnaIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#clip_myq)">
        <path d="M6.58354 16.666C8.17398 17.4819 10.0035 17.7029 11.7425 17.2892C13.4814 16.8754 15.0155 15.8542 16.0681 14.4096C17.1207 12.9649 17.6228 11.1918 17.4837 9.40967C17.3447 7.6276 16.5738 5.95377 15.3098 4.68982C14.0459 3.42587 12.372 2.65492 10.59 2.51589C8.80789 2.37687 7.03475 2.87891 5.59008 3.93155C4.1454 4.98419 3.1242 6.5182 2.71049 8.25716C2.29677 9.99612 2.51776 11.8257 3.33362 13.4161L1.66699 18.3327L6.58354 16.666Z" stroke="#2B7FFF" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs><clipPath id="clip_myq"><rect width="19.9995" height="19.9995" fill="white" /></clipPath></defs>
    </svg>
  );
}

function QuickCommunityIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M13.3334 17.4999V15.8333C13.3334 14.9492 12.9822 14.1014 12.3571 13.4763C11.732 12.8512 10.8842 12.5 10.0001 12.5H5.00024C4.11621 12.5 3.26838 12.8512 2.64328 13.4763C2.01817 14.1014 1.66699 14.9492 1.66699 15.8333V17.4999" stroke="#AD46FF" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.50024 9.1665C9.34115 9.1665 10.8335 7.67415 10.8335 5.83325C10.8335 3.99235 9.34115 2.5 7.50024 2.5C5.65934 2.5 4.16699 3.99235 4.16699 5.83325C4.16699 7.67415 5.65934 9.1665 7.50024 9.1665Z" stroke="#AD46FF" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3329 17.4999V15.8333C18.3324 15.0948 18.0866 14.3773 17.6341 13.7936C17.1816 13.2099 16.5481 12.793 15.833 12.6084" stroke="#AD46FF" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.333 2.6084C14.05 2.79198 14.6855 3.20897 15.1393 3.79363C15.5932 4.37829 15.8395 5.09736 15.8395 5.83748C15.8395 6.57761 15.5932 7.29668 15.1393 7.88134C14.6855 8.466 14.05 8.88299 13.333 9.06657" stroke="#AD46FF" strokeWidth="1.66663" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScrapSmallIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <path d="M9.49971 10.4996L5.99985 8.49971L2.5 10.4996V2.49996C2.5 2.23475 2.60535 1.98041 2.79288 1.79288C2.98041 1.60535 3.23475 1.5 3.49996 1.5H8.49975C8.76496 1.5 9.0193 1.60535 9.20683 1.79288C9.39436 1.98041 9.49971 2.23475 9.49971 2.49996V10.4996Z" stroke="#99A1AF" strokeWidth="0.999958" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function stripMd(s: string) {
  return (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, ' ');
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthed } = useAuth();
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [hasNoti, setHasNoti] = useState(false);
  const [winking, setWinking] = useState(false);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filter, setFilter] = useState<'all' | ResultType>('all');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    homeApi
      .popular()
      .then((d) => setPopular(Array.isArray(d) ? d : []))
      .catch(() => setPopular([]))
      .finally(() => setLoadingPopular(false));
    if (isAuthed) {
      api
        .get<{ count: number }>('/notifications/unread-count')
        .then((r) => setHasNoti((r?.count ?? 0) > 0))
        .catch(() => {});
    }
  }, [isAuthed]);

  useEffect(() => {
    const iv = setInterval(() => {
      setWinking(true);
      setTimeout(() => setWinking(false), 220);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  async function runSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    setSearching(true);
    setSubmittedQuery(term);
    setSearchLoading(true);
    setFilter('all');
    try {
      const [manual, qna, community] = await Promise.all([
        manualApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
        qaApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
        communityApi.search(term).catch(() => ({ results: [] as any[], expandedTerms: [] })),
      ]);
      const merged: SearchResult[] = [
        ...(manual.results ?? []).map((r: any) => ({
          type: 'manual' as const,
          id: r.id,
          title: r.question ?? r.title ?? '',
          desc: stripMd(r.summary ?? r.content ?? ''),
          category: r.category?.name ?? r.category?.slug,
          scrapCount: r.scrapCount ?? 0,
        })),
        ...(qna.results ?? []).map((r: any) => ({
          type: 'qna' as const,
          id: r.id,
          title: r.title ?? '',
          desc: stripMd(r.content ?? ''),
          category: r.category,
          status: r.status,
          scrapCount: r.scrapCount ?? 0,
        })),
        ...(community.results ?? []).map((r: any) => ({
          type: 'community' as const,
          id: r.id,
          title: r.title ?? '',
          desc: stripMd(r.content ?? ''),
          scrapCount: r.bookmarks ?? 0,
        })),
      ];
      setResults(merged);
    } finally {
      setSearchLoading(false);
    }
  }

  function openResult(r: SearchResult) {
    if (r.type === 'manual') navigate(`/manual-detail?articleId=${r.id}`);
    else if (r.type === 'qna') navigate(`/qna/${r.id}`);
    else navigate(`/community/${r.id}`);
  }

  function openPopular(p: PopularItem) {
    if (p.type === 'manual') navigate(`/manual-detail?articleId=${p.id}`);
    else if (p.type === 'qna') navigate(`/qna/${p.id}`);
    else navigate(`/community/${p.id}`);
  }

  const shown = filter === 'all' ? results : results.filter((r) => r.type === filter);

  // ── 검색 결과 화면 ──
  if (searching) {
    return (
      <div className="screen hs">
        <div className="hs-head">
          <button
            className="hs-back"
            onClick={() => {
              setSearching(false);
              setQuery('');
              setSubmittedQuery('');
              setResults([]);
            }}
            aria-label="뒤로"
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <path d="M9.99618 15.8273L4.16504 9.99618L9.99618 4.16504" stroke="#678720" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.8273 9.99609H4.16504" stroke="#678720" strokeWidth="1.66604" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="hs-head-title">'{submittedQuery}' 검색 결과</h2>
        </div>

        <div className="hs-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`hs-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {searchLoading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="screen-scroll hs-list">
            {shown.length === 0 ? (
              <div className="hs-empty">
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              shown.map((r) => (
                <button key={`${r.type}-${r.id}`} className="hs-card" onClick={() => openResult(r)}>
                  <div className="hs-card-top">
                    <TypeIcon type={r.type} size={14} />
                    <span className="hs-card-type">{TYPE_LABEL[r.type]}</span>
                    {r.category && (
                      <>
                        <span className="hs-card-bullet">·</span>
                        <span className="hs-card-cat">{r.category}</span>
                      </>
                    )}
                    {r.type === 'qna' && r.status && (
                      <span className={`hs-card-status ${r.status === 'answered' ? 'answered' : 'pending'}`}>
                        {r.status === 'answered' ? '답변완료' : '답변대기'}
                      </span>
                    )}
                  </div>
                  <div className="hs-card-title">
                    <HighlightText text={r.title} keyword={submittedQuery} />
                  </div>
                  {r.desc && (
                    <div className="hs-card-desc">
                      <HighlightText text={r.desc} keyword={submittedQuery} />
                    </div>
                  )}
                  <div className="hs-card-scrap">
                    <ScrapSmallIcon />
                    <span>{r.scrapCount ?? 0}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
        <TabBar />
      </div>
    );
  }

  // ── 메인 홈 ──
  return (
    <div className="screen home-screen">
      {/* 상단바 */}
      <div className="home-topbar">
        <img className="home-tb-logo" src="/assets/logo2.png" alt="아이로" />
        <div className="home-tb-text">
          <span className="home-tb-name font-airo">아이로</span>
          <span className="home-tb-sub font-airo">혼자 고민하지 않아도 괜찮아요</span>
        </div>
        <button className="home-tb-bell" onClick={() => navigate('/notifications')} aria-label="알림">
          <BellIcon />
          {hasNoti && <span className="home-tb-bell-dot" />}
        </button>
      </div>

      <div className="screen-scroll home-body">
        {/* 검색창 */}
        <form
          className="home-search"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <input
            placeholder="궁금한 내용을 검색해보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="home-search-btn" aria-label="검색">
            <SearchIcon />
          </button>
        </form>

        {/* 퀵 액션 */}
        <div className="home-quick">
          <button className="home-quick-item" onClick={() => navigate('/my-scraps')}>
            <span className="home-quick-icon scrap"><QuickScrapIcon /></span>
            <span className="home-quick-label">내 스크랩</span>
          </button>
          <button className="home-quick-item" onClick={() => navigate('/my-questions')}>
            <span className="home-quick-icon qna"><QuickQnaIcon /></span>
            <span className="home-quick-label">내 질문</span>
          </button>
          <button className="home-quick-item" onClick={() => navigate('/community')}>
            <span className="home-quick-icon community"><QuickCommunityIcon /></span>
            <span className="home-quick-label">내 커뮤니티 글</span>
          </button>
        </div>

        {/* 추천 콘텐츠 */}
        <div className="home-reco-card">
          <div className="home-reco-head">
            <span className="home-reco-title">추천 콘텐츠</span>
            <button className="home-reco-more" onClick={() => navigate('/manual')}>더보기 ›</button>
          </div>
          {loadingPopular ? (
            <div className="spinner-center" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : popular.length === 0 ? (
            <p className="home-reco-empty">아직 추천 콘텐츠가 없어요</p>
          ) : (
            popular.slice(0, 5).map((p, i) => (
              <button key={`${p.type}-${p.id}`} className="home-reco-row" onClick={() => openPopular(p)}>
                <span className="home-reco-num">{i + 1}</span>
                <span className="home-reco-label">{p.label}</span>
                {p.category && <span className="home-reco-cat">{p.category}</span>}
                <TypeIcon type={p.type} size={14} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* AI 챗봇 버튼 */}
      <div className="home-bubble">
        <svg
          width="115"
          height="74"
          viewBox="0 0 95 60"
          style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.25))' }}
        >
          <ellipse cx="46.5" cy="25" rx="45.5" ry="25" fill="white" />
          <path d="M84.5596 54.0391L64.9844 40.0523L82.2344 30.093L84.5596 54.0391Z" fill="white" />
        </svg>
        <span className="home-bubble-text font-airo">
          챗봇 '아이로'에게
          <br />
          물어보세요!
        </span>
      </div>
      <button className="home-aifab" onClick={() => navigate('/ai-chat')}>
        <img className="aifab-base" src="/assets/chatbot_logo.png" alt="AI 챗봇" style={{ opacity: winking ? 0 : 1 }} />
        <img className="aifab-wink" src="/assets/wink.png" alt="" style={{ opacity: winking ? 1 : 0 }} />
      </button>

      <TabBar />
    </div>
  );
}
