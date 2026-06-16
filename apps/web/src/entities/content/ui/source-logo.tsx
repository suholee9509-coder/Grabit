/**
 * SourceLogo — 출처(provider) 로고 표식. 측정: 출처필터 칩 박스 20×20(내부 img 18 radius4) ·
 *   카드 썸네일 배지 24×24. provider 문자열 → 로고. 자산 SoT = Figma 출처필터 스트립(2087:38907)에서
 *   추출한 실제 provider 로고(youtube=벡터 SVG·그 외=imageRef PNG/JPG). 정적 import 맵 — 키 정규화(소문자·공백제거).
 *   [폴백] 미보유 provider → 결정론 머리글자 모노그램(첫 글자, 대문자). AI/외부호출 ❌ · 정적 맵.
 */
import { PROVIDER_LABELS } from '../lib/provider-labels';
import youtubeLogo from './source-logos/youtube.svg';
import longBlackLogo from './source-logos/long-black.png';
import mediumLogo from './source-logos/medium.jpg';
import tistoryLogo from './source-logos/tistory.png';
import eoPlanetLogo from './source-logos/eo-planet.png';
import publyLogo from './source-logos/publy.png';
import styles from './source-logo.module.css';

export interface SourceLogoProps {
  provider: string;
  /** 표시 박스 크기(px). 출처필터 = 20 / 카드 배지 = 24. */
  size?: number;
}

/** 정규화된 provider 키 → 추출 로고 자산 URL. 자산 보유 provider만 등록(그 외 = 모노그램 폴백). */
const LOGO_ASSETS: Record<string, string> = {
  youtube: youtubeLogo,
  longblack: longBlackLogo,
  medium: mediumLogo,
  tistory: tistoryLogo,
  eoplanet: eoPlanetLogo,
  publy: publyLogo,
};

/** provider 키 정규화 — 소문자 + 공백/하이픈 제거(예: 'Long Black' → 'longblack'). */
function normalizeProvider(provider: string): string {
  return provider.trim().toLowerCase().replace(/[\s-]+/g, '');
}

export function SourceLogo({ provider, size = 20 }: SourceLogoProps) {
  const key = normalizeProvider(provider);
  const asset = LOGO_ASSETS[key];

  if (asset) {
    return (
      <img
        className={styles.logo}
        src={asset}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
      />
    );
  }

  // [폴백] 자산 미보유 provider → 결정론 머리글자 모노그램.
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
