import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoBookOutline, IoChatbubbleOutline, IoPeopleOutline } from 'react-icons/io5';
import { qaApi } from '../api/qa';
import { manualApi } from '../api/manual';
import { communityApi } from '../api/community';
import TabBar from '../components/TabBar';
import './myScraps.css';

type Tab = 'manual' | 'qna' | 'community';

const TAB_EMPTY: Record<Tab, string> = {
  manual: '스크랩한 매뉴얼이 없어요',
  qna: '스크랩한 Q&A가 없어요',
  community: '스크랩한 커뮤니티 글이 없어요',
};

function TypeIcon({ tab }: { tab: Tab }) {
  if (tab === 'manual') return <IoBookOutline size={14} color="#99A1AF" />;
  if (tab === 'qna') return <IoChatbubbleOutline size={14} color="#99A1AF" />;
  return <IoPeopleOutline size={14} color="#99A1AF" />;
}

function BookmarkSmall() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <path d="M9.49971 10.4996L5.99985 8.49971L2.5 10.4996V2.49996C2.5 2.23475 2.60535 1.98041 2.79288 1.79288C2.98041 1.60535 3.23475 1.5 3.49996 1.5H8.49975C8.76496 1.5 9.0193 1.60535 9.20683 1.79288C9.39436 1.98041 9.49971 2.23475 9.49971 2.49996V10.4996Z" stroke="#99A1AF" strokeWidth="0.999958" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="msc-empty">
      <span className="msc-empty-icon">
        <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
          <path d="M22.1667 24.4994L14.0002 19.833L5.8338 24.4994V5.83321C5.8338 5.21438 6.07962 4.62098 6.5172 4.1834C6.95478 3.74582 7.54818 3.5 8.16701 3.5H19.8333C20.4522 3.5 21.0456 3.74582 21.4831 4.1834C21.9207 4.62098 22.1667 5.21438 22.1667 5.83321V24.4994Z" stroke="#D1D5DC" strokeWidth="2.33295" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="msc-empty-text">{TAB_EMPTY[tab]}</span>
    </div>
  );
}

export default function MyScraps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [manualItems, setManualItems] = useState<any[]>([]);
  const [qnaItems, setQnaItems] = useState<any[]>([]);
  const [communityItems, setCommunityItems] = useState<any[]>([]);
  const [loadingManual, setLoadingManual] = useState(true);
  const [loadingQna, setLoadingQna] = useState(true);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;
    setLoadedTabs((prev) => new Set(prev).add(activeTab));
    if (activeTab === 'manual') {
      setLoadingManual(true);
      manualApi.myScraps().then((d) => setManualItems(Array.isArray(d) ? d : [])).catch(() => setManualItems([])).finally(() => setLoadingManual(false));
    } else if (activeTab === 'qna') {
      setLoadingQna(true);
      qaApi.myScraps().then((d) => setQnaItems(Array.isArray(d) ? d : [])).catch(() => setQnaItems([])).finally(() => setLoadingQna(false));
    } else {
      setLoadingCommunity(true);
      communityApi.myBookmarks().then((d) => setCommunityItems(Array.isArray(d) ? d : [])).catch(() => setCommunityItems([])).finally(() => setLoadingCommunity(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loading = activeTab === 'manual' ? loadingManual : activeTab === 'qna' ? loadingQna : loadingCommunity;
  const items = activeTab === 'manual' ? manualItems : activeTab === 'qna' ? qnaItems : communityItems;

  const clean = (s?: string) => (s ?? '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, ' ');

  const cardFor = (item: any) => {
    if (activeTab === 'manual') {
      return { id: item.id, cat: item.category?.name, count: item.scrapCount ?? 0, title: item.question, desc: clean(item.summary), route: `/manual-detail?articleId=${item.id}` };
    }
    if (activeTab === 'qna') {
      return { id: item.id, cat: item.category, count: item.scrapCount ?? 0, title: item.title, desc: clean(item.content), route: `/qna/${item.id}` };
    }
    return { id: item.id, cat: undefined, count: item.bookmarks ?? 0, title: item.title, desc: clean(item.content), route: `/community/${item.id}` };
  };

  return (
    <div className="screen msc">
      <div className="msc-header">
        <button className="msc-back" onClick={() => navigate(-1)} aria-label="뒤로">
          <IoChevronBack size={22} color="#101828" />
        </button>
        <h1 className="msc-title">내 스크랩</h1>
      </div>

      <div className="msc-tabs">
        <button className={`msc-tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>매뉴얼</button>
        <button className={`msc-tab ${activeTab === 'qna' ? 'active' : ''}`} onClick={() => setActiveTab('qna')}>Q&amp;A</button>
        <button className={`msc-tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>커뮤니티</button>
      </div>

      {loading ? (
        <div className="spinner-center"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="screen-scroll msc-list">
          {items.map((raw) => {
            const c = cardFor(raw);
            return (
              <button key={`${activeTab}-${c.id}`} className="msc-card" onClick={() => navigate(c.route)}>
                <div className="msc-card-top">
                  <span className="msc-card-cat">
                    <TypeIcon tab={activeTab} />
                    {c.cat && <span>{c.cat}</span>}
                  </span>
                  <span className="msc-card-scrap">
                    <BookmarkSmall />
                    <span>{c.count}</span>
                  </span>
                </div>
                <div className="msc-card-title">{c.title}</div>
                {c.desc && <div className="msc-card-desc">{c.desc}</div>}
              </button>
            );
          })}
        </div>
      )}

      <TabBar />
    </div>
  );
}
