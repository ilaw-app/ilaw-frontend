import { useCallback, useEffect, useRef, useState } from 'react';
import { moderationApi, profanityFieldsFromError, type ProfanityFields } from '../api/moderation';
import { hasProfanity, pruneStale } from '../utils/profanity';

const DEBOUNCE_MS = 400;

/**
 * 입력값을 디바운스해 서버 금칙어 검사(/moderation/check)에 보내고 필드별 구간을 돌려준다.
 * 사전 로직은 서버 한 곳에만 두어 실제 등록 차단과 항상 같은 결과가 나온다.
 * - report  : { title: [{word,start,end}], content: [...] } — 걸린 필드만
 * - blocked : 하나라도 걸리면 true (등록 버튼 비활성화용)
 * - applyError(err): 등록 API가 400(profanity_blocked)으로 거부했을 때 그 결과를 즉시 반영. 반영했으면 true.
 */
export function useProfanityCheck(values: Record<string, string>) {
  const [report, setReport] = useState<ProfanityFields>({});
  const seq = useRef(0);
  const latest = useRef(values);
  latest.current = values;

  const key = JSON.stringify(values);

  useEffect(() => {
    const current = latest.current;
    const nonEmpty = Object.fromEntries(Object.entries(current).filter(([, v]) => v.trim().length > 0));
    // 서버 응답을 기다리는 동안에도, 이미 표시된 구간 중 원문과 어긋난 것은 즉시 지운다.
    setReport((prev) => pruneStale(prev, current));
    if (Object.keys(nonEmpty).length === 0) {
      setReport({});
      return;
    }
    const mySeq = ++seq.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await moderationApi.check(nonEmpty, controller.signal);
        if (mySeq !== seq.current) return; // 더 최신 요청이 있음
        setReport(pruneStale(res.fields ?? {}, latest.current));
      } catch {
        // 네트워크/한도 초과 시엔 미리보기만 못할 뿐, 서버가 등록 시점에 다시 막는다.
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  const applyError = useCallback((err: unknown): boolean => {
    const fields = profanityFieldsFromError(err);
    if (!fields) return false;
    seq.current += 1; // 진행 중인 미리보기 응답이 서버 판정을 덮어쓰지 않게
    setReport(pruneStale(fields, latest.current));
    return true;
  }, []);

  return { report, blocked: hasProfanity(report), applyError };
}
