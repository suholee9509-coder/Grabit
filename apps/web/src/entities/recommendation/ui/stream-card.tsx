import type { StreamGrabModel } from '../model/types';
import { ClipCountIcon, TimecodeIcon } from './card-icons';
import { toneClass } from './tone';
import styles from './stream-card.module.css';

/**
 * StreamCard — 피드 실시간 인기 그랩 가로형 카드. 측정: 피드 2087:71867 §3.
 * entities → onSelect 콜백만.
 */
export interface StreamCardProps {
  model: StreamGrabModel;
  onSelect?: (id: string) => void;
}

export function StreamCard({ model, onSelect }: StreamCardProps) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.text}>
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
        <span className={styles.authorRow}>
          <span className={[styles.role, toneClass(model.author.tone, styles)].join(' ')}>
            {model.author.affiliation}
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.title}>{model.title}</span>
        </span>
        <span className={styles.summary}>{model.summary}</span>
        <span className={styles.timecode}>
          <TimecodeIcon size={16} />
          {model.timecode}
        </span>
      </span>
      <span className={styles.thumb}>
        {model.thumbnailUrl ? (
          <img className={styles.thumbImg} src={model.thumbnailUrl} alt="" />
        ) : null}
      </span>
    </button>
  );
}
