import { Toggle } from '@/shared/ui';
import { useNotificationPrefsState } from '../model/use-notification-prefs';
import styles from './notification-settings-section.module.css';

/**
 * NotificationSettingsSection — 설정 '알림' 섹션(L1-e). 카테고리별 ON/OFF 토글 행.
 *   비결제 카테고리만(0013 CHECK·카탈로그가 보장). 토글 = set_notification_pref 저장(낙관/롤백).
 * ★ 디자인 공백 → shared/ui Toggle + u0 토큰 행 레이아웃(발명 ❌). 발송 인프라 없음 → 설정 저장만.
 */
export interface NotificationSettingsSectionProps {
  enabled?: boolean;
  onError: () => void;
}

export function NotificationSettingsSection({
  enabled = true,
  onError,
}: NotificationSettingsSectionProps) {
  const state = useNotificationPrefsState(enabled);

  if (state.loading) {
    return (
      <div className={styles.skeletonWrap} aria-label="알림 설정 불러오는 중">
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
      </div>
    );
  }

  if (state.loadError) {
    return (
      <p className={styles.errorText} role="alert">
        알림 설정을 불러오지 못했어요.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {state.rows.map((row) => (
        <li key={row.category} className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>{row.label}</span>
            <span className={styles.rowDesc}>{row.description}</span>
          </div>
          <Toggle
            checked={row.enabled}
            disabled={state.pendingCategory === row.category}
            aria-label={`${row.label} 알림`}
            onCheckedChange={(next) => state.toggle(row.category, next, onError)}
          />
        </li>
      ))}
    </ul>
  );
}
