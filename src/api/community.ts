import { api } from './client';
import type { CommunityListItem, CommunityDetail, CommunityComment, SearchResponse } from './types';

export type CommunitySearchItem = {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  nickname: string;
  likes: number;
  bookmarks: number;
  comments: number;
};

export const communityApi = {
  list: (limit = 50) =>
    api.get<{ posts: CommunityListItem[]; total: number } | CommunityListItem[]>(`/community?limit=${limit}`),
  get: (id: number | string) => api.get<CommunityDetail>(`/community/${id}`),
  search: (q: string) =>
    api.get<SearchResponse<CommunitySearchItem>>(`/community/search?q=${encodeURIComponent(q)}`),

  create: (body: { title: string; content?: string; poll?: any; imageUrls?: string[] }) =>
    api.post<{ id: number }>('/community', body),
  update: (id: number | string, body: { title?: string; content?: string; poll?: any; imageUrls?: string[] }) =>
    api.put(`/community/${id}`, body),
  remove: (id: number | string) => api.del(`/community/${id}`),

  like: (id: number | string) => api.post<{ liked: boolean; count: number }>(`/community/${id}/like`),
  bookmark: (id: number | string) => api.post<{ bookmarked: boolean; count: number }>(`/community/${id}/bookmark`),
  vote: (id: number | string, optionIndex: number) => api.post<{ poll: any }>(`/community/${id}/vote`, { optionIndex }),

  comments: (id: number | string) => api.get<CommunityComment[]>(`/community/${id}/comments`),
  addComment: (id: number | string, content: string, parentId?: number) =>
    api.post<CommunityComment>(`/community/${id}/comments`, { content, parentId }),
  likeComment: (id: number | string, commentId: number) =>
    api.post<{ liked: boolean; count: number }>(`/community/${id}/comments/${commentId}/like`),
  removeComment: (id: number | string, commentId: number) =>
    api.del(`/community/${id}/comments/${commentId}`),
  myBookmarks: () => api.get<any[]>('/community/my-bookmarks'),
  myPosts: () => api.get<CommunityListItem[]>('/community/my-posts'),
  report: (id: number | string, reason?: string) =>
    api.post(`/community/${id}/report`, { reason }),
  reportComment: (id: number | string, commentId: number, reason?: string) =>
    api.post(`/community/${id}/comments/${commentId}/report`, { reason }),
};
