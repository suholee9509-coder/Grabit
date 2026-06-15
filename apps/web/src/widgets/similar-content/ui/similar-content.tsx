import type { SimilarContentDto } from '@/shared/api';
import { formatGrabCount } from '@/entities/content';
import styles from './similar-content.module.css';

/**
 * SimilarContent — "비슷한 컨텐츠" 캐러셀(측정 2087:12538 §7.4, 252×232 카드 + 우측 -90deg 페이드).
 *   카드: 썸네일 252×142(radius6) + play 오버레이(YT 아이콘 #ED1D24) + 제목 2줄 + 태그칩 ×2 + 그랩수.
 *   클릭 → 해당 콘텐츠 상세로 라우팅. 0건 → 빈상태.
 */
export interface SimilarContentProps {
  items: SimilarContentDto[];
  /** 카드 클릭 → /content/:id 라우팅. */
  onSelect?: (id: string) => void;
  loading?: boolean;
}

/** play 오버레이 YT 아이콘(측정 24×24 #ED1D24). */
function YoutubeGlyph() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="3.2" fill="currentColor" />
      <path d="M10 9.2l5 2.8-5 2.8V9.2z" fill="#ffffff" />
    </svg>
  );
}

export function SimilarContent({ items, onSelect, loading = false }: SimilarContentProps) {
  return (
    <section className={styles.root} aria-label="비슷한 컨텐츠">
      <h2 className={styles.title}>비슷한 컨텐츠</h2>

      {loading ? (
        <div className={styles.row}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={[styles.card, styles.skeleton].join(' ')} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className={styles.empty}>관련된 컨텐츠를 아직 찾지 못했어요.</p>
      ) : (
        <div className={styles.scroller}>
          <div className={styles.row}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.card}
                onClick={() => onSelect?.(item.id)}
              >
                <span className={styles.thumbWrap}>
                  <span
                    className={styles.thumb}
                    style={
                      item.thumbnailUrl
                        ? { backgroundImage: `url(${item.thumbnailUrl})` }
                        : undefined
                    }
                  />
                  <span className={styles.playOverlay}>
                    <YoutubeGlyph />
                  </span>
                </span>

                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.metaRow}>
                    <span className={styles.tags}>
                      {item.tags.slice(0, 2).map((t) => (
                        <span key={t} className={styles.tag}>
                          {t}
                        </span>
                      ))}
                    </span>
                    <span className={styles.grab}>{formatGrabCount(item.clipCount)}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
          <span className={styles.fade} aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
