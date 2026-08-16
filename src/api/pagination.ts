export const PAGE_LIMIT = 100;
export const MAX_PAGES = 100;
export const MAX_ITEMS = 10_000;

export class PaginationGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaginationGuardError';
  }
}

type FetchPage<T> = (
  page: number,
  limit: number,
  signal?: AbortSignal,
) => Promise<readonly T[]>;

type FetchAllPagesOptions = {
  signal?: AbortSignal;
  limit?: number;
  maxPages?: number;
  maxItems?: number;
};

function fingerprint(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * 배열 기반 pagination API를 기존 화면이 기대하는 전체 배열로 변환한다.
 *
 * 동일 페이지 감지는 page/limit을 무시하는 구버전 서버와의 선배포 호환을
 * 위한 것이며, 항목 fingerprint 중복 제거로 겹치는 페이지도 안전하게 합친다.
 */
export async function fetchAllPages<T>(
  fetchPage: FetchPage<T>,
  options: FetchAllPagesOptions = {},
): Promise<T[]> {
  const {
    signal,
    limit = PAGE_LIMIT,
    maxPages = MAX_PAGES,
    maxItems = MAX_ITEMS,
  } = options;

  if (limit < 1 || maxPages < 1 || maxItems < 1) {
    throw new PaginationGuardError('Pagination guards must be positive.');
  }

  const results: T[] = [];
  const seenPages = new Set<string>();
  const seenItems = new Set<string>();

  for (let page = 1; page <= maxPages; page += 1) {
    const pageItems = await fetchPage(page, limit, signal);
    if (!Array.isArray(pageItems)) {
      throw new TypeError('Paginated API response must be an array.');
    }

    const pageFingerprint = fingerprint(pageItems);
    if (seenPages.has(pageFingerprint)) return results;
    seenPages.add(pageFingerprint);

    const uniqueItems: T[] = [];
    for (const item of pageItems) {
      const itemFingerprint = fingerprint(item);
      if (seenItems.has(itemFingerprint)) continue;
      seenItems.add(itemFingerprint);
      uniqueItems.push(item);
    }

    if (results.length + uniqueItems.length > maxItems) {
      throw new PaginationGuardError(`Pagination exceeded the ${maxItems} item guard.`);
    }
    results.push(...uniqueItems);

    // 구버전 서버가 limit을 무시하고 전체 배열을 한 번에 반환하는 경우.
    if (pageItems.length > limit) return results;
    if (pageItems.length < limit) return results;

    if (page === maxPages) {
      throw new PaginationGuardError(`Pagination exceeded the ${maxPages} page guard.`);
    }
  }

  return results;
}

/** 기존 filter/query를 보존하고 pagination 파라미터만 갱신한다. */
export function buildPaginatedPath(path: string, page: number, limit: number): string {
  const hashIndex = path.indexOf('#');
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf('?');
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const params = new URLSearchParams(queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '');

  params.set('page', String(page));
  params.set('limit', String(limit));

  return `${pathname}?${params.toString()}${hash}`;
}
