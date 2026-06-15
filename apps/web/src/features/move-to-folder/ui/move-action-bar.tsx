import { Button } from '@/shared/ui';
import styles from './move-action-bar.module.css';

/**
 * MoveActionBar — 다중선택 액션바(선택 카운트 + "폴더로 이동" + 취소).
 *   측정 프레임 부재(2117:23135=_디폴트) → u0c 파운데이션(하단 고정 바). 게이트ⓒ 사인오프.
 */
export interface MoveActionBarProps {
  count: number;
  onMove: () => void;
  onCancel: () => void;
}

export function MoveActionBar({ count, onMove, onCancel }: MoveActionBarProps) {
  if (count === 0) return null;
  return (
    <div className={styles.bar} role="region" aria-label="선택 항목 작업">
      <span className={styles.count}>{count}개 선택됨</span>
      <div className={styles.actions}>
        <Button variant="secondary" size="md" onClick={onCancel}>
          선택 해제
        </Button>
        <Button variant="primary" size="md" neonLabel onClick={onMove}>
          폴더로 이동
        </Button>
      </div>
    </div>
  );
}
