/**
 * 검색 카드 공용 아이콘 (entities/content 자체 소유 — entities/recommendation cross-slice 임포트 ❌).
 * 측정: 클립수 배지 아이콘(chromecast/cast 18×18, 2087:38969). 자산색 = currentColor(#999 상속).
 * 패턴은 recommendation/card-icons를 거울(복제) — FSD 동일레이어 cross-slice 금지 준수.
 */

/** 클립수 배지 아이콘(캐스트류). 측정: 2087:38969 18×18. */
export function ClipCountIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2.25 3.75h13.5v10.5h-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 11.25a3 3 0 0 1 3 3M2.25 8.25a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="2.75" cy="14.75" r="0.9" fill="currentColor" />
    </svg>
  );
}
