import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar, type SidebarMenuKey } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { AccountMenu, type AccountMenuItem } from '@/widgets/account-menu';
import { Toast } from '@/shared/ui';
import { sanitizeUserText } from '@/shared/lib';
import { useMyProfile } from '@/entities/profile';
import { LogoutConfirm, WithdrawConfirm } from '@/features/account-actions';
import styles from './inbox-page.module.css';

/**
 * InboxPage — 수신함 목록 화면(L1-e). /inbox · RequireOnboarded. GNB 수신함 nav(activeMenu='inbox') 연결.
 *   ★ 진입점(수신함 nav) = sidebar 위젯 미수정 — activeMenu/onMenuSelect props만(카디널 ①).
 *   발송 인프라 없음(게이트 ⓐ) → 목록은 빈상태(파운데이션 EmptyState 카피)·로딩 스켈레톤.
 * ★ 디자인 공백 → u0 토큰만(발명 ❌). 알림 ON/OFF 토글은 설정 '알림' 섹션(분리 — plan §7).
 */
export function InboxPage() {
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
    if (id === 'profile' || id === 'settings') navigate('/settings');
    else if (id === 'logout') setLogoutOpen(true);
    else if (id === 'withdraw') setWithdrawOpen(true);
  };

  const displayName = sanitizeUserText(profile?.display_name) || 'Grabit 사용자';

  // 발송 인프라 부재 → 알림 목록은 빈(시드 없음). 로딩 = 프로필 fetch 동안 스켈레톤.
  const loading = profileQuery.isLoading;
  const notifications: { id: string; title: string; body: string; at: string }[] = [];

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeMenu="inbox"
            onMenuSelect={onMenuSelect}
            onAddContent={() => navigate('/')}
            profile={{ name: displayName }}
            onProfileClick={() => setMenuOpen((o) => !o)}
          />
        }
        topbar={<Topbar breadcrumb={[{ id: 'inbox', label: '수신함' }]} />}
      >
        <div className={styles.body}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>수신함</h1>
            <p className={styles.pageSub}>받은 알림을 한 곳에서 확인하세요.</p>
          </header>

          {loading ? (
            <div className={styles.list} aria-label="알림 불러오는 중">
              <span className={styles.skeleton} />
              <span className={styles.skeleton} />
              <span className={styles.skeleton} />
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>받은 알림이 없어요.</p>
              <p className={styles.emptySub}>
                새로운 알림이 도착하면 여기에서 확인할 수 있어요.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => (
                <li key={n.id} className={styles.item}>
                  <span className={styles.itemTitle}>{n.title}</span>
                  <span className={styles.itemBody}>{n.body}</span>
                  <span className={styles.itemAt}>{n.at}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AppShell>

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
