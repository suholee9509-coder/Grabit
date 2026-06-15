import type { RecCardModel } from '../model/types';
import { ClipCountIcon } from './card-icons';
import { toneClass } from './tone';
import styles from './rec-card.module.css';

/**
 * RecCard — 추천 캐러셀 카드(334×334). 측정: 풀스크롤 2087:70384 §4 / 재필터 2278:135621 §4-1.
 * entities는 router 의존 ❌ → onSelect(id) 콜백만 노출(widget이 navigate 연결).
 */
export interface RecCardProps {
  model: RecCardModel;
  onSelect?: (id: string) => void;
}

export function RecCard({ model, onSelect }: RecCardProps) {
  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.thumb}>
        {model.thumbnailUrl ? (
          <img className={styles.thumbImg} src={model.thumbnailUrl} alt="" />
        ) : null}
        <span className={styles.clipBadge}>
          <ClipCountIcon size={16} />
          {model.clipCount}개
        </span>
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{model.title}</span>
        <span className={styles.authorRow}>
          <span className={[styles.role, toneClass(model.author.tone, styles)].join(' ')}>
            {model.author.role}
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.affiliation}>{model.author.affiliation}</span>
        </span>
        <span className={styles.summary}>{model.summary}</span>
        <span className={styles.tags}>
          {model.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
