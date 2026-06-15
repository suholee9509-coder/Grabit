/**
 * content 메타 표시 포맷터(순수). 측정: 업로드일 "2025.03.17" · "그랩 16개".
 * ISO/Date 문자열 → "YYYY.MM.DD". 파싱 불가/빈값이면 원문 또는 null.
 */
export function formatUploadDate(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim();
  if (v === '') return null;
  // 이미 "2025.03.17" 형태면 그대로.
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** 그랩 수 라벨 "그랩 16개"(측정 2087:12654). 음수/NaN은 0. */
export function formatGrabCount(count: number): string {
  const n = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  return `그랩 ${n}개`;
}

/**
 * 상대 시각 "1시간 전"(측정 인사이트 카드). 단순 폴백 — ISO 없으면 빈 문자열.
 * MVP: 분/시간/일만(주/월 이상은 "N일 전").
 */
export function formatRelativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  const v = (iso ?? '').trim();
  if (v === '') return '';
  const t = new Date(v).getTime();
  if (Number.isNaN(t)) return '';
  const diffSec = Math.max(0, Math.floor((now - t) / 1000));
  if (diffSec < 60) return '방금 전';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}
