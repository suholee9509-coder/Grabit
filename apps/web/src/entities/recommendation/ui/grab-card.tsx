import type { GrabModel } from '../model/types';
import { toneClass } from './tone';
import styles from './grab-card.module.css';

/**
 * GrabCard — 우레일 실시간 그랩(헤더 1줄 + 버블 + 임베드). 측정 정본: 2087:71777(우 패널 71744 내).
 * 헤더행 = 아바타 + 이름 + 역할배지(11/Medium #B472D0~tone) + "1시간 전"(12/Regular #999999 우측 정렬).
 *   → 본문(인용) → 임베드 카드 순. (이전 구조: 역할/시간이 footer에 있었음 — 헤더행으로 이동.)
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
        <span className={styles.identity}>
          <span className={styles.avatar}>{model.authorInitial}</span>
          <span className={styles.name}>{model.authorName}</span>
          <span className={[styles.role, toneClass(model.roleTone, styles)].join(' ')}>
            {model.role}
          </span>
        </span>
        <span className={styles.time}>{model.timeLabel}</span>
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
    </button>
  );
}
