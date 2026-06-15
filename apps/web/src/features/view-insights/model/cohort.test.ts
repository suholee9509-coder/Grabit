import { describe, expect, it } from 'vitest';
import type { PublicClip } from '@/entities/clip';
import {
  cohortLabel,
  deriveCohortRanking,
  topCohortLabel,
  yearsBucket,
} from './cohort';

/**
 * cohort 도출 — sanitized 셰이프 위에서 익명 임계(cohort_revealed) 처리 단언.
 *   user_id/실명 없이 직군+연차만 다룬다. revealed=false → 라벨 숨김/이 외 직군 버킷.
 */

function clip(p: Partial<PublicClip>): PublicClip {
  return {
    contentId: 'c-1',
    clipId: Math.random().toString(36).slice(2),
    startSec: 0,
    endSec: 10,
    memo: null,
    cohortJob: null,
    cohortYears: null,
    cohortRevealed: false,
    createdAt: null,
    ...p,
  };
}

describe('cohortLabel', () => {
  it('revealed=true면 "N년차 직군"', () => {
    expect(
      cohortLabel(clip({ cohortJob: '프로덕트 디자이너', cohortYears: 3, cohortRevealed: true })),
    ).toBe('3년차 프로덕트 디자이너');
  });
  it('★revealed=false면 null(라벨 숨김)', () => {
    expect(
      cohortLabel(clip({ cohortJob: '그로스 마케터', cohortYears: 6, cohortRevealed: false })),
    ).toBeNull();
  });
});

describe('deriveCohortRanking', () => {
  it('공개 코호트만 집계, 미공개는 "이 외 직군" 단일 버킷', () => {
    const clips = [
      clip({ cohortJob: '프로덕트 디자이너', cohortYears: 3, cohortRevealed: true }),
      clip({ cohortJob: '프로덕트 디자이너', cohortYears: 4, cohortRevealed: true }),
      clip({ cohortJob: '백엔드 개발자', cohortYears: 5, cohortRevealed: true }),
      clip({ cohortRevealed: false }), // 임계 미달 → 이 외 직군
      clip({ cohortRevealed: false }),
    ];
    const ranking = deriveCohortRanking(clips);
    expect(ranking[0]).toEqual({ job: '프로덕트 디자이너', count: 2, isOther: false });
    expect(ranking[1]).toEqual({ job: '백엔드 개발자', count: 1, isOther: false });
    const other = ranking.find((r) => r.isOther);
    expect(other).toEqual({ job: '이 외 직군', count: 2, isOther: true });
  });
});

describe('topCohortLabel', () => {
  it('최상위 공개 코호트(직군+대표 연차 버킷)', () => {
    const clips = [
      clip({ cohortJob: '프로덕트 디자이너', cohortYears: 4, cohortRevealed: true }),
      clip({ cohortJob: '프로덕트 디자이너', cohortYears: 5, cohortRevealed: true }),
    ];
    expect(topCohortLabel(clips)).toBe('프로덕트 디자이너 3~5년차');
  });
  it('공개 코호트 없으면 null(배너 숨김)', () => {
    expect(topCohortLabel([clip({ cohortRevealed: false })])).toBeNull();
  });
});

describe('yearsBucket', () => {
  it('연차 → 범례 버킷', () => {
    expect(yearsBucket(2)).toBe('~2년차');
    expect(yearsBucket(4)).toBe('3~5년차');
    expect(yearsBucket(8)).toBe('6~9년차');
    expect(yearsBucket(null)).toBeNull();
  });
});
