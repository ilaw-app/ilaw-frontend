import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  IoSearch,
  IoClose,
  IoAdd,
  IoChatbubbleOutline,
  IoEllipsisVertical,
} from 'react-icons/io5';
import { communityApi } from '../api/community';
import type { CommunityListItem } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import { TrashRedIcon, EditRedIcon } from '../components/PostMenuIcons';
import TabBar from '../components/TabBar';
import './community.css';

type PollOption = { label: string; votes: number };
type NormalizedPoll = { options: PollOption[]; total: number };
type CommunityPost = Omit<CommunityListItem, 'poll'> & { poll: NormalizedPoll | null };

// ThumbsUpIcon — 원본 커스텀 SVG 그대로 이식
function ThumbsUpIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <path d="M5.83069 8.3291V18.3245" stroke="#6A7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.4942 4.89786L11.6613 8.32962H16.5174C16.776 8.32962 17.0311 8.38983 17.2624 8.50549C17.4937 8.62115 17.6949 8.78908 17.8501 8.99598C18.0053 9.20287 18.1102 9.44306 18.1564 9.69751C18.2027 9.95196 18.1891 10.2137 18.1167 10.462L16.1759 17.1256C16.075 17.4716 15.8645 17.7756 15.5762 17.9918C15.2878 18.2081 14.9371 18.325 14.5766 18.325H3.33179C2.88997 18.325 2.46624 18.1495 2.15382 17.8371C1.84141 17.5247 1.66589 17.1009 1.66589 16.6591V9.99552C1.66589 9.55369 1.84141 9.12996 2.15382 8.81755C2.46624 8.50513 2.88997 8.32962 3.33179 8.32962H5.63074C5.94066 8.32945 6.2444 8.24283 6.50779 8.0795C6.77119 7.91616 6.9838 7.68259 7.12172 7.40504L9.99539 1.66602C10.3882 1.67088 10.7748 1.76444 11.1264 1.93972C11.4779 2.11499 11.7853 2.36745 12.0256 2.67822C12.2659 2.98899 12.4329 3.35004 12.514 3.7344C12.5952 4.11876 12.5884 4.51648 12.4942 4.89786Z" stroke="#6A7282" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return diffDays === 0 ? '오늘' : `${diffDays}일 전`;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

function normalizePoll(poll: any): NormalizedPoll | null {
  if (!poll?.options) return null;
  const options = poll.options as PollOption[];
  return { options, total: options.reduce((s, o) => s + o.votes, 0) };
}

function PollBar({ option, total }: { option: PollOption; total: number }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  return (
    <div className="cm-poll-row">
      <div className="cm-poll-track">
        <div className="cm-poll-fill" style={{ width: `${pct}%` }} />
        <span className="cm-poll-label">{option.label}</span>
      </div>
      <span className="cm-poll-pct">{pct}%</span>
    </div>
  );
}

