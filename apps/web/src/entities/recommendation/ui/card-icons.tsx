/**
 * 카드 공용 아이콘 — 클립수(chromecast/cast 18·16) · 제목 선두 플레이(20·24).
 * 측정: 홈 카드 클립수 아이콘·트렌드 카드 제목 선두 아이콘. 자산 자체색은 currentColor.
 */

/** 클립수 배지 아이콘(캐스트류). 측정: 2087:70548 18×18 / 배지 내 16×16. */
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

/** 제목 선두 플레이 아이콘(영상 출처). 측정: 24×24(그리드) / 20×20(크로스). */
export function PlayBadgeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill="currentColor" opacity="0.16" />
      <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" />
    </svg>
  );
}

/** 타임코드 아이콘(시계). 측정: 피드 그랩 16×16. */
export function TimecodeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
