import { api } from './client';
import type { QnAListItem, QnADetail, QnASearchItem, SearchResponse } from './types';

export const qnaApi = {
  list: () => api.get<QnAListItem[]>('/qna'),
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

  mine: () => api.get<any[]>('/qna/mine'),
  myAnswers: () => api.get<any[]>('/qna/my-answers'),
  myScraps: () => api.get<QnAListItem[]>('/qna/my-scraps'),
};
