import { api } from './client';
import { buildPaginatedPath, fetchAllPages } from './pagination';
import type { QnAListItem, QnADetail, QnASearchItem, SearchResponse } from './types';

const fetchAll = <T>(path: string, signal?: AbortSignal) =>
  fetchAllPages(
    (page, limit, pageSignal) =>
      api.get<T[]>(buildPaginatedPath(path, page, limit), { signal: pageSignal }),
    { signal },
  );

export const qnaApi = {
  list: (signal?: AbortSignal) => fetchAll<QnAListItem>('/qna', signal),
  search: (q: string) =>
    api.get<SearchResponse<QnASearchItem>>(`/qna/search?q=${encodeURIComponent(q)}`),
  get: (id: number | string) => api.get<QnADetail>(`/qna/${id}`),

  getScrap: (id: number | string) => api.get<{ scrapped: boolean; count: number }>(`/qna/${id}/scrap`),
  toggleScrap: (id: number | string) => api.post<{ scrapped: boolean }>(`/qna/${id}/scrap`),

  create: (body: { title: string; content: string; category: string; imageUrls?: string[] }) =>
    api.post('/qna', body),
  answer: (id: number | string, content: string) => api.post(`/qna/${id}/answer`, { content }),
  editAnswer: (id: number | string, content: string) => api.patch(`/qna/${id}/answer`, { content }),
  remove: (id: number | string) => api.del(`/qna/${id}`),

  mine: (signal?: AbortSignal) => fetchAll<any>('/qna/mine', signal),
  myAnswers: (signal?: AbortSignal) => fetchAll<any>('/qna/my-answers', signal),
  myScraps: () => api.get<QnAListItem[]>('/qna/my-scraps'),
};
