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

/** 코호트 랭킹 1행(직군별 그랩 수 집계). */
export interface CohortRank {
  /** 직군 라벨(공개된 코호트만; 미공개 묶음은 "이 외 직군"). */
  job: string;
  /** 그랩 수(해당 직군 클립 수). */
  count: number;
  /** 임계 미달 묶음(이 외 직군)인지. */
  isOther: boolean;
}

/**
 * 직군별 랭킹 도출 — cohort_revealed 그룹만 집계, 미공개는 "이 외 직군" 단일 버킷.
 * count 내림차순. 동률은 직군명 사전순(결정론).
 */
export function deriveCohortRanking(clips: PublicClip[]): CohortRank[] {
  const byJob = new Map<string, number>();
  let other = 0;
  for (const c of clips) {
    if (c.cohortRevealed && c.cohortJob != null) {
      byJob.set(c.cohortJob, (byJob.get(c.cohortJob) ?? 0) + 1);
    } else {
      other += 1;
    }
  }
  const ranked: CohortRank[] = [...byJob.entries()]
    .map(([job, count]) => ({ job, count, isOther: false }))
    .sort((a, b) => (b.count - a.count) || a.job.localeCompare(b.job));
  if (other > 0) {
    ranked.push({ job: '이 외 직군', count: other, isOther: true });
  }
  return ranked;
}

/** "이 컨텐츠를 [코호트]가 많이 봤어요" 배너 라벨 — 최상위 공개 코호트. 없으면 null(배너 숨김). */
export function topCohortLabel(clips: PublicClip[]): string | null {
  const ranking = deriveCohortRanking(clips).filter((r) => !r.isOther);
  if (ranking.length === 0) return null;
  // 최상위 직군 + 대표 연차 버킷(가장 흔한 연차).
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
  return topYears ? `${topJob} ${topYears}` : topJob;
}
