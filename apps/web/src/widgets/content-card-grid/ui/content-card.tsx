import { formatCount, SourceIcon, type LibraryCard } from '@/entities/content';
import { sanitizeUserText } from '@/shared/lib';
import { ClipCountIcon, CheckIcon } from './icons';
import styles from './content-card.module.css';

/**
 * ContentCard — 라이브러리 그리드 카드(2117:22169 / 23234, h232 · 썸네일 249×142 r6).
 *   썸네일(소스 배지 blur) + 제목(15/Medium/130 #FAFAFA 2줄) + 메타[태그칩 h28 + 클립수 N개].
 *   폴더별 뷰(folder 컨텍스트)는 메타가 [출처 + 날짜](2117:23135 사이드 카드)이나 본문 그리드는
 *   동일 [태그 + N개] 구성(측정 §7) — 본문 카드는 태그/클립수 유지, 출처는 썸네일 배지로 노출.
 * 다중선택 = selected(체크 오버레이 + 보더 강조, u0c 패턴). 클릭 = onOpen(라우팅) 또는 onToggleSelect.
 */
export interface ContentCardProps {
  card: LibraryCard;
  /** 다중선택 모드(체크박스 노출). */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** 카드 본문 클릭 → 상세(selectable=false일 때). */
  onOpen?: () => void;
}

export function ContentCard({
  card,
  selectable = false,
  selected = false,
  onToggleSelect,
  onOpen,
}: ContentCardProps) {
  const title = sanitizeUserText(card.title) || '제목 없음';
  const handleClick = () => {
    if (selectable) onToggleSelect?.();
    else onOpen?.();
  };

  return (
    <button
      type="button"
      className={[styles.card, selected ? styles.selected : ''].filter(Boolean).join(' ')}
      onClick={handleClick}
      aria-pressed={selectable ? selected : undefined}
    >
      <div className={styles.thumb}>
        {card.thumbnailUrl ? (
          <img className={styles.thumbImg} src={card.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <span className={styles.thumbFallback} aria-hidden="true" />
        )}
        <span className={styles.sourceBadge} aria-hidden="true">
          <SourceIcon provider={card.provider} />
        </span>
        {selectable ? (
          <span className={[styles.check, selected ? styles.checkOn : ''].filter(Boolean).join(' ')}>
            {selected ? <CheckIcon /> : null}
          </span>
        ) : null}
      </div>

      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <div className={styles.meta}>
          <div className={styles.tags}>
            {card.tags.slice(0, 2).map((t) => (
              <span key={t} className={styles.tagChip}>
                {sanitizeUserText(t)}
              </span>
            ))}
          </div>
          <span className={styles.count}>
            <ClipCountIcon />
            {formatCount(card.grabCount)}
          </span>
        </div>
      </div>
    </button>
  );
}
