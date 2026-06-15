/**
 * SourceLogo — 출처(provider) 로고 표식. 측정: 출처필터 칩 박스 20×20(내부 img 18 radius4) ·
 *   카드 썸네일 배지 24×24. provider 문자열 → 로고. [디자인공백/자산] 실제 SVG/imageRef 미보유 →
 *   결정론 폴백: Youtube는 측정 빨강(#ED1D24) 글리프, 그 외는 머리글자 모노그램(첫 글자, 대문자).
 *   AI/외부호출 ❌ · 정적 맵.
 */
import { PROVIDER_LABELS } from '../lib/provider-labels';
import styles from './source-logo.module.css';

export interface SourceLogoProps {
  provider: string;
  /** 표시 박스 크기(px). 출처필터 = 20 / 카드 배지 = 24. */
  size?: number;
}

export function SourceLogo({ provider, size = 20 }: SourceLogoProps) {
  const key = provider.toLowerCase();

  if (key === 'youtube') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={styles.logo}
      >
        <rect x="1.5" y="5" width="21" height="14" rx="4" fill="#ED1D24" />
        <path d="M10 9l5 3-5 3V9z" fill="#FFFFFF" />
      </svg>
    );
  }

  // [디자인공백] imageRef 미보유 provider → 결정론 머리글자 모노그램.
  const initial = (PROVIDER_LABELS[key] ?? provider).trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={styles.mono}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
