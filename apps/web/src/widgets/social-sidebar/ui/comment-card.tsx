import { useState } from 'react';
import { Avatar } from '@/shared/ui';
import type { MockComment, MockReply } from '@/entities/annotation';
import styles from './comment-card.module.css';

/**
 * 댓글/답글 카드 — 측정 2087:12538 §8 (우측 사이드바 카드 스택, w410).
 * ★ DM1 옵션1: 픽셀퍼펙트 UI + 데이터 목킹(DEMO_COMMENTS). 좋아요 = 비활성(BE 미호출).
 *   작성자 실명/아바타는 목 상수 한정. 메모/답글은 텍스트 렌더(XSS — React 기본 이스케이프).
 *   [A4] "답글 N개 모두 보기" = 로컬 펼침(목 replies 들여쓰기 렌더, BE 미호출).
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
/** 답글(코멘트) 아이콘 — footer 좋아요 우측(측정 2087:12538 §8: 둥근 사각 + 플러스). */
function ReplyGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.2a1.7 1.7 0 0 1 1.7-1.7h7.6a1.7 1.7 0 0 1 1.7 1.7v5a1.7 1.7 0 0 1-1.7 1.7H6.4L3 13.5v-2.6h-.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 5.3v3M6.5 6.8h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
/** "모두 보기" 펼침 chevron — 펼침 시 180° 회전. */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={open ? styles.chevronOpen : styles.chevron}
    >
      <path
        d="M3.5 5.25 7 8.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 답글 카드 — 댓글 카드 축소형(아바타·이름·코호트·시간·메모), 들여쓰기. */
function ReplyCard({ reply }: { reply: MockReply }) {
  return (
    <article className={styles.reply}>
      <header className={styles.head}>
        <Avatar size="xs" initials={reply.authorInitials} />
        <span className={styles.author}>{reply.authorName}</span>
        <span className={styles.cohort}>{reply.cohortLabel}</span>
        <span className={styles.time}>{reply.timeLabel}</span>
      </header>

      <p className={styles.replyBody}>{reply.body}</p>

      <footer className={styles.footer}>
        {/* DM1: 좋아요 비활성(목 카운트만, 클릭 BE 미호출) */}
        <span className={styles.likes} aria-label={`좋아요 ${reply.likeCount}`}>
          <HeartIcon />
          <span className={styles.likeCount}>{reply.likeCount}</span>
        </span>
      </footer>
    </article>
  );
}

export interface CommentCardProps {
  comment: MockComment;
}

export function CommentCard({ comment }: CommentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasReplies = comment.totalReplies > 0;

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
        {/* DM1: 답글 작성 비활성(아이콘 셸만, 클릭 BE 미호출) */}
        <span className={styles.replyGlyph} aria-hidden="true">
          <ReplyGlyph />
        </span>
        {hasReplies ? (
          <>
            <span className={styles.sep} aria-hidden="true" />
            {/* [A4] 답글 스레드 로컬 펼침(목 replies 렌더, BE 미호출) */}
            <button
              type="button"
              className={styles.moreReplies}
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              답글 {comment.totalReplies}개 모두 보기
              <ChevronIcon open={expanded} />
            </button>
          </>
        ) : null}
      </footer>

      {hasReplies && expanded ? (
        <div className={styles.replyThread}>
          {comment.replies.map((r) => (
            <ReplyCard key={r.id} reply={r} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