function PostCard({
  item,
  keyword,
  isOwner,
  onPress,
  onMenuPress,
}: {
  item: CommunityPost;
  keyword: string;
  isOwner: boolean;
  onPress: () => void;
  onMenuPress: (postId: number, top: number) => void;
}) {
  const edited =
    item.updatedAt &&
    new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime() > 1000;

  const handleMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const frame = document.getElementById('app-frame');
    const br = btn.getBoundingClientRect();
    if (frame) {
      const fr = frame.getBoundingClientRect();
      const scale = fr.width / 390;
      onMenuPress(item.id, (br.bottom - fr.top) / scale + 8);
    } else {
      onMenuPress(item.id, br.bottom + 8);
    }
  };

  return (
    <div className="cm-card" onClick={onPress}>
      <div className="cm-card-top">
        <div className="cm-avatar-row">
          <img src="/assets/Container.png" className="cm-avatar" alt="" />
          <span className="cm-nickname">{item.nickname}</span>
        </div>
        <div className="cm-top-right">
          <span className="cm-date">
            {formatDate(item.createdAt)}
            {edited ? ' (수정됨)' : ''}
          </span>
          {isOwner && (
            <button className="cm-more" onClick={handleMore}>
              <IoEllipsisVertical size={16} color="#9CAF88" />
            </button>
          )}
        </div>
      </div>

      <div className="cm-card-body">
        <div className="cm-card-text">
          <div className="cm-title">
            <HighlightText text={item.title} keyword={keyword} />
          </div>
          {item.content ? (
            <div className="cm-content">
              <HighlightText text={item.content} keyword={keyword} />
            </div>
          ) : null}
        </div>
        {item.imageUrls && item.imageUrls.length > 0 && (
          <img src={item.imageUrls[0]} className="cm-thumb" alt="" />
        )}
      </div>

      {item.poll && (
        <div className="cm-poll">
          {item.poll.options.map((opt) => (
            <PollBar key={opt.label} option={opt} total={item.poll!.total} />
          ))}
        </div>
      )}

      <div className="cm-card-bottom">
        <div className="cm-meta-item">
          <ThumbsUpIcon />
          <span className="cm-meta-text">{item.likes}</span>
        </div>
        <div className="cm-meta-item">
          <IoChatbubbleOutline size={14} color="#6A7282" />
          <span className="cm-meta-text">{item.comments}</span>
        </div>
      </div>
    </div>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [menuTop, setMenuTop] = useState(0);

  useEffect(() => {
    let cancelled = false;
    communityApi
      .list(50)
      .then((data) => {
        if (cancelled) return;
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any).posts)
          ? (data as any).posts
          : [];
        setPosts(list.map((p: any) => ({ ...p, poll: normalizePoll(p.poll) })));
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) {
        setQuery('');
        setSubmitted('');
      }
      return !open;
    });
  }

  const displayPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => {
          const q = submitted.trim();
          if (!q) return true;
          return p.title.includes(q) || (p.content ?? '').includes(q);
        })
        .sort((a, b) => (sort === 'popular' ? b.likes - a.likes : 0)),
    [posts, submitted, sort]
  );

  const handleMenuPress = (postId: number, top: number) => {
    setMenuPostId(postId);
    setMenuTop(top);
  };

  const handleDelete = () => {
    const id = menuPostId;
    setMenuPostId(null);
    if (!id) return;
    communityApi.remove(id).catch(() => {});
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEdit = () => {
    const id = menuPostId;
    setMenuPostId(null);
    if (!id) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const qs = new URLSearchParams({
      editId: String(id),
      editTitle: post.title,
      editContent: post.content ?? '',
      editImageUrls: JSON.stringify(post.imageUrls ?? []),
      editPoll: post.poll ? JSON.stringify(post.poll.options) : '',
    });
    navigate(`/community/write?${qs.toString()}`);
  };

  const keyword = submitted.trim();
  const frame = document.getElementById('app-frame');

  return (
    <div className="screen cm-screen">
      <div className="cm-header">
        <div className="cm-header-text">
          <h1 className="cm-header-title">커뮤니티</h1>
          <p className="cm-header-sub">정보 공유를 통해 함께 도움을 주고받아요</p>
        </div>
        <button className="cm-header-search" onClick={toggleSearch} aria-label="검색">
          {searchOpen ? <IoClose size={24} color="#6a7282" /> : <IoSearch size={22} color="#6a7282" />}
        </button>
      </div>

      {searchOpen && (
        <div className="cm-search-area">
          <form
            className="cm-search-box"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(query);
            }}
          >
            <IoSearch size={18} color="#99a1af" />
            <input
              autoFocus
              placeholder="키워드로 검색해보세요!"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) setSubmitted('');
              }}
            />
            {query && (
              <button
                type="button"
                className="cm-search-clear"
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

      {loading ? (
        <div className="spinner-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="screen-scroll cm-list">
          <div>
            <div className="cm-sort-btns">
              <button
                className={`cm-sort-btn ${sort === 'popular' ? 'active' : ''}`}
                onClick={() => setSort('popular')}
              >
                인기순
              </button>
              <button
                className={`cm-sort-btn ${sort === 'latest' ? 'active' : ''}`}
                onClick={() => setSort('latest')}
              >
                최신순
              </button>
            </div>
            <div className="cm-sort-divider" />
          </div>

          {displayPosts.length === 0 ? (
            <div className="cm-empty">
              <IoChatbubbleOutline size={40} color="#CCD9BA" />
              <p className="cm-empty-text">아직 등록된 게시물이 없어요</p>
              <p className="cm-empty-sub">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            displayPosts.map((item) => (
              <PostCard
                key={item.id}
                item={item}
                keyword={keyword}
                isOwner={user?.nickname === item.nickname}
                onPress={() => navigate(`/community/${item.id}`)}
                onMenuPress={handleMenuPress}
              />
            ))
          )}
        </div>
      )}

      <button className="cm-fab" onClick={() => navigate('/community/write')}>
        <IoAdd size={30} color="#fff" />
      </button>

      {menuPostId !== null &&
        createPortal(
          <div className="cm-menu-backdrop" onClick={() => setMenuPostId(null)}>
            <div
              className="cm-dropdown"
              style={{ top: menuTop, right: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="cm-menu-item" onClick={handleDelete}>
                <TrashRedIcon w={13} h={15} />
                <span className="cm-menu-delete">삭제하기</span>
              </button>
              <div className="cm-menu-sep" />
              <button className="cm-menu-item" onClick={handleEdit}>
                <EditRedIcon w={16} h={16} />
                <span className="cm-menu-edit">수정하기</span>
              </button>
            </div>
          </div>,
          frame ?? document.body
        )}

      <TabBar />
    </div>
  );
}
