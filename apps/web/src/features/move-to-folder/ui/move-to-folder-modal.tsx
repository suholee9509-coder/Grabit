import { useState } from 'react';
import { Folder } from 'lucide-react';
import { Modal, Button } from '@/shared/ui';
import { sanitizeUserText } from '@/shared/lib';
import type { FolderWithCount } from '@/entities/folder';
import { useMoveToFolder } from '../model/use-move-to-folder';
import styles from './move-to-folder-modal.module.css';

/**
 * MoveToFolderModal — 다중선택 → 폴더 선택 모달(u0c Modal). 측정 프레임 부재 → 파운데이션.
 *   폴더 리스트(라디오) + "전체 폴더로 이동(detach)" 옵션 + 확인/취소. move_clips_to_folder RPC.
 */
export interface MoveToFolderModalProps {
  open: boolean;
  /** 이동 대상 컨텐츠 id(다중선택). */
  contentIds: string[];
  folders: FolderWithCount[];
  onClose: () => void;
  onMoved?: (count: number) => void;
  onError?: (message: string) => void;
}

const DETACH = '__detach__';

export function MoveToFolderModal({
  open,
  contentIds,
  folders,
  onClose,
  onMoved,
  onError,
}: MoveToFolderModalProps) {
  const [target, setTarget] = useState<string | null>(null);
  const move = useMoveToFolder();

  const submit = () => {
    if (target === null) return;
    const folderId = target === DETACH ? null : target;
    move.mutate(
      { contentIds, folderId },
      {
        onSuccess: (count) => {
          onMoved?.(count);
          setTarget(null);
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
      title={`${contentIds.length}개 컨텐츠 이동`}
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
            disabled={target === null || move.isPending}
          >
            이동
          </Button>
        </div>
      }
    >
      <ul className={styles.list} role="radiogroup" aria-label="이동할 폴더">
        {folders.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              role="radio"
              aria-checked={target === f.id}
              className={[styles.item, target === f.id ? styles.selected : ''].filter(Boolean).join(' ')}
              onClick={() => setTarget(f.id)}
            >
              <span className={styles.itemIcon}>
                <Folder width={18} height={18} color="#999999" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className={styles.itemName}>{sanitizeUserText(f.name)}</span>
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            role="radio"
            aria-checked={target === DETACH}
            className={[styles.item, target === DETACH ? styles.selected : ''].filter(Boolean).join(' ')}
            onClick={() => setTarget(DETACH)}
          >
            <span className={styles.itemName}>전체 폴더로 이동(폴더에서 빼기)</span>
          </button>
        </li>
      </ul>
    </Modal>
  );
}
