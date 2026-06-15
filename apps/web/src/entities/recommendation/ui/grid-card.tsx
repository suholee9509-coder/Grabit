import type { GridCardModel } from '../model/types';
import { ClipCountIcon, PlayBadgeIcon } from './card-icons';
import { toneClass } from './tone';
import styles from './grid-card.module.css';

/**
 * GridCard — 분야별 트렌드/그리드 대형 세로 카드(356×461).
 * 측정: 풀스크롤 2087:70384 §5 / 피드 2087:71867 §5-2. entities → onSelect 콜백만.
 */
export interface GridCardProps {
  model: GridCardModel;
  onSelect?: (id: string) => void;
}

export function GridCard({ model, onSelect }: GridCardProps) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.topBlock}>
        <span className={styles.title}>
          <span className={styles.titleIcon}>
            <PlayBadgeIcon size={24} />
          </span>
          <span className={styles.titleText}>{model.title}</span>
        </span>
        <span className={styles.metaRow}>
          <span className={styles.tags}>
            {model.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </span>
          <span className={styles.clipCount}>
            <ClipCountIcon size={18} />
            {model.clipCount}개
          </span>
        </span>
      </span>

      <span className={styles.thumb}>
        {model.thumbnailUrl ? (
          <img className={styles.thumbImg} src={model.thumbnailUrl} alt="" />
        ) : null}
      </span>

      <span className={styles.bottomBlock}>
        <span className={styles.authorRow}>
          <span className={[styles.role, toneClass(model.author.tone, styles)].join(' ')}>
            {model.author.role}
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.meta}>{model.meta}</span>
        </span>
        <span className={styles.summary}>{model.author.affiliation}</span>
      </span>
    </button>
  );
}
