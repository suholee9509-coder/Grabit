import { formatClockInterval, type PublicClip } from '@/entities/clip';
import { deriveCohortRanking } from '../model/cohort';
import { CastIcon, ChevronRightIcon } from './icons';
import styles from './popular-segments.module.css';

/**
 * "가장 인기있는 구간" — 측정 2087:12538 §7.2.
 * 좌 카드(772×321): 코호트 랭킹 1~4 + 직군별 막대 + 연차 범례.
 * 우 카드(360×321): 인기 클립 리스트(썸네일70×40 + 라벨 + 구간 + 화살표).
 * ★ 코호트 랭킹은 cohort_revealed 그룹 집계(임계 미달=이 외 직군). 인기 클립 클릭→seek.
 */
export interface PopularSegmentsProps {
  /** 공개 클립(인사이트) — 랭킹/막대/리스트 소스. */
  clips: PublicClip[];
  /** 인기 클립 클릭 → seek(startSec). */
  onSeek?: (startSec: number) => void;
  /** 인기 클립 썸네일 폴백. */
  thumbnailUrl?: string | null;
}

const TONE_CLASS = [styles.toneViolet, styles.toneMint, styles.toneMagenta];
const RANK_LABEL_TONE = [styles.rankFirst, styles.rankSecond, styles.rankThird, styles.rankFourth];

const YEARS_LEGEND = [
  { label: '~2년차', tone: styles.toneViolet },
  { label: '3~5년차', tone: styles.toneMint },
  { label: '6~9년차', tone: styles.toneMagenta },
];

export function PopularSegments({ clips, onSeek, thumbnailUrl }: PopularSegmentsProps) {
  const ranking = deriveCohortRanking(clips).slice(0, 4);
  const maxCount = Math.max(1, ...ranking.map((r) => r.count));

  // 인기 구간 = density(중복 그랩) 상위 3 구간(시작초 기준 결정론 정렬).
  const topClips = [...clips]
    .sort((a, b) => b.endSec - b.startSec - (a.endSec - a.startSec) || a.startSec - b.startSec)
    .slice(0, 3);

  const empty = clips.length === 0;

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>가장 인기있는 구간</h3>

      <div className={styles.grid}>
        {/* 좌: 코호트 랭킹 + 막대 */}
        <div className={styles.leftCard}>
          {empty ? (
            <p className={styles.emptyText}>아직 그랩한 사람이 없어요.</p>
          ) : (
            <>
              <ol className={styles.ranking}>
                {ranking.map((r, i) => (
                  <li key={r.job} className={styles.rankRow}>
                    <span className={styles.rankBadge}>{i + 1}</span>
                    <span className={styles.rankBars} aria-hidden="true">
                      <span
                        className={[styles.rankBar, TONE_CLASS[i % TONE_CLASS.length]].join(' ')}
                        style={{ width: `${Math.round((r.count / maxCount) * 100)}%` }}
                      />
                    </span>
                    <span className={[styles.rankLabel, RANK_LABEL_TONE[i] ?? ''].join(' ')}>
                      {r.job}
                    </span>
                  </li>
                ))}
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

        {/* 우: 인기 클립 리스트 */}
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
                        thumbnailUrl
                          ? { backgroundImage: `url(${thumbnailUrl})` }
                          : undefined
                      }
                    />
                    <span className={styles.clipText}>
                      <span className={styles.clipInterval}>
                        <CastIcon size={18} />
                        {formatClockInterval({ startSec: c.startSec, endSec: c.endSec })}
                      </span>
                      <span className={styles.clipGrab}>그랩한 구간</span>
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
