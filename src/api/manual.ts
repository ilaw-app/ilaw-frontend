import { api } from './client';
import { buildPaginatedPath, fetchAllPages } from './pagination';
import type {
  ManualCategory,
  ManualArticleSummary,
  ManualArticleDetail,
  Agency,
  SearchResponse,
} from './types';

export type ManualSearchItem = ManualArticleDetail;

const fetchAll = <T>(path: string, signal?: AbortSignal) =>
  fetchAllPages(
    (page, limit, pageSignal) =>
      api.get<T[]>(buildPaginatedPath(path, page, limit), { signal: pageSignal }),
    { signal },
  );

export const manualApi = {
  categories: () => api.get<ManualCategory[]>('/manual/categories'),
  articles: (slug: string, signal?: AbortSignal) =>
    fetchAll<ManualArticleSummary>(`/manual/categories/${slug}/articles`, signal),
  article: (id: number | string) => api.get<ManualArticleDetail>(`/manual/articles/${id}`),
  agencies: (slug: string, region?: string, signal?: AbortSignal) =>
    fetchAll<Agency>(
      `/manual/categories/${slug}/agencies${region ? `?region=${encodeURIComponent(region)}` : ''}`,
      signal,
    ),
  search: (q: string) =>
    api.get<SearchResponse<ManualSearchItem>>(`/manual/search?q=${encodeURIComponent(q)}`),

  getScrap: (id: number | string) => api.get<{ scrapped: boolean; count: number }>(`/manual/articles/${id}/scrap`),
  toggleScrap: (id: number | string) => api.post<{ scrapped: boolean }>(`/manual/articles/${id}/scrap`),
  myScraps: () => api.get<any[]>('/manual/my-scraps'),
};
