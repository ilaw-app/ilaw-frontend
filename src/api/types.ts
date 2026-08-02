// iLaw 백엔드 응답 타입 (backend 스펙 기반)

export type Role = 'user' | 'lawyer';
export type Gender = 'male' | 'female' | 'other';
export type QnAStatus = 'pending' | 'answered';

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  profileCompleted?: boolean;
};

export type User = {
  id: string;
  email: string | null;
  nickname: string | null;
  region: string | null;
  birthDate: string | null; // ISO datetime
  gender: Gender | null;
  provider: string;
  profileCompleted: boolean;
  role: Role;
  affiliation: string | null;
  agreedMarketing: boolean;
  createdAt: string;
};

// ---- QnA ----
export type QnAAuthorPublic = { nickname: string }; // 항상 '익명'
// DB role이 lawyer인 사용자에게만 age/region/gender가 추가로 옴 (그 외엔 nickname만)
export type QnAAuthorDetail = {
  nickname: string;
  age?: number | null;
  region?: string | null;
  gender?: string | null;
};

export type QnAListItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: QnAStatus;
  createdAt: string;
  author: QnAAuthorPublic;
  scrapCount: number;
  scrapped?: boolean;
  imageUrls?: string[]; // 리스트 API엔 없어 상세로 보강 (백엔드가 추가하면 바로 사용)
};

export type QnAAnswer = {
  id: number;
  postId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  lawyer: { nickname: string | null; role: string; affiliation: string | null } | null;
  isMyAnswer: boolean;
};

export type QnADetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: QnAStatus;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  author: QnAAuthorDetail | null;
  answer: QnAAnswer | null;
  isAuthor: boolean;
};

export type QnASearchItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: QnAStatus;
  createdAt: string;
  author: QnAAuthorPublic;
  answer: { content: string } | null;
};

// ---- Community ----
export type Poll = {
  options: { label: string; votes: number }[];
  total: number;
  votedOptionIndex: number | null;
};

export type CommunityListItem = {
  id: number;
  nickname: string; // '익명'
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string | null;
  imageUrls: string[];
  likes: number;
  bookmarks: number;
  comments: number;
  poll: Poll | null;
};

export type CommunityComment = {
  id: number;
  nickname: string;
  createdAt: string;
  content: string;
  likes: number;
  liked: boolean;
  parentId: number | null;
  isAuthor: boolean;
  isPostAuthor: boolean;
  replies: CommunityComment[];
};

export type CommunityDetail = {
  id: number;
  nickname: string;
  isAuthor: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  imageUrls: string[];
  likes: number;
  liked: boolean;
  bookmarks: number;
  bookmarked: boolean;
  poll: Poll | null;
  comments: CommunityComment[];
};

// ---- Manual ----
export type ManualCategory = { id: number; name: string; slug: string; order: number };
export type ManualArticleSummary = { id: number; question: string; summary: string | null; order: number };
export type ManualArticleDetail = {
  id: number;
  categoryId: number;
  question: string;
  summary: string | null;
  content: string; // HTML
  order: number;
  category: { name: string; slug: string };
};
export type Agency = { id: number; region: string; name: string; role: string; contact: string };

// ---- Notifications ----
export type Notification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  refId: number | null;
  createdAt: string;
};

// ---- AI chat ----
export type AiSuggestion = { type: 'manual' | 'qa'; id: number; label: string };
export type AiChatResult = {
  status: 'relevant' | 'unrelated';
  situationSummary: string;
  legalAdvice: string;
  suggestions: AiSuggestion[];
  chatEnded: boolean;
};
export type AiChatHistoryItem = {
  id: number;
  question: string;
  situationSummary: string;
  legalAdvice: string;
  suggestions: AiSuggestion[];
  createdAt: string;
};

// ---- Home ----
export type PopularItem = {
  type: 'manual' | 'qna' | 'community';
  id: number;
  label: string;
  category: string;
  scrapCount: number;
};

// ---- Search wrappers ----
export type SearchResponse<T> = { results: T[]; expandedTerms: string[] };
