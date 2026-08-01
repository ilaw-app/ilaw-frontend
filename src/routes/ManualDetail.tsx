import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoArrowBack, IoBookmark, IoBookmarkOutline } from 'react-icons/io5';
import { manualApi } from '../api/manual';
import type { ManualArticleDetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import TabBar from '../components/TabBar';
import './manualDetail.css';

export default function ManualDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const articleId = params.get('articleId') ?? '';
  const { isAuthed } = useAuth();

  const [article, setArticle] = useState<ManualArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapped, setScrapped] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    manualApi
      .article(articleId)
      .then((data) => !cancelled && setArticle((data as any)?.id ? data : null))
      .catch(() => !cancelled && setArticle(null))
      .finally(() => !cancelled && setLoading(false));
    if (isAuthed) {
      manualApi
        .getScrap(articleId)
        .then((s) => {
          if (cancelled) return;
          setScrapped(s.scrapped);
          setScrapCount(s.count ?? 0);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [articleId, isAuthed]);

  async function handleScrap() {
    if (!isAuthed) {
      alert('로그인 후 스크랩할 수 있습니다.');
      return;
    }
    const prev = scrapped;
    setScrapped(!prev);
    setScrapCount((c) => Math.max(0, c + (prev ? -1 : 1)));
    try {
      const r = await manualApi.toggleScrap(articleId);
      setScrapped(r.scrapped);
    } catch {
      setScrapped(prev);
      setScrapCount((c) => Math.max(0, c + (prev ? 1 : -1)));
    }
  }

  return (
    <div className="md">
      <div className="md-header">
        <button className="md-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoArrowBack size={24} color="#101828" />
        </button>
        <h1>{article?.category?.name ?? '매뉴얼'}</h1>
      </div>
      <div className="md-header-divider" />

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : !article ? (
        <div className="spinner-center">
          <p className="md-empty">내용을 불러올 수 없어요.</p>
        </div>
      ) : (
        <div className="screen-scroll md-content">
          <div className="md-q">
            <span className="md-q-label">Q{String(article.order).padStart(2, '0')}.</span>
            <span className="md-q-text">{article.question}</span>
          </div>

          {article.summary && (
            <div className="md-summary">
              <span className="md-summary-arrow">➜</span> {article.summary}
            </div>
          )}

          <div className="manual-html" dangerouslySetInnerHTML={{ __html: article.content ?? '' }} />

          <div className="md-scrap-area">
            <button className={`md-scrap ${scrapped ? 'on' : ''}`} onClick={handleScrap}>
              {scrapped ? <IoBookmark size={18} color="#fff" /> : <IoBookmarkOutline size={18} color="#fff" />}
              {scrapped ? '스크랩됨' : '스크랩하기'}
              {scrapCount > 0 && <span className="md-scrap-count">{scrapCount}</span>}
            </button>
          </div>
        </div>
      )}
      <TabBar />
    </div>
  );
}
