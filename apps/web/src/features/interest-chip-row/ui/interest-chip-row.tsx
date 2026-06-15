import { Avatar } from '@/shared/ui';
import { INTEREST_FIELDS, type InterestFieldId } from '@/entities/recommendation';
import styles from './interest-chip-row.module.css';

/**
 * InterestChipRow — 취향관 관심분야 아바타 칩 행(제어형, 단일 선택).
 * 측정 2173:120904 / 칩active 2173:105190 / 재필터 2278:135621 §3.
 * shared/ui Avatar(size=xl, selected) + 라벨. "분야 추가" 칩(스코프=상태만, 모달 ❌).
 * 선택 링 = brand-primary-50 2px(Avatar.selected) · 라벨 #66FF4B.
 */
export interface InterestChipRowProps {
  value: InterestFieldId;
  onChange: (value: InterestFieldId) => void;
  /** "분야 추가" 클릭(스코프 = 상태 시그널만, 모달 ❌). */
  onAddField?: () => void;
}

/** 더하기 아이콘(32×32). */
function PlusIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 9.5v13M9.5 16h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function InterestChipRow({ value, onChange, onAddField }: InterestChipRowProps) {
  return (
    <div className={styles.row} role="group" aria-label="관심분야">
      {INTEREST_FIELDS.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            className={[styles.chip, active ? styles.active : ''].filter(Boolean).join(' ')}
            aria-pressed={active}
            aria-label={f.label}
            onClick={() => onChange(f.id)}
          >
            <Avatar size="xl" selected={active} initials={f.label.slice(0, 1)} />
            <span className={styles.label} aria-hidden="true">
              {f.label}
            </span>
          </button>
        );
      })}
      <button type="button" className={styles.chip} onClick={onAddField}>
        <span className={styles.addAvatar}>
          <PlusIcon />
        </span>
        <span className={[styles.label, styles.addLabel].join(' ')}>분야 추가</span>
      </button>
    </div>
  );
}
