import type { ReactNode } from 'react';
import { Button, Breadcrumb, type BreadcrumbItem } from '@/shared/ui';
import styles from './topbar.module.css';

/**
 * Topbar — 앱 셸 상단 바. 측정 정준: 홈 톱바 2087:69671 · 상세 톱바 2087:13114.
 * 좌측 = 브레드크럼(경로 있을 때) · 우측 = pill 페어('확장 프로그램 설치' outline + '로그인' filled).
 * 두 pill 모두 h34·radius100(shared/ui Button size=md+pill) + 톱바 실측 pad8/16·lh130 보정.
 * ★FD3: 흰색 = #FAFAFA(토큰). FSD widgets — shared/ui(Button)·widgets/breadcrumb·shared만 의존.
 */
export interface TopbarProps {
  /** 좌측 브레드크럼 경로(빈 배열·미지정 시 좌측 비움 — 홈 톱바). */
  breadcrumb?: BreadcrumbItem[];
  /** '확장 프로그램 설치' 클릭. */
  onInstallExtension?: () => void;
  /** '로그인' 클릭. */
  onLogin?: () => void;
  /** 로그인 버튼 leading 아이콘(측정: 내부 Frame3 gap4 슬롯). */
  loginIcon?: ReactNode;
  /** 확장 설치 버튼 라벨(기본 '확장 프로그램 설치'). */
  installLabel?: string;
  /** 로그인 버튼 라벨(기본 '로그인'). */
  loginLabel?: string;
  /** 라이트 액션 영역 커스텀(우측 페어 대체 — 로그인 후 상태 등). 지정 시 기본 페어 비표시. */
  rightSlot?: ReactNode;
}

export function Topbar({
  breadcrumb = [],
  onInstallExtension,
  onLogin,
  loginIcon,
  installLabel = '확장 프로그램 설치',
  loginLabel = '로그인',
  rightSlot,
}: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {breadcrumb.length > 0 ? <Breadcrumb items={breadcrumb} /> : null}
      </div>
      <div className={styles.right}>
        {rightSlot ?? (
          <>
            <Button
              variant="secondary"
              size="md"
              pill
              className={styles.pill}
              onClick={onInstallExtension}
            >
              {installLabel}
            </Button>
            <Button
              variant="primary"
              size="md"
              pill
              className={[styles.pill, styles.loginPill].join(' ')}
              leadingIcon={loginIcon}
              onClick={onLogin}
            >
              {loginLabel}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
