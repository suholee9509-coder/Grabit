import styles from './onboarding-header.module.css';

/**
 * Grabit 로고 — 측정 2117:12845 외: 91×24.75. 온보딩/로그인 전용 헤더 워드마크.
 * 네온 그린 심볼 + Grabit 텍스트(브랜드 마크 근사, 정적 자산).
 */
export function Logo() {
  return (
    <span className={styles.logo} aria-label="Grabit">
      <svg width="22" height="25" viewBox="0 0 22 25" fill="none" aria-hidden="true">
        <path d="M11 0L21.5 6v12.5L11 24.75.5 18.5V6L11 0z" fill="var(--color-brand-primary)" />
        <path
          d="M7 9h8M7 12.5h8M7 16h5"
          stroke="var(--color-text-on-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.wordmark}>Grabit</span>
    </span>
  );
}
