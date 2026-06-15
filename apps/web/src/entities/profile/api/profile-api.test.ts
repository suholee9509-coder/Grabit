import { describe, it, expect, beforeEach } from 'vitest';
import {
  toCompleteArgs,
  saveOnboarding,
  fetchIsOnboarded,
  resetMockOnboarding,
} from './profile-api';
import { emptyOnboardingInput } from '../model/types';

describe('toCompleteArgs (클라 사전 검증)', () => {
  it('단일 필수 누락 시 throw', () => {
    expect(() => toCompleteArgs({ ...emptyOnboardingInput })).toThrow('JOB_REQUIRED');
    expect(() =>
      toCompleteArgs({ job: '개발자', years: null, interests: ['디자인'], goal: '취업 · 이직' }),
    ).toThrow('YEARS_REQUIRED');
  });

  it('관심분야 0개 → INTERESTS_MIN, 6개 → INTERESTS_MAX', () => {
    const base = { job: '개발자', years: '2~3년차', goal: '취업 · 이직' };
    expect(() => toCompleteArgs({ ...base, interests: [] })).toThrow('INTERESTS_MIN');
    expect(() =>
      toCompleteArgs({ ...base, interests: ['a', 'b', 'c', 'd', 'e', 'f'] }),
    ).toThrow('INTERESTS_MAX');
  });

  it('정상 입력 → RPC 인자 매핑(p_job/p_years/p_goal/p_interests)', () => {
    const args = toCompleteArgs({
      job: '개발자',
      years: '2~3년차',
      interests: ['디자인', ' 프로그래밍 '],
      goal: '취업 · 이직',
    });
    expect(args).toEqual({
      p_job: '개발자',
      p_years: '2~3년차',
      p_goal: '취업 · 이직',
      p_interests: ['디자인', '프로그래밍'], // trim 적용
    });
  });
});

describe('mock 저장·게이트 (Supabase 미배선 폴백)', () => {
  beforeEach(() => resetMockOnboarding());

  it('saveOnboarding → 완료 플래그 set, fetchIsOnboarded true', async () => {
    expect(await fetchIsOnboarded()).toBe(false);
    const profile = await saveOnboarding({
      job: '개발자',
      years: '2~3년차',
      interests: ['디자인'],
      goal: '취업 · 이직',
    });
    expect(profile.onboarded_at).not.toBeNull();
    expect(profile.job).toBe('개발자');
    expect(await fetchIsOnboarded()).toBe(true);
  });
});
