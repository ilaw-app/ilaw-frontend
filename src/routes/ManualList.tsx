import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoChevronForward, IoSearch, IoClose, IoSearchOutline } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { ManualArticleSummary } from '../api/types';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import './manualList.css';

// 플로팅 "긴급 연락처 보기" 버튼용 전화 아이콘 (피그마 지정)
function HelpPhoneIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip_help_phone)">
        <path d="M14.6627 11.2773V13.2768C14.6634 13.4624 14.6254 13.6461 14.551 13.8162C14.4767 13.9863 14.3676 14.1389 14.2308 14.2644C14.094 14.3899 13.9326 14.4854 13.7567 14.5449C13.5809 14.6044 13.3946 14.6265 13.2097 14.6098C11.1588 14.3869 9.18869 13.6861 7.45779 12.5636C5.84741 11.5403 4.48209 10.175 3.45879 8.5646C2.33239 6.82584 1.63141 4.84619 1.41264 2.78604C1.39598 2.60173 1.41788 2.41598 1.47695 2.2406C1.53602 2.06522 1.63096 1.90406 1.75573 1.76738C1.88049 1.6307 2.03235 1.5215 2.20163 1.44673C2.37091 1.37195 2.55391 1.33325 2.73897 1.33307H4.73847C5.06193 1.32989 5.37551 1.44443 5.62076 1.65535C5.86601 1.86626 6.0262 2.15916 6.07147 2.47945C6.15587 3.11934 6.31238 3.74762 6.53802 4.35232C6.62769 4.59087 6.6471 4.85014 6.59394 5.09938C6.54079 5.34863 6.41729 5.57742 6.2381 5.75863L5.39164 6.60509C6.34044 8.2737 7.72203 9.65529 9.39064 10.6041L10.2371 9.75763C10.4183 9.57844 10.6471 9.45494 10.8963 9.40178C11.1456 9.34863 11.4049 9.36803 11.6434 9.45771C12.2481 9.68335 12.8764 9.83986 13.5163 9.92426C13.84 9.96993 14.1357 10.133 14.3471 10.3825C14.5585 10.6319 14.6708 10.9504 14.6627 11.2773Z" stroke="#FB2C36" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip_help_phone">
          <rect width="15.996" height="15.996" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const SLUG_TO_NAME: Record<string, string> = {
  finance: '금융',
  labor: '노동',
  'sexual-violence': '성폭력',
  'child-abuse': '아동학대/가정폭력',
  'online-violence': '온라인폭력',
  'birth-and-parenting': '출생/양육',
  'parental-rights': '법정대리인',
  'school-violence': '학교폭력',
};

const qLabel = (n: number) => `Q${String(n).padStart(2, '0')}`;

export default function ManualList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const categoryId = params.get('categoryId') ?? '';

  const [articles, setArticles] = useState<ManualArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<{ id: number; question: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    manualApi
      .articles(categoryId)
      .then((data) => !cancelled && setArticles(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setArticles([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const qNum = (id: number, fallback: number) => {
    const idx = articles.findIndex((a) => a.id === id);
    return idx >= 0 ? idx + 1 : fallback;
  };

  function handleSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchLoading(true);
    manualApi
      .search(query.trim())
      .then((data) => {
        const filtered = (data.results ?? [])
          .filter((r) => r.category?.slug === categoryId)
          .map((r) => ({ id: r.id, question: r.question }))
          // 피그마: 검색 결과는 Q번호 오름차순
          .sort((a, b) => qNum(a.id, 9999) - qNum(b.id, 9999));
        setResults(filtered);
      })
      .catch(() => setResults([]))
      .finally(() => setSearchLoading(false));
  }

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery('');
    setIsSearching(false);
    setResults([]);
  }

  return (
    <div className="screen" style={{ background: '#fff' }}>
      <div className="ml-header">
        <button className="ml-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={24} color="#101828" />
        </button>
        <h1>{SLUG_TO_NAME[categoryId] ?? '매뉴얼'}</h1>
        <button
          className="ml-header-search"
          onClick={searchOpen ? closeSearch : openSearch}
          aria-label={searchOpen ? '검색 닫기' : '검색'}
        >
          {searchOpen ? <IoClose size={24} color="#586144" /> : <IoSearch size={22} color="#586144" />}
        </button>
      </div>

      {searchOpen && (
        <div className="ml-search-area">
          <div className="ml-search-box">
            <IoSearch size={18} color="#99a1af" />
            <input
              autoFocus
              placeholder="질문 검색..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setIsSearching(false);
                  setResults([]);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {query && (
              <button
                className="ml-search-clear"
                onClick={() => {
                  setQuery('');
                  setIsSearching(false);
                  setResults([]);
                }}
                aria-label="지우기"
              >
                <IoClose size={16} color="#99a1af" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="screen-scroll ml-content">
        {loading ? (
          <div className="spinner-center">
            <div className="spinner" />
          </div>
        ) : isSearching ? (
          searchLoading ? (
            <div className="spinner-center">
              <div className="spinner" />
            </div>
          ) : results.length === 0 ? (
            <div className="ml-empty">
              <IoSearchOutline size={36} color="#ccd9ba" />
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="ml-card">
              {results.map((item, idx) => (
                <div key={item.id}>
                  <button className="ml-q" onClick={() => navigate(`/manual-detail?articleId=${item.id}`)}>
                    <span className="ml-q-num">{qLabel(qNum(item.id, idx + 1))}</span>
                    <span className="ml-q-text">
                      <HighlightText text={item.question} keyword={query} />
                    </span>
                    <IoChevronForward size={18} color="#bbb" />
                  </button>
                  {idx < results.length - 1 && <div className="ml-divider" />}
                </div>
              ))}
            </div>
          )
        ) : articles.length === 0 ? (
          <div className="ml-empty">
            <p>아직 등록된 내용이 없어요.</p>
          </div>
        ) : (
          <div className="ml-card">
            {articles.map((article, index) => (
              <div key={article.id}>
                <button className="ml-q" onClick={() => navigate(`/manual-detail?articleId=${article.id}`)}>
                  <span className="ml-q-num">{qLabel(index + 1)}</span>
                  <span className="ml-q-text">{article.question}</span>
                  <IoChevronForward size={18} color="#bbb" />
                </button>
                {index < articles.length - 1 && <div className="ml-divider" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="ml-help" onClick={() => navigate(`/manual-help?categoryId=${categoryId}`)}>
        <span className="ml-help-icon">
          <HelpPhoneIcon />
        </span>
        <span className="ml-help-textcol">
          <span className="ml-help-caption">지금 힘드신가요?</span>
          <span className="ml-help-title">긴급 연락처 보기</span>
        </span>
      </button>

      <TabBar />
    </div>
  );
}
