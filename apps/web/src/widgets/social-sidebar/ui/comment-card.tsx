import { Avatar } from '@/shared/ui';
import type { MockComment } from '@/entities/annotation';
import styles from './comment-card.module.css';

/**
 * 댓글/답글 카드 — 측정 2087:12538 §8 (우측 사이드바 카드 스택, w410).
 * ★ DM1 옵션1: 픽셀퍼펙트 UI + 데이터 목킹(DEMO_COMMENTS). 좋아요/답글펼침 = 비활성(BE 미호출).
 *   작성자 실명/아바타는 목 상수 한정. 메모/답글은 텍스트 렌더(XSS — React 기본 이스케이프).
 */
function HeartIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.5 8 13.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CastIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 3.3h12v9.4h-4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10a3 3 0 0 1 3 3M2 7.3a5.7 5.7 0 0 1 5.7 5.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface CommentCardProps {
  comment: MockComment;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Avatar size="xs" initials={comment.authorInitials} />
        <span className={styles.author}>{comment.authorName}</span>
        <span className={styles.cohort}>{comment.cohortLabel}</span>
        <span className={styles.time}>{comment.timeLabel}</span>
      </header>

      <p className={styles.body}>{comment.body}</p>

      <div className={styles.interval}>
        <span className={styles.intervalIcon}>
          <CastIcon />
        </span>
        <span className={styles.intervalLabel}>{comment.intervalLabel}</span>
      </div>

      <footer className={styles.footer}>
        {/* DM1: 좋아요 비활성(목 카운트만, 클릭 BE 미호출) */}
        <span className={styles.likes} aria-label={`좋아요 ${comment.likeCount}`}>
          <HeartIcon />
          <span className={styles.likeCount}>{comment.likeCount}</span>
        </span>
        {comment.totalReplies > 0 ? (
          <>
            <span className={styles.sep} aria-hidden="true" />
            {/* DM1: 답글 펼침 비활성(스레드 데이터패스 차단) */}
            <span className={styles.moreReplies}>
              답글 {comment.totalReplies}개 모두 보기
            </span>
          </>
        ) : null}
      </footer>
    </article>
  );
}
