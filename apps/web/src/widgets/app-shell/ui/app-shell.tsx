import type { ReactNode } from 'react';
import styles from './app-shell.module.css';

/**
 * AppShell — 앱 전역 레이아웃 위젯(GNB 슬롯 + 톱바 슬롯 + 본문 슬롯).
 * 측정 정준: 홈 2087:70381(GNB 254 고정) + 톱바 56. children = 페이지 본문.
 * ★FSD 경계: 동일 레이어(widgets) 크로스-슬라이스 임포트 ❌ → sidebar/topbar를 직접 임포트하지 않고
 *   ReactNode 슬롯으로 받는다. 실제 <Sidebar/>·<Topbar/> 조합은 상위 레이어(pages/app)가 주입.
 *   (shared/shared-ui만 의존하는 순수 레이아웃 위젯.)
 */
export interface AppShellProps {
  /** 좌측 GNB 슬롯(측정: 254 고정폭) — 보통 <Sidebar/>. */
  sidebar?: ReactNode;
  /** 상단 톱바 슬롯(측정: 56) — 보통 <Topbar/>. */
  topbar?: ReactNode;
  /** 본문 슬롯. */
  children?: ReactNode;
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      {sidebar}
      <div className={styles.main}>
        {topbar}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
