import { formatClockInterval, type PublicClip } from '@/entities/clip';
import { deriveCohortRanking, type TopCohortChips } from '../model/cohort';
import { CohortBanner } from './cohort-banner';
import { CastIcon, ChevronRightIcon } from './icons';
import styles from './popular-segments.module.css';

/**
 * "가장 인기있는 구간" — 측정 2087:12538 §7.2 (2패널 헤더 나란히).
 * 좌 카드(772): 헤더=코호트 배너(직군/연차 칩) + 코호트 랭킹 1~4(연차 3색 스택 막대) + 연차 범례.
 * 우 카드(360): 헤더="가장 인기있는 구간" 제목 + 인기 클립 리스트(썸네일 + 구간 + "N명이 그랩함" + 화살표).
 * ★ 막대 = 연차 버킷 스택(violet/mint/magenta=범례). 인기 클립 클릭→seek.
 */
export interface PopularSegmentsProps {
  /** 공개 클립(인사이트) — 랭킹/막대/리스트 소스. */
  clips: PublicClip[];
  /** 좌 카드 헤더 코호트 칩(직군/연차). null이면 헤더 텍스트 생략. */
  cohort: TopCohortChips | null;
  /** 인기 클립 클릭 → seek(startSec). */
  onSeek?: (startSec: number) => void;
  /** 인기 클립 썸네일 폴백. */
  thumbnailUrl?: string | null;
}

/** 연차 버킷 스택 색(YEARS_BUCKETS 순 — ~2/3~5/6~9년차). 범례와 공유. */
const BUCKET_TONE = [styles.toneViolet, styles.toneMint, styles.toneMagenta];
const RANK_LABEL_TONE = [styles.rankFirst, styles.rankSecond, styles.rankThird, styles.rankFourth];

const YEARS_LEGEND = [
  { label: '~2년차', tone: styles.toneViolet },
  { label: '3~5년차', tone: styles.toneMint },
  { label: '6~9년차', tone: styles.toneMagenta },
];

/** 클립별 "N명이 그랩함" 그랩 수(목) — 구간 길이 기반 결정론 합성(BE 신규 ❌). */
function grabCount(clip: PublicClip): number {
  const span = Math.max(1, clip.endSec - clip.startSec);
  return 3 + (span % 7); // 3~9명(결정론)
}

export function PopularSegments({ clips, cohort, onSeek, thumbnailUrl }: PopularSegmentsProps) {
  const ranking = deriveCohortRanking(clips).slice(0, 4);
  const maxCount = Math.max(1, ...ranking.map((r) => r.count));

  // 인기 구간 = 구간 길이 상위 3(시작초 기준 결정론 정렬).
  const topClips = [...clips]
    .sort((a, b) => b.endSec - b.startSec - (a.endSec - a.startSec) || a.startSec - b.startSec)
    .slice(0, 3);

  const empty = clips.length === 0;

  return (
    <div className={styles.grid}>
      {/* 좌: 헤더=코호트 배너 + 카드(랭킹 + 막대) */}
      <div className={styles.col}>
        <div className={styles.headerSlot}>
          <CohortBanner cohort={cohort} />
        </div>
        <div className={styles.leftCard}>
          {empty ? (
            <p className={styles.emptyText}>아직 그랩한 사람이 없어요.</p>
          ) : (
            <>
              <ol className={styles.ranking}>
                {ranking.map((r, i) => {
                  const total = r.yearsBreakdown.reduce((a, b) => a + b, 0) || r.count;
                  return (
                    <li key={r.job} className={styles.rankRow}>
                      <span className={styles.rankBadge}>{i + 1}</span>
                      <span className={styles.rankBars} aria-hidden="true">
                        <span
                          className={styles.rankBarStack}
                          style={{ width: `${Math.round((r.count / maxCount) * 100)}%` }}
                        >
                          {r.yearsBreakdown.map((seg, bi) =>
                            seg > 0 ? (
                              <span
                                key={bi}
                                className={[styles.rankBarSeg, BUCKET_TONE[bi]].join(' ')}
                                style={{ flexGrow: seg / total }}
                              />
                            ) : null,
                          )}
                        </span>
                      </span>
                      <span className={[styles.rankLabel, RANK_LABEL_TONE[i] ?? ''].join(' ')}>
                        {r.job}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className={styles.yearsLegend}>
                {YEARS_LEGEND.map((y) => (
                  <span key={y.label} className={styles.legendItem}>
                    <span className={[styles.legendDot, y.tone].join(' ')} />
                    <span className={styles.legendLabel}>{y.label}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 우: 헤더=제목 + 카드(인기 클립 리스트) */}
      <div className={styles.col}>
        <div className={styles.headerSlot}>
          <h3 className={styles.title}>가장 인기있는 구간</h3>
        </div>
        <div className={styles.rightCard}>
          {empty ? (
            <p className={styles.emptyText}>인기 구간이 아직 없어요.</p>
          ) : (
            <ul className={styles.clipList}>
              {topClips.map((c) => (
                <li key={c.clipId} className={styles.clipRow}>
                  <button
                    type="button"
                    className={styles.clipButton}
                    onClick={() => onSeek?.(c.startSec)}
                  >
                    <span
                      className={styles.clipThumb}
                      style={
                        thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined
                      }
                    />
                    <span className={styles.clipText}>
                      <span className={styles.clipInterval}>
                        <CastIcon size={18} />
                        {formatClockInterval({ startSec: c.startSec, endSec: c.endSec })}
                      </span>
                      <span className={styles.clipGrab}>{grabCount(c)}명이 그랩함</span>
                    </span>
                    <span className={styles.clipArrow}>
                      <ChevronRightIcon size={20} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
