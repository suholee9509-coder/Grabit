import { describe, expect, it } from 'vitest';
import { highlightMatch } from './highlight';

/** 측정 2087:36708: 매칭부 흰(matched) + 비매칭부 디밍(#999999). 색만, 볼드/밑줄 ❌. */
describe('highlightMatch', () => {
  it('"개발자" + "개발" → 개발(매칭) + 자(디밍)', () => {
    expect(highlightMatch('개발자', '개발')).toEqual([
      { text: '개발', matched: true },
      { text: '자', matched: false },
    ]);
  });

  it('"클라우드 개발" + "개발" → 앞 디밍 + 개발 매칭', () => {
    expect(highlightMatch('클라우드 개발', '개발')).toEqual([
      { text: '클라우드 ', matched: false },
      { text: '개발', matched: true },
    ]);
  });

  it('중간 매칭 → 3분할(앞 디밍/매칭/뒤 디밍)', () => {
    expect(highlightMatch('백엔드 개발자', '개발')).toEqual([
      { text: '백엔드 ', matched: false },
      { text: '개발', matched: true },
      { text: '자', matched: false },
    ]);
  });

  it('매칭 없음 → 전체 디밍', () => {
    expect(highlightMatch('디자인', '개발')).toEqual([{ text: '디자인', matched: false }]);
  });

  it('빈 쿼리 → 전체 매칭(디밍 없음)', () => {
    expect(highlightMatch('개발자', '')).toEqual([{ text: '개발자', matched: true }]);
  });

  it('대소문자 무시', () => {
    expect(highlightMatch('AWS', 'aws')).toEqual([{ text: 'AWS', matched: true }]);
  });
});
