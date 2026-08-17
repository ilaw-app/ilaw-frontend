import { useEffect, useState, type DependencyList } from 'react';

export type AsyncState<T> = {
  data: T | undefined;
  loading: boolean;
  error: unknown;
};

/**
 * 마운트(또는 deps 변경) 시 fetcher를 실행하고 loading·data·error를 관리한다.
 * 언마운트/deps 변경 시 이전 요청 결과는 무시(setState 방지)한다.
 *
 * 기존 라우트들이 반복하던
 *   let cancelled = false; fetch().then(...).finally(...); return () => { cancelled = true; }
 * 패턴을 한 곳으로 통합한다.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: undefined, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
