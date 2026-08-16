import type { ProfanityFields, ProfanityMatch } from '../api/moderation';

export type TextSegment = { text: string; flagged: boolean };

// 원문을 금칙어 구간 기준으로 조각낸다. 하이라이트 렌더링용. 구간이 겹치거나 범위를 벗어나도 안전하다.
export function splitByMatches(text: string, matches: ProfanityMatch[] | undefined): TextSegment[] {
  if (!text) return [];
  const sorted = (matches ?? [])
    .map((m) => ({ start: Math.max(0, m.start), end: Math.min(text.length, m.end) }))
    .filter((m) => m.end > m.start)
    .sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const m of sorted) {
    if (m.start < cursor) {
      if (m.end <= cursor) continue;
      m.start = cursor;
    }
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start), flagged: false });
    segments.push({ text: text.slice(m.start, m.end), flagged: true });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), flagged: false });
  return segments;
}

// 안내문에 보여줄 표현 목록 (중복 제거, 순서 유지).
export function flaggedWords(matches: ProfanityMatch[] | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches ?? []) {
    const w = m.word.trim();
    if (w && !seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
  }
  return out;
}

export function hasProfanity(fields: ProfanityFields | null | undefined): boolean {
  return !!fields && Object.values(fields).some((list) => list.length > 0);
}

// 서버가 돌려준 구간이 현재 입력값과 어긋나면(사용자가 그 사이 수정) 버린다.
export function pruneStale(fields: ProfanityFields, values: Record<string, string>): ProfanityFields {
  const out: ProfanityFields = {};
  for (const [key, list] of Object.entries(fields)) {
    const value = values[key] ?? '';
    const valid = list.filter((m) => value.slice(m.start, m.end) === m.word);
    if (valid.length > 0) out[key] = valid;
  }
  return out;
}

// 등록/수정 API가 400 + code=profanity_blocked 로 거부했을 때(ApiError) 필드별 구간을 꺼낸다. 아니면 null.
export function profanityFieldsFromError(err: unknown): ProfanityFields | null {
  if (!err || typeof err !== 'object') return null;
  const body = (err as { body?: unknown }).body as { code?: unknown; fields?: unknown } | null | undefined;
  if (!body || typeof body !== 'object' || body.code !== 'profanity_blocked') return null;
  if (!body.fields || typeof body.fields !== 'object' || Array.isArray(body.fields)) return null;
  return body.fields as ProfanityFields;
}
