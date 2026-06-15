import type { GrabModel } from '../model/types';
import { toneClass } from './tone';
import styles from './grab-card.module.css';

/**
 * GrabCard — 우레일 실시간 그랩(버블 + 임베드). 측정: 풀스크롤 2087:70384 §7.
 * entities → onSelect 콜백만(widget이 navigate 연결).
 */
export interface GrabCardProps {
  model: GrabModel;
  onSelect?: (id: string) => void;
}

export function GrabCard({ model, onSelect }: GrabCardProps) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.header}>
        <span className={styles.avatar}>{model.authorInitial}</span>
        <span className={styles.name}>{model.authorName}</span>
      </span>
      <span className={styles.bubble}>
        <span className={styles.bubbleBody}>{model.body}</span>
        <span className={styles.embed}>
          <span className={styles.embedText}>
            <span className={styles.embedTitle}>{model.embedTitle}</span>
            <span className={styles.embedChannel}>
              {model.embedThumbnailUrl ? (
                <img className={styles.embedChannelThumb} src={model.embedThumbnailUrl} alt="" />
              ) : (
                <span className={styles.embedChannelThumb} aria-hidden="true" />
              )}
              {model.embedChannel}
            </span>
          </span>
          <span className={styles.embedThumb} aria-hidden="true" />
        </span>
      </span>
      <span className={styles.footer}>
        <span className={[styles.role, toneClass(model.roleTone, styles)].join(' ')}>
          {model.role}
        </span>
        <span className={styles.time}>{model.timeLabel}</span>
      </span>
    </button>
  );
}
