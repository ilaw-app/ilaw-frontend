import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoChevronBack, IoChevronForward, IoSearch, IoClose, IoSearchOutline, IoCall } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { ManualArticleSummary } from '../api/types';
import { HighlightText } from '../components/HighlightText';
import TabBar from '../components/TabBar';
import './manualList.css';

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
    <div className="screen">
      <div className="ml-header">
        <button className="ml-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoChevronBack size={24} color="#586144" />
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
            <button className="ml-search-icon" onClick={handleSearch} aria-label="검색 실행">
              <IoSearch size={20} color="#9caf88" />
            </button>
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

      <div className="ml-help-wrap">
        <span className="ml-help-caption">지금 힘드신가요?</span>
        <button className="ml-help" onClick={() => navigate(`/manual-help?categoryId=${categoryId}`)}>
          <span className="ml-help-icon">
            <IoCall size={13} color="#fff" />
          </span>
          긴급 연락처 보기
        </button>
      </div>

      <TabBar />
    </div>
  );
}
