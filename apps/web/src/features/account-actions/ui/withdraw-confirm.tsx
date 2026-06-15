import { useState } from 'react';
import { Button, Modal } from '@/shared/ui';
import { useAccountLifecycle } from '../model/use-account-lifecycle';
import styles from './account-actions.module.css';

/**
 * WithdrawConfirm — 회원 탈퇴 확인 모달(L1-d). 30일 유예·복구 안내 포함.
 *   ★ 위험 액션 색 토큰 부재 → 색 발명 ❌. 2단계 확인(명시 체크 + 확정 버튼) + 명확 카피로 위험 전달.
 *   명시 동의 체크 없이는 확정 버튼 비활성 → soft_delete 미호출(오발화 방지).
 *   확정 → soft_delete_account(0013, deleted_at 세팅). hard-delete ❌. 펜딩 시 disabled.
 */
export interface WithdrawConfirmProps {
  open: boolean;
  onClose: () => void;
  onWithdrawn: () => void;
  onError: () => void;
}

export function WithdrawConfirm({ open, onClose, onWithdrawn, onError }: WithdrawConfirmProps) {
  const { withdraw, withdrawPending } = useAccountLifecycle();
  const [acknowledged, setAcknowledged] = useState(false);

  const close = () => {
    if (withdrawPending) return;
    setAcknowledged(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="정말 탈퇴하시겠어요?"
      footer={
        <>
          <Button variant="secondary" size="md" disabled={withdrawPending} onClick={close}>
            취소
          </Button>
          <Button
            variant="secondary"
            size="md"
            disabled={!acknowledged || withdrawPending}
            onClick={() =>
              withdraw({
                onSuccess: () => {
                  setAcknowledged(false);
                  onWithdrawn();
                },
                onError,
              })
            }
          >
            탈퇴하기
          </Button>
        </>
      }
    >
      <div className={styles.withdrawBody}>
        <p className={styles.modalBody}>
          탈퇴를 요청하면 계정이 <strong className={styles.emphasis}>30일간 유예 상태</strong>로
          전환돼요. 즉시 삭제되지 않으며, 유예 기간 동안 다시 로그인하면 계정을 복구할 수 있어요.
        </p>
        <ul className={styles.withdrawList}>
          <li>유예 기간 동안 내 클립·메모는 공개 집계에서 제외돼요.</li>
          <li>30일이 지나면 계정과 데이터가 영구 삭제될 수 있어요.</li>
          <li>복구는 재로그인 후 안내 배너에서 1번에 처리할 수 있어요.</li>
        </ul>
        <label className={styles.ackRow}>
          <input
            type="checkbox"
            className={styles.ackCheckbox}
            checked={acknowledged}
            disabled={withdrawPending}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span className={styles.ackText}>위 내용을 확인했으며 탈퇴를 진행할게요.</span>
        </label>
      </div>
    </Modal>
  );
}
