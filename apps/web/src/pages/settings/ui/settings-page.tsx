import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar, type SidebarMenuKey } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { AccountMenu, type AccountMenuItem } from '@/widgets/account-menu';
import { Button, Toast } from '@/shared/ui';
import { sanitizeUserText } from '@/shared/lib';
import { useMyProfile } from '@/entities/profile';
import { ProfileEditSection } from '@/features/profile-edit';
import { NotificationSettingsSection } from '@/features/notification-settings';
import {
  LogoutConfirm,
  WithdrawConfirm,
  RecoveryBanner,
} from '@/features/account-actions';
import styles from './settings-page.module.css';

/**
 * SettingsPage — 설정 단일 페이지(앵커 섹션: #profile · #notifications · #account). /settings · RequireOnboarded.
 *   AppShell + Sidebar(프로필 카드 chevron → AccountMenu) + Topbar('설정' 브레드크럼). library-page 호스트 패턴.
 * ★ 진입점(프로필 카드·수신함 nav)은 sidebar 위젯 미수정 — props만 와이어링(카디널 ①).
 *   나머지 화면은 디자인 공백 → u0 토큰·shared/ui 1:1(발명 ❌).
 * 섹션: 프로필 수정(features/profile-edit) · 알림(features/notification-settings) · 계정(로그아웃·탈퇴).
 * 복구 배너 = deleted_at 비NULL 시 최상단(유예중 — 복구 먼저).
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const profileQuery = useMyProfile();
  const profile = profileQuery.data;

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const onMenuSelect = (key: SidebarMenuKey) => {
    if (key === 'home') navigate('/');
    else if (key === 'search') navigate('/search');
    else if (key === 'library') navigate('/library');
    else if (key === 'inbox') navigate('/inbox');
  };

  const onAccountSelect = (id: AccountMenuItem['id']) => {
    if (id === 'profile') scrollToSection('profile');
    else if (id === 'settings') scrollToSection('profile');
    else if (id === 'logout') setLogoutOpen(true);
    else if (id === 'withdraw') setWithdrawOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    // jsdom 미구현 가드(테스트 결정론) — 실 브라우저에서만 스무스 스크롤.
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayName = sanitizeUserText(profile?.display_name) || 'Grabit 사용자';

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            onMenuSelect={onMenuSelect}
            onAddContent={() => navigate('/')}
            profile={{ name: displayName }}
            onProfileClick={() => setMenuOpen((o) => !o)}
          />
        }
        topbar={<Topbar breadcrumb={[{ id: 'settings', label: '설정' }]} />}
      >
        <div className={styles.body}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>설정</h1>
            <p className={styles.pageSub}>프로필·알림·계정을 한 곳에서 관리하세요.</p>
          </header>

          {/* 복구 배너(유예중) — 최상단. */}
          <RecoveryBanner
            deletedAt={profile?.deleted_at}
            onRestored={() => showToast('success', '계정을 복구했어요.')}
            onError={() => showToast('error', '복구에 실패했어요. 다시 시도해 주세요.')}
          />

          {/* 프로필 섹션 */}
          <section id="profile" className={styles.section} aria-labelledby="settings-profile-h">
            <div className={styles.sectionHead}>
              <h2 id="settings-profile-h" className={styles.sectionTitle}>
                프로필
              </h2>
              <p className={styles.sectionDesc}>
                표시 이름과 코호트 정보를 수정할 수 있어요. 코호트(직업·연차)는 공개 집계에만
                쓰이고, 그 외 정보는 나만 볼 수 있어요.
              </p>
            </div>
            <ProfileEditSection
              onSaved={() => showToast('success', '프로필을 저장했어요.')}
              onError={(msg) => showToast('error', msg)}
            />
          </section>

          <hr className={styles.sectionDivider} />

          {/* 알림 섹션 */}
          <section
            id="notifications"
            className={styles.section}
            aria-labelledby="settings-notif-h"
          >
            <div className={styles.sectionHead}>
              <h2 id="settings-notif-h" className={styles.sectionTitle}>
                알림
              </h2>
              <p className={styles.sectionDesc}>받고 싶은 알림을 켜고 끌 수 있어요.</p>
            </div>
            <NotificationSettingsSection
              onError={() => showToast('error', '알림 설정을 저장하지 못했어요.')}
            />
          </section>

          <hr className={styles.sectionDivider} />

          {/* 계정 섹션 */}
          <section id="account" className={styles.section} aria-labelledby="settings-account-h">
            <div className={styles.sectionHead}>
              <h2 id="settings-account-h" className={styles.sectionTitle}>
                계정
              </h2>
              <p className={styles.sectionDesc}>로그아웃하거나 회원 탈퇴를 요청할 수 있어요.</p>
            </div>
            <div className={styles.accountActions}>
              <Button variant="secondary" size="md" onClick={() => setLogoutOpen(true)}>
                로그아웃
              </Button>
              <Button variant="secondary" size="md" onClick={() => setWithdrawOpen(true)}>
                회원 탈퇴
              </Button>
            </div>
          </section>
        </div>
      </AppShell>

      {/* 계정 팝오버(프로필 카드 chevron 진입) */}
      <AccountMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSelect={onAccountSelect} />

      <LogoutConfirm
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLoggedOut={() => {
          setLogoutOpen(false);
          navigate('/login', { replace: true });
        }}
        onError={() => showToast('error', '로그아웃에 실패했어요. 다시 시도해 주세요.')}
      />

      <WithdrawConfirm
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onWithdrawn={() => {
          setWithdrawOpen(false);
          showToast('success', '탈퇴가 접수됐어요. 30일 안에 재로그인하면 복구할 수 있어요.');
        }}
        onError={() => showToast('error', '탈퇴 처리에 실패했어요. 다시 시도해 주세요.')}
      />

      {toast ? (
        <div className={styles.toastWrap}>
          <Toast variant={toast.kind}>{toast.message}</Toast>
        </div>
      ) : null}
    </>
  );
}
