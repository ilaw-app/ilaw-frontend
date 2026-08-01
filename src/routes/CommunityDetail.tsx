import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IoChevronBack,
  IoEllipsisVertical,
  IoChatbubbleOutline,
  IoBookmark,
  IoBookmarkOutline,
} from 'react-icons/io5';
import { communityApi } from '../api/community';
import type { CommunityComment, CommunityDetail } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { Overlay } from '../components/Overlay';
import { TrashRedIcon, EditRedIcon, TrashSheetIcon } from '../components/PostMenuIcons';
import TabBar from '../components/TabBar';
import './communityDetail.css';

/* ── 커스텀 SVG 아이콘 (원본 verbatim) ────────────────────────── */
function ThumbsUpIcon({ filled = false, size = 19 }: { filled?: boolean; size?: number }) {
  const color = filled ? '#3C6802' : '#6A7282';
  return (
    <svg width={size} height={size} viewBox="0 0 19 19" fill="none">
      <path
        d="M11.6614 4.06485L10.8284 7.49661H15.6845C15.9431 7.49661 16.1982 7.55682 16.4295 7.67248C16.6608 7.78814 16.8621 7.95607 17.0172 8.16297C17.1724 8.36987 17.2773 8.61005 17.3235 8.8645C17.3698 9.11895 17.3562 9.38068 17.2838 9.62896L15.343 16.2926C15.2421 16.6386 15.0316 16.9426 14.7433 17.1588C14.4549 17.3751 14.1042 17.492 13.7437 17.492H2.49891C2.05708 17.492 1.63336 17.3165 1.32094 17.0041C1.00852 16.6917 0.833008 16.2679 0.833008 15.8261V9.16251C0.833008 8.72068 1.00852 8.29696 1.32094 7.98454C1.63336 7.67212 2.05708 7.49661 2.49891 7.49661H4.79785C5.10778 7.49644 5.41151 7.40982 5.67491 7.24649C5.9383 7.08316 6.15091 6.84958 6.28883 6.57203L9.16251 0.833008C9.55531 0.837872 9.94193 0.931437 10.2935 1.10671C10.6451 1.28199 10.9525 1.53444 11.1927 1.84521C11.433 2.15598 11.6 2.51703 11.6811 2.90139C11.7623 3.28575 11.7555 3.68348 11.6614 4.06485Z"
        stroke={color}
        strokeWidth="1.6659"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <path d="M11.0002 11.9167C11.5066 11.9167 11.9171 11.5062 11.9171 10.9999C11.9171 10.4935 11.5066 10.083 11.0002 10.083C10.4939 10.083 10.0834 10.4935 10.0834 10.9999C10.0834 11.5062 10.4939 11.9167 11.0002 11.9167Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.0002 5.50068C11.5066 5.50068 11.9171 5.0902 11.9171 4.58384C11.9171 4.07748 11.5066 3.66699 11.0002 3.66699C10.4939 3.66699 10.0834 4.07748 10.0834 4.58384C10.0834 5.0902 10.4939 5.50068 11.0002 5.50068Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.0002 18.3337C11.5066 18.3337 11.9171 17.9232 11.9171 17.4168C11.9171 16.9105 11.5066 16.5 11.0002 16.5C10.4939 16.5 10.0834 16.9105 10.0834 17.4168C10.0834 17.9232 10.4939 18.3337 11.0002 18.3337Z" stroke="#586144" strokeWidth="1.99961" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <path d="M12.1077 18.0636C12.1394 18.1425 12.1944 18.2098 12.2654 18.2565C12.3364 18.3032 12.4199 18.327 12.5049 18.3248C12.5898 18.3227 12.6721 18.2946 12.7406 18.2443C12.8091 18.194 12.8606 18.124 12.8882 18.0436L18.3024 2.21756C18.329 2.14375 18.3341 2.06388 18.317 1.98729C18.3 1.9107 18.2614 1.84056 18.2059 1.78507C18.1504 1.72958 18.0803 1.69104 18.0037 1.67397C17.9271 1.65689 17.8472 1.66197 17.7734 1.68863L1.94739 7.10281C1.86701 7.13037 1.79698 7.18187 1.74671 7.25038C1.69644 7.3189 1.66833 7.40115 1.66615 7.4861C1.66398 7.57105 1.68784 7.65463 1.73454 7.72563C1.78124 7.79662 1.84853 7.85164 1.9274 7.88328L8.53269 10.5321C8.7415 10.6157 8.93122 10.7407 9.09041 10.8996C9.2496 11.0585 9.37496 11.248 9.45893 11.4566L12.1077 18.0636Z" stroke="white" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.2033 1.78809L9.09082 10.8997" stroke="white" strokeWidth="1.6659" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <path d="M1.99963 2V12.6646C1.99963 13.0182 2.14008 13.3572 2.39008 13.6072C2.64008 13.8572 2.97916 13.9977 3.33271 13.9977H13.9973" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.9977 11.3313V5.99902" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.66498 11.3315V3.33301" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33228 11.3307V9.33105" stroke="#99A1AF" strokeWidth="1.33308" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 타입 & 헬퍼 ─────────────────────────────────────────────── */
type PollOption = { label: string; votes: number };
type PollT = { options: PollOption[]; total: number; votedOptionIndex: number | null };
type Comment = {
  id: number;
  nickname: string;
  date: string;
  text: string;
  likes: number;
  liked: boolean;
  isAuthor: boolean;
  isPostAuthor?: boolean;
  parentId?: number | null;
  replies?: Comment[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${min}`;
}

function mapComment(c: CommunityComment): Comment {
  return {
    id: c.id,
    nickname: c.nickname,
    date: formatDate(c.createdAt),
    text: c.content,
    likes: c.likes ?? 0,
    liked: !!c.liked,
    isAuthor: !!c.isAuthor,
    isPostAuthor: !!c.isPostAuthor,
    parentId: c.parentId ?? null,
    replies: (c.replies ?? []).map(mapComment),
  };
}

function mapPoll(poll: any): PollT | undefined {
  if (!poll?.options) return undefined;
  const options = poll.options as PollOption[];
  return {
    options,
    total: typeof poll.total === 'number' ? poll.total : options.reduce((s, o) => s + o.votes, 0),
    votedOptionIndex: typeof poll.votedOptionIndex === 'number' ? poll.votedOptionIndex : null,
  };
}

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/Container.png"
      alt=""
      className="cd-avatar"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

/* ── PollBar ─────────────────────────────────────────────────── */
function PollBar({ option, total, selected, onVote }: { option: PollOption; total: number; selected: boolean; onVote: () => void }) {
  const pct = total > 0 ? Math.round((option.votes / total) * 100) : 0;
  return (
    <button type="button" className="cd-poll-row" onClick={onVote}>
      <div className="cd-poll-bar-bg">
        <div className={`cd-poll-bar-fill${selected ? ' selected' : ''}`} style={{ width: `${pct}%` }} />
        <span className="cd-poll-bar-label">{option.label}</span>
      </div>
      <span className="cd-poll-pct">{pct}%</span>
    </button>
  );
}

/* ── ReplyItem ───────────────────────────────────────────────── */
function ReplyItem({ reply, onDelete, onLike }: { reply: Comment; onDelete: (id: number) => void; onLike: (id: number) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOP = !!reply.isPostAuthor;
  return (
    <div className="cd-reply-row">
      <Avatar size={28} />
      <div style={{ flex: 1 }}>
        <div className="cd-comment-meta">
          <div className="cd-comment-name-group">
            <span className={isOP ? 'cd-author-nickname' : 'cd-reply-nickname'}>{reply.nickname}</span>
            <span className="cd-reply-date">{reply.date}</span>
          </div>
          {reply.isAuthor && (
            <div className="cd-menu-anchor">
              <button type="button" className="cd-dots-btn" onClick={() => setShowMenu((v) => !v)}>
                <DotsIcon />
              </button>
              {showMenu && (
                <div className="cd-mini-dropdown">
                  <button type="button" className="cd-mini-dropdown-item" onClick={() => { setShowMenu(false); onDelete(reply.id); }}>
                    <TrashRedIcon w={12} h={14} />
                    <span className="cd-mini-dropdown-text">삭제하기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="cd-comment-text">{reply.text}</p>
        <button type="button" className="cd-comment-like" onClick={() => onLike(reply.id)}>
          <ThumbsUpIcon filled={reply.liked} size={13} />
          <span className="cd-reply-meta" style={reply.liked ? { color: '#3C6802' } : undefined}>{reply.likes}</span>
        </button>
      </div>
    </div>
  );
}

/* ── CommentItem ─────────────────────────────────────────────── */
function CommentItem({ comment, onReply, onDelete, onLike }: { comment: Comment; onReply: (id: number) => void; onDelete: (id: number) => void; onLike: (id: number) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const isOP = !!comment.isPostAuthor;
  return (
    <div>
      <div className="cd-comment-row">
        <Avatar size={32} />
        <div style={{ flex: 1 }}>
          <div className="cd-comment-meta">
            <div className="cd-comment-name-group">
              <span className={isOP ? 'cd-author-nickname' : 'cd-comment-nickname'}>{comment.nickname}</span>
              <span className="cd-reply-date">{comment.date}</span>
            </div>
            {comment.isAuthor && (
              <div className="cd-menu-anchor">
                <button type="button" className="cd-dots-btn" onClick={() => setShowMenu((v) => !v)}>
                  <DotsIcon />
                </button>
                {showMenu && (
                  <div className="cd-mini-dropdown">
                    <button type="button" className="cd-mini-dropdown-item" onClick={() => { setShowMenu(false); onDelete(comment.id); }}>
                      <TrashRedIcon w={12} h={14} />
                      <span className="cd-mini-dropdown-text">삭제하기</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="cd-comment-text">{comment.text}</p>
          <div className="cd-comment-actions">
            <button type="button" className="cd-comment-like" onClick={() => onLike(comment.id)}>
              <ThumbsUpIcon filled={comment.liked} size={13} />
              <span className="cd-reply-meta" style={comment.liked ? { color: '#3C6802' } : undefined}>{comment.likes}</span>
            </button>
            <button type="button" className="cd-reply-btn" onClick={() => onReply(comment.id)}>답글</button>
          </div>
        </div>
      </div>
      {(comment.replies ?? []).map((reply) => (
        <ReplyItem key={reply.id} reply={reply} onDelete={onDelete} onLike={onLike} />
      ))}
    </div>
  );
}

/* ── 화면 ────────────────────────────────────────────────────── */
export default function CommunityDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = id!;
  const { isAuthed } = useAuth();

  const [post, setPost] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrapCount, setScrapCount] = useState(0);
  const [poll, setPoll] = useState<PollT | null>(null);
  const [votedIdx, setVotedIdx] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    communityApi
      .get(postId)
      .then((data) => {
        if (cancelled || !data) return;
        const p = mapPoll(data.poll) ?? null;
        setPost({
          ...data,
          bookmarks: data.bookmarks ?? 0,
          bookmarked: data.bookmarked ?? false,
          imageUrls: data.imageUrls ?? [],
        });
        setLiked(data.liked ?? false);
        setLikeCount(data.likes ?? 0);
        setBookmarked(data.bookmarked ?? false);
        setScrapCount(data.bookmarks ?? 0);
        setPoll(p);
        setVotedIdx(p?.votedOptionIndex ?? null);
        setComments((data.comments ?? []).map(mapComment).reverse());
      })
      .catch(() => { if (!cancelled) setPost(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [postId]);

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
  const pollOptions = poll?.options ?? [];
  const pollTotal = poll?.total ?? 0;

  const updateComment = (
    items: Comment[],
    commentId: number,
    updater: (comment: Comment) => Comment,
  ): Comment[] =>
    items.map((comment) => {
      if (comment.id === commentId) return updater(comment);
      return { ...comment, replies: updateComment(comment.replies ?? [], commentId, updater) };
    });

  const handleLike = async () => {
    if (!isAuthed) { window.alert('로그인 후 이용해주세요.'); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      const data = await communityApi.like(postId);
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch {
      setLiked(!newLiked);
      setLikeCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  const handleBookmark = async () => {
    if (!isAuthed) { window.alert('로그인 후 이용해주세요.'); return; }
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setScrapCount((c) => Math.max(0, newBookmarked ? c + 1 : c - 1));
    try {
      const data = await communityApi.bookmark(postId);
      setBookmarked(data.bookmarked);
      setScrapCount(data.count);
    } catch {
      setBookmarked(!newBookmarked);
      setScrapCount((c) => Math.max(0, newBookmarked ? c - 1 : c + 1));
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (!isAuthed) { window.alert('로그인 후 투표할 수 있습니다.'); return; }
    try {
      const data = await communityApi.vote(postId, optionIndex);
      const p = mapPoll(data.poll);
      if (p) {
        setPoll(p);
        setVotedIdx(p.votedOptionIndex);
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : '투표에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      await communityApi.remove(postId);
      navigate('/community', { replace: true });
    } catch {
      window.alert('삭제에 실패했습니다.');
    }
  };

  const handleSend = async () => {
    if (!commentText.trim()) return;
    if (!isAuthed) { window.alert('로그인 후 댓글을 작성할 수 있습니다.'); return; }
    const text = commentText.trim();
    setCommentText('');
    try {
      const data = await communityApi.addComment(postId, text, replyingTo ?? undefined);
      const newComment = mapComment(data);
      setComments((prev) => {
        if (newComment.parentId) {
          return prev.map((comment) =>
            comment.id === newComment.parentId
              ? { ...comment, replies: [...(comment.replies ?? []), newComment] }
              : comment,
          );
        }
        return [...prev, newComment];
      });
    } catch {
      /* noop */
    }
    setReplyingTo(null);
  };

  const handleCommentLike = async (commentId: number) => {
    if (!isAuthed) { window.alert('로그인 후 이용해주세요.'); return; }
    let nextLiked = false;
    setComments((prev) =>
      updateComment(prev, commentId, (comment) => {
        nextLiked = !comment.liked;
        return { ...comment, liked: nextLiked, likes: Math.max(0, comment.likes + (nextLiked ? 1 : -1)) };
      }),
    );
    try {
      const data = await communityApi.likeComment(postId, commentId);
      setComments((prev) => updateComment(prev, commentId, (comment) => ({
        ...comment,
        liked: data.liked,
        likes: data.count,
      })));
    } catch {
      setComments((prev) => updateComment(prev, commentId, (comment) => ({
        ...comment,
        liked: !nextLiked,
        likes: Math.max(0, comment.likes + (nextLiked ? -1 : 1)),
      })));
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setDeletingCommentId(commentId);
    setShowCommentDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId) return;
    const commentId = deletingCommentId;
    setShowCommentDeleteModal(false);
    setDeletingCommentId(null);
    try {
      await communityApi.removeComment(postId, commentId);
    } catch {
      window.alert('댓글 삭제에 실패했습니다.');
      return;
    }
    setComments((prev) =>
      prev
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
          ...comment,
          replies: (comment.replies ?? []).filter((reply) => reply.id !== commentId),
        })),
    );
    if (replyingTo === commentId) setReplyingTo(null);
  };

  const goEdit = () => {
    if (!post) return;
    setShowMenu(false);
    const qs = new URLSearchParams({
      editId: String(post.id),
      editTitle: post.title,
      editContent: post.content ?? '',
      editImageUrls: JSON.stringify(post.imageUrls ?? []),
      editPoll: poll ? JSON.stringify(poll.options) : '',
    });
    navigate(`/community/write?${qs.toString()}`);
  };

  if (loading) {
    return (
      <div className="cd-screen">
        <div className="cd-header">
          <button type="button" className="cd-back-btn" onClick={() => navigate(-1)}>
            <IoChevronBack size={22} color="#586144" />
          </button>
        </div>
        <div className="cd-loading" />
        <TabBar />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="cd-screen">
        <div className="cd-header">
          <button type="button" className="cd-back-btn" onClick={() => navigate(-1)}>
            <IoChevronBack size={22} color="#586144" />
          </button>
        </div>
        <p className="cd-empty">게시글을 찾을 수 없습니다.</p>
        <TabBar />
      </div>
    );
  }

  return (
    <div className="cd-screen">
      {/* Header */}
      <div className="cd-header">
        <button type="button" className="cd-back-btn" onClick={() => navigate(-1)}>
          <IoChevronBack size={22} color="#586144" />
        </button>
        {post.isAuthor && (
          <button type="button" className="cd-menu-btn" onClick={() => setShowMenu((v) => !v)}>
            <IoEllipsisVertical size={20} color="#586144" />
          </button>
        )}
      </div>

      {/* 삭제/수정 메뉴 */}
      <Overlay visible={!!post.isAuthor && showMenu} onClose={() => setShowMenu(false)}>
        <div className="cd-dropdown">
          <button type="button" className="cd-dropdown-item" onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}>
            <TrashRedIcon w={12} h={14} />
            <span className="cd-dropdown-text">삭제하기</span>
          </button>
          <div className="cd-dropdown-divider" />
          <button type="button" className="cd-dropdown-item" onClick={goEdit}>
            <EditRedIcon w={15} h={15} />
            <span className="cd-dropdown-text">수정하기</span>
          </button>
        </div>
      </Overlay>

      {/* Scroll */}
      <div className="cd-scroll">
        {/* Author */}
        <div className="cd-author-row">
          <Avatar size={36} />
          <div>
            <div className="cd-nickname">{post.nickname}</div>
            <div className="cd-date">
              {formatDate(post.createdAt)}
              {post.updatedAt && new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000 ? ' (수정됨)' : ''}
            </div>
          </div>
        </div>

        <h1 className="cd-title">{post.title}</h1>
        {post.content ? <p className="cd-content">{post.content}</p> : null}

        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="cd-image-row">
            {post.imageUrls.map((url, i) => (
              <button type="button" key={i} className="cd-image-thumb-btn" onClick={() => setSelectedImage(url)}>
                <img src={url} alt="" className="cd-image-thumb" />
              </button>
            ))}
          </div>
        )}

        {/* Poll */}
        {poll && (
          <div className="cd-poll">
            {pollOptions.map((opt, i) => (
              <PollBar key={opt.label} option={opt} total={pollTotal} selected={votedIdx === i} onVote={() => handleVote(i)} />
            ))}
            <div className="cd-poll-footer">
              <BarChartIcon />
              <span className="cd-poll-total">{pollTotal}명 참여</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="cd-actions">
          <div className="cd-actions-left">
            <button type="button" className="cd-action-btn" onClick={handleLike}>
              <ThumbsUpIcon filled={liked} size={18} />
              <span className="cd-action-text" style={liked ? { color: '#3C6802' } : undefined}>{likeCount}</span>
            </button>
            <button type="button" className="cd-action-btn">
              <IoChatbubbleOutline size={18} color="#6A7282" />
              <span className="cd-action-text">{totalComments}</span>
            </button>
          </div>
          <button type="button" className="cd-action-btn" onClick={handleBookmark}>
            {bookmarked ? <IoBookmark size={18} color="#6A7282" /> : <IoBookmarkOutline size={18} color="#6A7282" />}
            <span className="cd-action-text" style={bookmarked ? { color: '#3C6802' } : undefined}>{scrapCount}</span>
          </button>
        </div>

        <div className="cd-thick-divider" />

        <div className="cd-comments-header">댓글 {totalComments}</div>

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(cid) => setReplyingTo(replyingTo === cid ? null : cid)}
            onDelete={handleDeleteComment}
            onLike={handleCommentLike}
          />
        ))}
      </div>

      {/* 이미지 전체보기 */}
      <Overlay visible={!!selectedImage} onClose={() => setSelectedImage(null)} dim={0.92}>
        <img src={selectedImage ?? ''} alt="" className="cd-modal-image" />
      </Overlay>

      {/* 게시글 삭제 확인 (QnA와 동일한 바텀시트) */}
      <Overlay visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} align="bottom">
        <div className="cd-sheet">
          <div className="cd-sheet-icon">
            <TrashSheetIcon size={28} />
          </div>
          <div className="cd-sheet-title">글을 삭제할까요?</div>
          <p className="cd-sheet-desc">삭제한 글은 복구할 수 없어요.</p>
          <div className="cd-sheet-btns">
            <button type="button" className="cd-sheet-btn danger" onClick={() => { setShowDeleteModal(false); handleDelete(); }}>
              삭제하기
            </button>
            <button type="button" className="cd-sheet-btn cancel" onClick={() => setShowDeleteModal(false)}>
              취소
            </button>
          </div>
        </div>
      </Overlay>

      {/* 댓글 삭제 확인 (동일 바텀시트) */}
      <Overlay visible={showCommentDeleteModal} onClose={() => setShowCommentDeleteModal(false)} align="bottom">
        <div className="cd-sheet">
          <div className="cd-sheet-icon">
            <TrashSheetIcon size={28} />
          </div>
          <div className="cd-sheet-title">댓글을 삭제할까요?</div>
          <p className="cd-sheet-desc">삭제한 댓글은 복구할 수 없어요.</p>
          <div className="cd-sheet-btns">
            <button type="button" className="cd-sheet-btn danger" onClick={confirmDeleteComment}>
              삭제하기
            </button>
            <button type="button" className="cd-sheet-btn cancel" onClick={() => setShowCommentDeleteModal(false)}>
              취소
            </button>
          </div>
        </div>
      </Overlay>

      {/* Comment Input */}
      <div className="cd-input-bar">
        {replyingTo !== null && (
          <div className="cd-replying-banner">
            <span className="cd-replying-text">
              {(comments.find((c) => c.id === replyingTo)?.nickname ?? '댓글')}님에게 답글 작성 중
            </span>
            <button type="button" className="cd-cancel-btn" onClick={() => setReplyingTo(null)}>취소</button>
          </div>
        )}
        <div className="cd-input-row">
          <input
            className="cd-input"
            placeholder="댓글을 입력하세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend(); } }}
          />
          <button
            type="button"
            className={`cd-send-btn${commentText.trim().length > 0 ? ' active' : ''}`}
            onClick={handleSend}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
