import { Logo } from './logo';
import styles from './onboarding-header.module.css';

/**
 * 온보딩/로그인 전용 헤더 (widget) — 측정 2087:8223 외:
 *   row · x=32 y=28 · w 902 · space-between · align center. 좌측 로고만(우측 빈 슬롯).
 *   앱셸(GNB/톱바) 외부 — 온보딩 플로우 전용 미니 헤더.
 */
export function OnboardingHeader() {
  return (
    <header className={styles.header}>
      <Logo />
    </header>
  );
}
