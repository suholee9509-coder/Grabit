import type { SearchContentItem } from '../model/search';
import { SourceLogo } from './source-logo';
import { ClipCountIcon } from './card-icons';
import styles from './content-card.module.css';

/**
 * ContentCard — 검색 결과/추천 공용 카드. 측정 정본: 결과 2087:38955 · 추천 3253:7338.
 *   카드 column gap14 → [썸네일 142h radius6 + 출처 로고배지(6,6)] + [정보블록 gap10: 제목(15/500/130%/-2.5% #FAFAFA 2줄) +
 *   메타행 gap12: 태그칩 2개(28h radius6 surface-hover 13/400/160% #CECECE) + 클립수(아이콘18 gap4 "N개" 14/400/130% #999)].
 * entities → onSelect 콜백만(라우팅은 상위). 비인터랙티브 태그는 span(Chip 미사용 — 실측 구조).
 */
export interface ContentCardProps {
  model: SearchContentItem;
  onSelect?: (id: string) => void;
}

export function ContentCard({ model, onSelect }: ContentCardProps) {
  // 카드 표면 태그 = 본인 부착 태그 중 앞 2개(측정: 태그 2개).
  const tags = model.tags.slice(0, 2);

  return (
    <button type="button" className={styles.card} onClick={() => onSelect?.(model.id)}>
      <span className={styles.thumb}>
        {model.thumbnailUrl ? (
          <img className={styles.thumbImg} src={model.thumbnailUrl} alt="" />
        ) : (
          <span className={styles.thumbFallback} aria-hidden="true" />
        )}
        {/* 출처 로고 배지(우상단) — 측정: (6,6) rgba(0,0,0,.32)+blur2px radius6, 내부 로고 24 */}
        <span className={styles.sourceBadge}>
          <SourceLogo provider={model.provider} size={24} />
        </span>
      </span>

      <span className={styles.info}>
        <span className={styles.title}>{model.title}</span>
        <span className={styles.metaRow}>
          <span className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </span>
          <span className={styles.clipCount}>
            <span className={styles.clipIcon}>
              <ClipCountIcon size={18} />
            </span>
            {model.clipCount}개
          </span>
        </span>
      </span>
    </button>
  );
}
