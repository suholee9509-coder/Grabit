import { Avatar } from '@/shared/ui';
import { formatClockInterval, type PublicClip } from '@/entities/clip';
import { formatRelativeTime } from '@/entities/content';
import { cohortLabel } from '../model/cohort';
import { CastIcon, HeartIcon } from './icons';
import styles from './insight-card.module.css';

/**
 * 인사이트 카드 — "인상깊게 본 인사이트"(2087:12538 §7.3, 298×208).
 * 채널 아바타18 + "EO 채널" + 코호트 라벨(violet) + 인용메모(14/160%) + 구간카드 + 좋아요·시간.
 * ★ 메모/구간만(코호트는 익명 라벨). user_id/실명 없음. 클릭→해당 구간 seek.
 */
export interface InsightCardProps {
  clip: PublicClip;
  /** 채널명(콘텐츠 메타에서 — 동일 콘텐츠). */
  channel: string;
  /** 채널 아바타 URL. */
  channelAvatar?: string;
  /** 카드 클릭 → seek(startSec). */
  onSeek?: (startSec: number) => void;
  /** 좋아요 수(목 — DM1 옵션1). */
  likeCount?: number;
}

export function InsightCard({
  clip,
  channel,
  channelAvatar,
  onSeek,
  likeCount = 0,
}: InsightCardProps) {
  const label = cohortLabel(clip);
  const time = formatRelativeTime(clip.createdAt);
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onSeek?.(clip.startSec)}
    >
      <div className={styles.top}>
        <div className={styles.channelRow}>
          <Avatar size="xs" src={channelAvatar} initials={channel.slice(0, 1)} />
          <span className={styles.channel}>{channel}</span>
          {label ? <span className={styles.cohort}>{label}</span> : null}
        </div>
        <p className={styles.memo}>{clip.memo}</p>
      </div>

      <div className={styles.intervalCard}>
        <span className={styles.intervalIcon}>
          <CastIcon size={18} />
        </span>
        <span className={styles.intervalLabel}>
          {formatClockInterval({ startSec: clip.startSec, endSec: clip.endSec })}
        </span>
      </div>

      <div className={styles.footer}>
        <span className={styles.likes}>
          <HeartIcon size={16} />
          <span className={styles.likeCount}>{likeCount}</span>
        </span>
        {time ? <span className={styles.time}>{time}</span> : null}
      </div>
    </button>
  );
}
