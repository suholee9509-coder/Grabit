import { Modal, Button } from '@/shared/ui';
import { sanitizeUserText } from '@/shared/lib';
import { useDeleteFolder } from '../model/use-delete-folder';
import styles from './delete-folder-dialog.module.css';

/**
 * DeleteFolderDialog — 폴더 삭제 확인 다이얼로그(u0c Modal). 측정 프레임 부재 → 파운데이션.
 *   folder_id NULL해제 안내(클립은 전체 폴더로 보존). 취소/삭제.
 */
export interface DeleteFolderDialogProps {
  open: boolean;
  folderId: string | null;
  folderName: string;
  onClose: () => void;
  onDeleted?: (name: string) => void;
  onError?: (message: string) => void;
}

export function DeleteFolderDialog({
  open,
  folderId,
  folderName,
  onClose,
  onDeleted,
  onError,
}: DeleteFolderDialogProps) {
  const del = useDeleteFolder();
  const safeName = sanitizeUserText(folderName);

  const submit = () => {
    if (!folderId) return;
    del.mutate(folderId, {
      onSuccess: () => {
        onDeleted?.(safeName);
        onClose();
      },
      onError: (err) => onError?.(err.message),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="폴더 삭제"
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" size="md" onClick={onClose}>
            취소
          </Button>
          <Button variant="lightSolid" size="md" onClick={submit} disabled={del.isPending}>
            삭제
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        <strong className={styles.name}>{safeName}</strong> 폴더를 삭제할까요?
        <br />폴더 안의 컨텐츠는 삭제되지 않고 전체 폴더로 이동돼요.
      </p>
    </Modal>
  );
}
