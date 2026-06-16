import { INTEREST_FIELDS, type InterestFieldId } from '@/entities/recommendation';
import { FieldGlyph } from './field-glyph';
import styles from './interest-chip-row.module.css';

/**
 * InterestChipRow — 취향관 관심분야 카테고리 칩 행(제어형, 단일 선택).
 * 측정 정본 2173:120904: 82×82 원형(검정 #141414·보더 #000000) + 3D 일러스트 + 라벨. 선택 시 2px 네온 링.
 *   ★ 3D 일러스트(94f13ce…/534d0f11… imageRef 스프라이트 크롭)는 G7 정적-자산 파이프라인 미확정 →
 *     검정 원형 + 분야별 글리프(FieldGlyph) 플레이스홀더로 형태/링/라벨을 1:1 유지(D6 선례 — 자산 미확정 시 문서화 플레이스홀더).
 *   ★ 이전 구현은 shared Avatar(회색 원 + 한글 단일자) → "깨진 아바타"처럼 보임. 검정 원+글리프로 정정.
 * 선택 링 = brand-primary-50 2px · 라벨 기본 #B4B4B4 / 선택 #66FF4B. "분야 추가" 칩(스코프=상태만, 모달 ❌).
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
            <span className={[styles.icon, active ? styles.iconActive : ''].filter(Boolean).join(' ')}>
              <FieldGlyph field={f.id} />
            </span>
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
