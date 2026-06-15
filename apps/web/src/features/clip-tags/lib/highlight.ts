/**
 * 자동완성 부분 강조 — 측정(2087:36708): 매칭부 #FAFAFA(흰) 유지 + 비매칭부 #999999 디밍.
 * ★ 네온/볼드/밑줄 아님 — 비매칭 디밍. 첫 매칭 위치 기준 3분할(앞 dim / 매칭 흰 / 뒤 dim).
 */
export interface HighlightSegment {
  text: string;
  /** true = 매칭(흰 #FAFAFA), false = 비매칭(디밍 #999999). */
  matched: boolean;
}

export function highlightMatch(label: string, query: string): HighlightSegment[] {
  const q = query.trim();
  if (q === '') return [{ text: label, matched: true }];

  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) {
    // 매칭 없음(부분 매칭 포함 안 됨) → 전부 디밍
    return [{ text: label, matched: false }];
  }

  const segments: HighlightSegment[] = [];
  if (idx > 0) segments.push({ text: label.slice(0, idx), matched: false });
  segments.push({ text: label.slice(idx, idx + q.length), matched: true });
  if (idx + q.length < label.length) {
    segments.push({ text: label.slice(idx + q.length), matched: false });
  }
  return segments;
}
