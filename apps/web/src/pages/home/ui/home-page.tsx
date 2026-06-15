import { useSearchParams } from 'react-router-dom';
import { ExtensionInstallModal } from '@/features/extension-install-modal';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import styles from './home-page.module.css';

/**
 * 홈 페이지 (u1 범위 = 모달 진입점만 — 홈 본문은 u2 소관).
 *   온보딩 완료 직후(?onboarded=1) 또는 미설치 시 확장 설치 모달 자동 노출(E5: 1회 + dismiss 보존).
 *   배경 = u0 앱셸(GNB 4탭, FD1) + u2 자리표시 본문.
 */
export function HomePage() {
  const [params] = useSearchParams();
  const cameFromOnboarding = params.get('onboarded') === '1';

  return (
    <AppShell sidebar={<Sidebar activeMenu="home" />}>
      <div className={styles.placeholder}>
        {/* 홈 피드 본문은 u2 소관 — 여기선 자리표시(파운데이션). */}
        <p className={styles.note}>홈 (u2에서 구현 예정)</p>
      </div>
      <ExtensionInstallModal autoOpen={cameFromOnboarding} />
    </AppShell>
  );
}
