import { api } from './client';
import type { AiChatResult, AiChatHistoryItem } from './types';

export const aiApi = {
  // conversationId 는 서버가 멀티턴일 때만 돌려준다. 받은 값을 다음 요청에 실어 같은 대화를 이어 간다.
  chat: (message: string, conversationId?: string) =>
    api.post<AiChatResult>('/ai/chat', conversationId ? { message, conversationId } : { message }),
  history: () => api.get<AiChatHistoryItem[]>('/ai/history'),
};
