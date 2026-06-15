import { Avatar } from '@/shared/ui';
import type { ContentDetail } from '@/entities/content';
import styles from './source-tab.module.css';

/**
 * 원본 소스 탭 본문 — "원본 컨텐츠 정보" 카드(측정 2087:13354 §6).
 *   좌: 정보 패널(제목·상세 정보·원본 링크) · 우: 썸네일.
 *   라벨 15/Regular/-2.5% #B4B4B4 · 값 15/Medium #FAFAFA(컴포넌트 전용 lh130%).
 */
export interface SourceTabProps {
  detail: ContentDetail;
}

/** 유튜브 아이콘(측정 20×20 #ED1D24). */
function YoutubeGlyph() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1.6" y="5" width="16.8" height="10" rx="2.8" fill="#ed1d24" />
      <path d="M8.3 7.6l4.2 2.4-4.2 2.4V7.6z" fill="#ffffff" />
    </svg>
  );
}

export function SourceTab({ detail }: SourceTabProps) {
  const channel = detail.channel ?? '';
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>원본 컨텐츠 정보</h2>

      <div className={styles.body}>
        <div className={styles.infoPanel}>
          <div className={styles.infoStack}>
            <div className={styles.infoRow}>
              <span className={styles.label}>제목</span>
              <span className={styles.valueStrong}>{detail.title ?? '제목 없음'}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>상세 정보</span>
              <span className={styles.detailValue}>
                <span className={styles.channel}>
                  <Avatar size="sm" src={detail.thumbnailUrl ?? undefined} initials={channel.slice(0, 1)} />
                  <span className={styles.value}>{channel}</span>
                </span>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.value}>조회수 48만회</span>
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>원본 링크</span>
              <span className={styles.linkValue}>
                <span className={styles.platform}>
                  <YoutubeGlyph />
                  <span className={styles.value}>Youtube</span>
                </span>
                <span className={styles.vsep} aria-hidden="true" />
                <a
                  className={styles.url}
                  href={detail.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {detail.canonicalUrl}
                </a>
              </span>
            </div>
          </div>
        </div>

        <div
          className={styles.thumb}
          style={
            detail.thumbnailUrl
              ? { backgroundImage: `url(${detail.thumbnailUrl})` }
              : undefined
          }
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
