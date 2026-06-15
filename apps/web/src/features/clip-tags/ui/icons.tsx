/** clip-tags 아이콘 — add "+"(16) · 태그칩 취소 x(16). 측정 componentId 1579:7082 / 취소 프레임. */

/** "+" 추가 아이콘 16×16 (측정: add-chip leadingIcon). */
export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 취소 x 아이콘 16×16 (측정: removable 태그칩 trailing). 글리프색은 칩 CSS(.remove)가 결정. */
export function CancelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
