import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PaginationGuardError,
  buildPaginatedPath,
  fetchAllPages,
} from '../src/api/pagination.ts';

const items = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: start + index }));

test('빈 첫 페이지는 한 번만 요청하고 빈 배열을 반환한다', async () => {
  const pages: number[] = [];

  const result = await fetchAllPages(async (page) => {
    pages.push(page);
    return [];
  });

  assert.deepEqual(result, []);
  assert.deepEqual(pages, [1]);
});

test('정확히 100개인 페이지 뒤의 빈 페이지까지 확인한다', async () => {
  const pages: number[] = [];

  const result = await fetchAllPages(async (page) => {
    pages.push(page);
    return page === 1 ? items(1, 100) : [];
  });

  assert.deepEqual(result, items(1, 100));
  assert.deepEqual(pages, [1, 2]);
});

test('101개 결과를 페이지 순서대로 합친다', async () => {
  const pages: number[] = [];

  const result = await fetchAllPages(async (page) => {
    pages.push(page);
    if (page === 1) return items(1, 100);
    if (page === 2) return items(101, 1);
    return [];
  });

  assert.deepEqual(result, items(1, 101));
  assert.deepEqual(pages, [1, 2]);
});

test('중간 페이지 오류를 부분 결과로 숨기지 않고 전달한다', async () => {
  const expected = new Error('두 번째 페이지 실패');

  await assert.rejects(
    fetchAllPages(async (page) => {
      if (page === 1) return items(1, 100);
      throw expected;
    }),
    (error) => error === expected,
  );
});

test('구버전 서버가 같은 100개를 반복하면 중복 없이 종료한다', async () => {
  let calls = 0;
  const legacyResponse = items(1, 100);

  const result = await fetchAllPages(async () => {
    calls += 1;
    return legacyResponse;
  });

  assert.deepEqual(result, legacyResponse);
  assert.equal(calls, 2);
});

test('구버전 서버가 limit보다 큰 전체 배열을 반환하면 첫 페이지에서 종료한다', async () => {
  let calls = 0;
  const legacyResponse = items(1, 101);

  const result = await fetchAllPages(async () => {
    calls += 1;
    return legacyResponse;
  });

  assert.deepEqual(result, legacyResponse);
  assert.equal(calls, 1);
});

test('서로 다른 가득 찬 페이지가 계속되면 최대 페이지 guard가 중단한다', async () => {
  await assert.rejects(
    fetchAllPages(
      async (page) => items((page - 1) * 100 + 1, 100),
      { maxPages: 2, maxItems: 1_000 },
    ),
    PaginationGuardError,
  );
});

test('총 항목 guard를 넘으면 중단한다', async () => {
  await assert.rejects(
    fetchAllPages(
      async (page) => items((page - 1) * 100 + 1, 100),
      { maxPages: 10, maxItems: 150 },
    ),
    PaginationGuardError,
  );
});

test('기존 Q&A filter/query를 모든 페이지에 유지한다', async () => {
  const paths: string[] = [];
  const basePath = '/qna?status=pending&q=%ED%95%99%EA%B5%90';

  await fetchAllPages(async (page, limit) => {
    paths.push(buildPaginatedPath(basePath, page, limit));
    return page === 1 ? items(1, 100) : [];
  });

  assert.deepEqual(paths, [
    '/qna?status=pending&q=%ED%95%99%EA%B5%90&page=1&limit=100',
    '/qna?status=pending&q=%ED%95%99%EA%B5%90&page=2&limit=100',
  ]);
});

test('AbortSignal을 각 페이지 요청에 전달한다', async () => {
  const controller = new AbortController();
  const receivedSignals: Array<AbortSignal | undefined> = [];

  await fetchAllPages(
    async (_page, _limit, signal) => {
      receivedSignals.push(signal);
      return [];
    },
    { signal: controller.signal },
  );

  assert.deepEqual(receivedSignals, [controller.signal]);
});
