import type { CrossCardModel } from '../model/types';
import { PlayBadgeIcon } from './card-icons';
import { toneClass } from './tone';
import styles from './cross-card.module.css';

/**
 * CrossCard — 크로스 트렌드/인사이트 가로형 카드(252폭).
 * 측정: 재필터 2278:135621 §5-2 / 피드 2087:71867 §4. entities → onSelect 콜백만.
 */
export interface CrossCardProps {
  model: CrossCardModel;
  onSelect?: (id: string) => void;
}

export function CrossCard({ model, onSelect }: CrossCardProps) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.thumb}>
        {model.thumbnailUrl ? (
          <img className={styles.thumbImg} src={model.thumbnailUrl} alt="" />
        ) : null}
      </span>
      <span className={styles.body}>
        <span className={styles.head}>
          <span className={styles.titleRow}>
            <span className={styles.titleIcon}>
              <PlayBadgeIcon size={20} />
            </span>
            <span className={styles.titleText}>{model.title}</span>
          </span>
          <span className={styles.authorRow}>
            <span className={[styles.role, toneClass(model.author.tone, styles)].join(' ')}>
              {model.author.role}
            </span>
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.affiliation}>{model.author.affiliation}</span>
          </span>
        </span>
        <span className={styles.summary}>{model.summary}</span>
      </span>
    </button>
  );
}
