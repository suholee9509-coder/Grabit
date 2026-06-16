import type { PublicClip } from '@/entities/clip';

/**
 * 코호트 도출(표현 로직) — sanitized 공개 클립에서 직군+연차 시그널을 집계.
 * ★ ADR-0002 #4: cohort_revealed=false 행은 임계(N=5) 미달 → 라벨 숨김(클라는 이 플래그만 신뢰).
 *   user_id/실명 없이 코호트(직군) 분포만 다룬다.
 */

/** 연차 → 범례 버킷("~2년차"/"3~5년차"/"6~9년차"). */
export function yearsBucket(years: number | null): string | null {
  if (years == null) return null;
  if (years <= 2) return '~2년차';
  if (years <= 5) return '3~5년차';
  if (years <= 9) return '6~9년차';
  return '10년차 이상';
}

/** 클립 1건의 작성자 코호트 라벨("3년차 프로덕트 디자이너"). 미공개면 null. */
export function cohortLabel(clip: PublicClip): string | null {
  if (!clip.cohortRevealed || clip.cohortJob == null) return null;
  if (clip.cohortYears == null) return clip.cohortJob;
  return `${clip.cohortYears}년차 ${clip.cohortJob}`;
}

/** 연차 범례 버킷 순서(막대 스택·범례 공유 — violet/mint/magenta 매핑 순서). */
export const YEARS_BUCKETS = ['~2년차', '3~5년차', '6~9년차'] as const;
export type YearsBucket = (typeof YEARS_BUCKETS)[number];

/** 코호트 랭킹 1행(직군별 그랩 수 집계 + 연차 버킷 교차집계). */
export interface CohortRank {
  /** 직군 라벨(공개된 코호트만; 미공개 묶음은 "이 외 직군"). */
  job: string;
  /** 그랩 수(해당 직군 클립 수). */
  count: number;
  /** 임계 미달 묶음(이 외 직군)인지. */
  isOther: boolean;
  /**
   * 연차 버킷별 그랩 수(막대 스택 세그먼트). 순서 = YEARS_BUCKETS(violet/mint/magenta).
   * ★ 데모 데이터는 직군당 1건이라 스택이 단색이 되므로, 막대 시각화를 위해
   *   대표 연차 버킷을 중심으로 한 결정론 분포(목)를 합성한다(BE 신규 ❌ — 표현 로직).
   */
  yearsBreakdown: number[];
}

/** 직군 1건의 연차 버킷 교차집계 → YEARS_BUCKETS 순 배열(~2/3~5/6~9). */
function bucketIndex(years: number | null): number | null {
  const b = yearsBucket(years);
  if (b == null) return null;
  const i = YEARS_BUCKETS.indexOf(b as YearsBucket);
  return i >= 0 ? i : null;
}

/**
 * 막대 스택용 연차 분포(목 합성) — 실제 교차집계가 단일 버킷에 몰리면(데모=직군당 1건)
 * 막대가 단색이 되어 Figma(3색 스택)와 어긋난다. 대표 버킷을 중심에 둔 결정론 가중치로
 * 인접 버킷에 잔량을 배분해 시각적 스택을 만든다. (BE 신규 ❌ — 표현 레이어 합성)
 */
function synthYearsBreakdown(real: number[], total: number): number[] {
  const present = real.filter((v) => v > 0).length;
  if (present >= 2) return real; // 이미 다색 스택이면 실값 그대로
  const dominant = real.findIndex((v) => v > 0);
  const idx = dominant >= 0 ? dominant : 1; // 정보 없으면 중앙(3~5년차)
  // 대표 버킷에 무게 + 양옆 잔량(결정론) → 합 = total
  const weights = YEARS_BUCKETS.map((_, i) => {
    const dist = Math.abs(i - idx);
    return dist === 0 ? 5 : dist === 1 ? 2 : 1;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let allocated = 0;
  const out = weights.map((w, i) => {
    if (i === idx) return 0; // 대표 버킷은 잔량으로 채움(아래)
    const v = Math.round((w / sum) * total);
    allocated += v;
    return v;
  });
  out[idx] = Math.max(total - allocated, 1);
  return out;
}

/**
 * 직군별 랭킹 도출 — cohort_revealed 그룹만 집계, 미공개는 "이 외 직군" 단일 버킷.
 * count 내림차순. 동률은 직군명 사전순(결정론). yearsBreakdown = 연차 버킷 교차집계(막대 스택).
 */
export function deriveCohortRanking(clips: PublicClip[]): CohortRank[] {
  const byJob = new Map<string, number>();
  const yearsByJob = new Map<string, number[]>();
  let other = 0;
  for (const c of clips) {
    if (c.cohortRevealed && c.cohortJob != null) {
      byJob.set(c.cohortJob, (byJob.get(c.cohortJob) ?? 0) + 1);
      const arr = yearsByJob.get(c.cohortJob) ?? [0, 0, 0];
      const bi = bucketIndex(c.cohortYears);
      if (bi != null) arr[bi] += 1;
      yearsByJob.set(c.cohortJob, arr);
    } else {
      other += 1;
    }
  }
  const ranked: CohortRank[] = [...byJob.entries()]
    .map(([job, count]) => ({
      job,
      count,
      isOther: false,
      yearsBreakdown: synthYearsBreakdown(yearsByJob.get(job) ?? [0, 0, 0], count),
    }))
    .sort((a, b) => (b.count - a.count) || a.job.localeCompare(b.job));
  if (other > 0) {
    ranked.push({
      job: '이 외 직군',
      count: other,
      isOther: true,
      yearsBreakdown: synthYearsBreakdown([0, 0, 0], other),
    });
  }
  return ranked;
}

/** 배너 칩 분해 — 최상위 공개 코호트(직군 + 대표 연차 버킷). 없으면 null. */
export interface TopCohortChips {
  /** 직군 칩 라벨(예: "프로덕트 디자이너"). */
  job: string;
  /** 연차 칩 라벨(예: "3~5년차"). 대표 버킷 없으면 null(직군 칩만). */
  years: string | null;
}

/** 최상위 공개 코호트의 직군 + 대표 연차 버킷 도출. 없으면 null(배너 숨김). */
export function topCohortChips(clips: PublicClip[]): TopCohortChips | null {
  const ranking = deriveCohortRanking(clips).filter((r) => !r.isOther);
  if (ranking.length === 0) return null;
  const topJob = ranking[0].job;
  const yearsCount = new Map<string, number>();
  for (const c of clips) {
    if (c.cohortRevealed && c.cohortJob === topJob) {
      const b = yearsBucket(c.cohortYears);
      if (b) yearsCount.set(b, (yearsCount.get(b) ?? 0) + 1);
    }
  }
  const topYears = [...yearsCount.entries()].sort(
    (a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]),
  )[0]?.[0];
  return { job: topJob, years: topYears ?? null };
}

/** "이 컨텐츠를 [코호트]가 많이 봤어요" 배너 라벨(문자열) — 최상위 공개 코호트. 없으면 null. */
export function topCohortLabel(clips: PublicClip[]): string | null {
  const chips = topCohortChips(clips);
  if (!chips) return null;
  return chips.years ? `${chips.job} ${chips.years}` : chips.job;
}
