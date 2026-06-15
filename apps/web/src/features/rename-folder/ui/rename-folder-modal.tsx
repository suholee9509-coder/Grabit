import { useState } from 'react';
import { Modal, Input, Button } from '@/shared/ui';
import { useRenameFolder } from '../model/use-rename-folder';
import styles from './rename-folder-modal.module.css';

/**
 * RenameFolderModal — 폴더 이름변경(u0c Modal + Input, 기존명 프리필). 측정 프레임 부재 → 파운데이션.
 */
export interface RenameFolderModalProps {
  open: boolean;
  folderId: string | null;
  /** 기존 폴더명(프리필). */
  initialName: string;
  onClose: () => void;
  onRenamed?: (name: string) => void;
  onError?: (message: string) => void;
}

export function RenameFolderModal({
  open,
  folderId,
  initialName,
  onClose,
  onRenamed,
  onError,
}: RenameFolderModalProps) {
  // 기존명 프리필은 부모가 key 리마운트로 보장(folderId 변경 → fresh useState(initialName)). effect/ref 불필요.
  const [name, setName] = useState(initialName);
  const rename = useRenameFolder();

  const submit = () => {
    if (!folderId) return;
    const trimmed = name.trim();
    if (trimmed === '') return;
    rename.mutate(
      { id: folderId, name: trimmed },
      {
        onSuccess: () => {
          onRenamed?.(trimmed);
          onClose();
        },
        onError: (err) => onError?.(err.message),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="폴더 이름 변경"
      footer={
        <div className={styles.footer}>
          <Button variant="secondary" size="md" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="md"
            neonLabel
            onClick={submit}
            disabled={name.trim() === '' || rename.isPending}
          >
            저장
          </Button>
        </div>
      }
    >
      <Input
        autoFocus
        placeholder="폴더 이름을 입력해 주세요"
        value={name}
        maxLength={50}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        aria-label="폴더 이름"
      />
    </Modal>
  );
}
