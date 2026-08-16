import assert from 'node:assert/strict';
import test from 'node:test';

import { flaggedWords, hasProfanity, profanityFieldsFromError, pruneStale, splitByMatches } from '../src/utils/profanity.ts';

// ApiError(src/api/client.ts)와 같은 모양. client.ts는 import.meta.env 를 써서 node 테스트에서 직접 불러오지 않는다.
class ApiError extends Error {
  constructor(public status: number, public body: unknown) { super('http'); }
}

test('splitByMatches: 금칙어 구간만 flagged 로 조각낸다', () => {
  const text = '이거 시-발 뭐야 ㅅㅂ';
  const segments = splitByMatches(text, [
    { word: '시-발', start: 3, end: 6 },
    { word: 'ㅅㅂ', start: 10, end: 12 },
  ]);
  assert.deepEqual(segments, [
    { text: '이거 ', flagged: false },
    { text: '시-발', flagged: true },
    { text: ' 뭐야 ', flagged: false },
    { text: 'ㅅㅂ', flagged: true },
  ]);
  assert.equal(segments.map((s) => s.text).join(''), text);
});

test('splitByMatches: 겹치거나 범위를 벗어난 구간도 원문을 잃지 않는다', () => {
  const text = '시발시발';
  const segments = splitByMatches(text, [
    { word: '시발', start: 0, end: 2 },
    { word: '발시', start: 1, end: 3 },
    { word: '?', start: 3, end: 99 },
  ]);
  assert.equal(segments.map((s) => s.text).join(''), text);
  assert.ok(segments.every((s) => s.flagged));
});

test('splitByMatches: 매치가 없으면 통째로 한 조각, 빈 문자열은 빈 배열', () => {
  assert.deepEqual(splitByMatches('안녕', []), [{ text: '안녕', flagged: false }]);
  assert.deepEqual(splitByMatches('', [{ word: 'x', start: 0, end: 1 }]), []);
});

test('flaggedWords: 중복 제거, 순서 유지', () => {
  assert.deepEqual(
    flaggedWords([
      { word: '시발', start: 0, end: 2 },
      { word: 'ㅅㅂ', start: 3, end: 5 },
      { word: '시발', start: 6, end: 8 },
    ]),
    ['시발', 'ㅅㅂ'],
  );
});

test('pruneStale: 원문과 어긋난 구간(입력이 바뀐 뒤)은 버린다', () => {
  const report = { title: [{ word: '시발', start: 0, end: 2 }], content: [{ word: 'ㅅㅂ', start: 3, end: 5 }] };
  assert.deepEqual(pruneStale(report, { title: '시발 제목', content: '정상 글' }), {
    title: [{ word: '시발', start: 0, end: 2 }],
  });
  assert.equal(hasProfanity(pruneStale(report, { title: '수정됨', content: '수정됨' })), false);
});

test('profanityFieldsFromError: 400 profanity_blocked 응답에서 필드를 꺼낸다', () => {
  const err = new ApiError(400, {
    message: '부적절한 표현이 포함되어 있어 등록할 수 없습니다.',
    code: 'profanity_blocked',
    fields: { content: [{ word: '시발', start: 0, end: 2 }] },
  });
  assert.deepEqual(profanityFieldsFromError(err), { content: [{ word: '시발', start: 0, end: 2 }] });
  assert.equal(profanityFieldsFromError(new ApiError(400, { message: '제목을 확인해주세요.' })), null);
  assert.equal(profanityFieldsFromError(new Error('network')), null);
});
