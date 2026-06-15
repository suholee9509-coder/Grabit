import { Button, Modal } from '@/shared/ui';
import { useLogout } from '../model/use-logout';
import styles from './account-actions.module.css';

/**
 * LogoutConfirm — 로그아웃 확인 모달(L1-c). 명시 확인 없이는 signOut 실행 ❌(오발화 방지).
 *   확정 → useLogout → onLoggedOut(페이지가 /login navigate). 펜딩 시 버튼 disabled.
 * ★ 디자인 공백 → shared/ui Modal·Button + 토큰 카피만(발명 ❌).
 */
export interface LogoutConfirmProps {
  open: boolean;
  onClose: () => void;
  onLoggedOut: () => void;
  onError: () => void;
}

export function LogoutConfirm({ open, onClose, onLoggedOut, onError }: LogoutConfirmProps) {
  const { logout, pending } = useLogout();

  return (
    <Modal
      open={open}
      onClose={pending ? undefined : onClose}
      title="로그아웃 할까요?"
      footer={
        <>
          <Button variant="secondary" size="md" disabled={pending} onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            neonLabel
            disabled={pending}
            onClick={() => logout({ onSuccess: onLoggedOut, onError })}
          >
            로그아웃
          </Button>
        </>
      }
    >
      <p className={styles.modalBody}>로그아웃하면 다시 로그인해야 Grabit을 이용할 수 있어요.</p>
    </Modal>
  );
}
