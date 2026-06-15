import { Button, Card } from '@/shared/ui';
import { useAccountLifecycle, graceEndDate } from '../model/use-account-lifecycle';
import styles from './account-actions.module.css';

/**
 * RecoveryBanner — soft-delete 유예중 재로그인 시 복구 안내(L1-d). deleted_at 비NULL일 때 노출.
 *   restore_account(0013) 1클릭 → 계정 복구. ★ 전용 배너 컴포넌트 부재 → Card 면 + Button 조립(토큰만).
 */
export interface RecoveryBannerProps {
  /** profiles.deleted_at — 비NULL이면 배너 노출(유예 종료일 계산). */
  deletedAt: string | null | undefined;
  onRestored: () => void;
  onError: () => void;
}

export function RecoveryBanner({ deletedAt, onRestored, onError }: RecoveryBannerProps) {
  const { restoreAccount, restorePending } = useAccountLifecycle();
  if (!deletedAt) return null;

  const endDate = graceEndDate(deletedAt);

  return (
    <Card className={styles.banner} role="alert">
      <div className={styles.bannerText}>
        <p className={styles.bannerTitle}>탈퇴 유예 중인 계정이에요</p>
        <p className={styles.bannerSub}>
          {endDate
            ? `${endDate}까지 계정을 복구할 수 있어요. 지금 복구하면 모든 데이터가 그대로 유지돼요.`
            : '유예 기간 동안 계정을 복구할 수 있어요. 지금 복구하면 데이터가 그대로 유지돼요.'}
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        neonLabel
        disabled={restorePending}
        onClick={() => restoreAccount({ onSuccess: onRestored, onError })}
      >
        계정 복구
      </Button>
    </Card>
  );
}
