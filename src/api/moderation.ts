import { api } from './client';

// 서버 금칙어 필터가 돌려주는 원문(UTF-16 오프셋) 기준 구간. word === text.slice(start, end)
export type ProfanityMatch = { word: string; start: number; end: number };
export type ProfanityFields = Record<string, ProfanityMatch[]>;

export const moderationApi = {
  // 등록 시 적용되는 1차 금칙어 필터와 동일한 로직. 입력 중 디바운스로 호출해 미리 표시한다.
  check: (fields: Record<string, string>, signal?: AbortSignal) =>
    api.post<{ blocked: boolean; fields: ProfanityFields }>('/moderation/check', { fields }, { signal }),
};

export { profanityFieldsFromError } from '../utils/profanity';
