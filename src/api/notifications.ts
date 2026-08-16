import { api } from './client';
import { buildPaginatedPath, fetchAllPages } from './pagination';
import type { Notification } from './types';

export const notificationsApi = {
  list: (signal?: AbortSignal) =>
    fetchAllPages(
      (page, limit, pageSignal) =>
        api.get<Notification[]>(buildPaginatedPath('/notifications', page, limit), {
          signal: pageSignal,
        }),
      { signal },
    ),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  readAll: () => api.patch('/notifications/read-all'),
};
