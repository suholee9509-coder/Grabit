import type { InterestFieldId } from '@/entities/recommendation';

/**
 * FieldGlyph — 관심분야 카테고리 글리프(검정 원형 칩 내부). 측정 정본 2173:120904.
 * Figma 원본은 분야별 3D 일러스트(person/terminal/palette/briefcase/bulb/chart/people, imageRef 스프라이트 크롭)이며
 * G7 정적-자산 파이프라인 미확정 → 동일 모티프의 라인 글리프로 1:1 형태 대체(문서화 플레이스홀더, D6 선례).
 * 32×32 흰 라인(currentColor). field 매핑은 측정 순서(내 분야→사람, 프로그래밍→터미널, …)와 일치.
 */
export interface FieldGlyphProps {
  field: InterestFieldId;
}

const GLYPHS: Record<InterestFieldId, JSX.Element> = {
  // 내 분야 — 사람(프로필)
  mine: (
    <>
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 26c0-4.4 4-8 9-8s9 3.6 9 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  // 프로그래밍 — 터미널
  programming: (
    <>
      <rect x="5" y="7" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10 13l4 3.5-4 3.5M17 20h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  // UXUI 디자인 — 팔레트
  uxui: (
    <>
      <path
        d="M16 5c6 0 11 4.3 11 9.5 0 3.3-2.7 5-5.5 5H19c-1.4 0-2.2 1.6-1.3 2.7.6.8.3 2.3-1.2 2.6A11 11 0 0 1 16 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="13" r="1.6" fill="currentColor" />
      <circle cx="16" cy="10" r="1.6" fill="currentColor" />
      <circle cx="21" cy="13" r="1.6" fill="currentColor" />
    </>
  ),
  // 업무 생산성 — 서류가방
  productivity: (
    <>
      <rect x="5" y="11" width="22" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 17h22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  // IT 기획 — 전구
  planning: (
    <>
      <path
        d="M16 5a7 7 0 0 0-4 12.7V21h8v-3.3A7 7 0 0 0 16 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 24h6M14 27h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // 리더십 — 성장 차트
  leadership: (
    <>
      <path
        d="M6 24V14M12 24V9M18 24V17M24 24V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 11l5-4 4 3 7-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  // 협업 — 사람 그룹
  collaboration: (
    <>
      <circle cx="11" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="21" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 25c0-3.3 2.7-6 6-6s6 2.7 6 6M16 25c0-3.3 2.7-6 6-6s5 2.2 5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
};

export function FieldGlyph({ field }: FieldGlyphProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {GLYPHS[field] ?? GLYPHS.mine}
    </svg>
  );
}
