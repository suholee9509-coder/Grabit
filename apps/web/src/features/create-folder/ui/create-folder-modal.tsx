import { useState } from 'react';
import { Modal, Input, Button } from '@/shared/ui';
import { useCreateFolder } from '../model/use-create-folder';
import styles from './create-folder-modal.module.css';

/**
 * CreateFolderModal — 폴더 생성(u0c Modal + Input). 측정 프레임 부재 → u0c 파운데이션.
 *   생성 input · 취소/확인 · 공백 차단 · 최대20 도달 시 진입 차단(page에서 atLimit 전달) ·
 *   낙관적+롤백은 mutation onSuccess/onError(page Toast).
 */
export interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  /** 생성 성공 시(폴더명) — page가 Toast/상태 갱신. */
  onCreated?: (name: string) => void;
  /** 실패 시 메시지 — page Toast. */
  onError?: (message: string) => void;
  /** 폴더 20개 도달 — 진입 차단 안내. */
  atLimit?: boolean;
}

export function CreateFolderModal({ open, onClose, onCreated, onError, atLimit = false }: CreateFolderModalProps) {
  // 입력 초기화는 부모가 key 리마운트로 보장(open 토글 시 key 변경 → fresh useState). effect/ref 불필요.
  const [name, setName] = useState('');
  const create = useCreateFolder();

  const submit = () => {
    if (atLimit) return;
    const trimmed = name.trim();
    if (trimmed === '') return;
    create.mutate(trimmed, {
      onSuccess: () => {
        onCreated?.(trimmed);
        onClose();
      },
      onError: (err) => onError?.(err.message),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="새 폴더"
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
            disabled={atLimit || name.trim() === '' || create.isPending}
          >
            만들기
          </Button>
        </div>
      }
    >
      {atLimit ? (
        <p className={styles.limit}>폴더는 최대 20개까지 만들 수 있어요. 기존 폴더를 정리한 뒤 다시 시도해 주세요.</p>
      ) : (
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
      )}
    </Modal>
  );
}
