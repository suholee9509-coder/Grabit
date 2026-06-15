/**
 * SourceIcon — 출처 로고 아이콘(content 엔티티 표현). 측정: 20×20 컨테이너 내부 18×18 로고(radius 4).
 *   Youtube = 적색 글리프(#ED1D24, 측정 fill) — 인라인 SVG(lucide Youtube 미보유 버전 대응).
 *   그 외(Long Black·Medium·EO planet·Publy) = 브랜드 이미지 로고(imageRef) — 에셋 미보유 →
 *   provider별 결정론 모노그램 배지(u0c 폴백 패턴). 픽셀 SoT(이미지)는 에셋 확보 시 교체.
 * entities 레이어 — 모든 위젯이 하향 임포트(같은레이어 크로스슬라이스 회피).
 */

const MONOGRAM: Record<string, { label: string; bg: string }> = {
  longblack: { label: 'LB', bg: '#111111' },
  medium: { label: 'M', bg: '#000000' },
  eoplanet: { label: 'EO', bg: '#1F7A3D' },
  publy: { label: 'P', bg: '#1B4DFF' },
};

function YoutubeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#ED1D24" />
      <path d="M10 9l5 3-5 3V9z" fill="#fff" />
    </svg>
  );
}

export function SourceIcon({ provider }: { provider: string }) {
  const key = provider.trim().toLowerCase();
  if (key === 'youtube') {
    return <YoutubeGlyph />;
  }
  const mono = MONOGRAM[key];
  if (mono) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: mono.bg,
          color: '#fafafa',
          fontSize: 9,
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {mono.label}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.12)',
        display: 'inline-block',
      }}
    />
  );
}
