import { describe, it, expect, beforeEach } from 'vitest';
import {
  toCompleteArgs,
  saveOnboarding,
  fetchIsOnboarded,
  resetMockOnboarding,
  toUpdateArgs,
  getMyProfile,
  updateProfile,
  softDeleteAccount,
  restoreAccount,
  getNotificationPrefs,
  setNotificationPref,
  resetMockNotificationPrefs,
  mergeNotificationState,
} from './profile-api';
import { emptyOnboardingInput, type ProfileEditInput } from '../model/types';

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
    expect(profile.deleted_at).toBeNull();
    expect(await fetchIsOnboarded()).toBe(true);
  });
});

// ── u11 ─────────────────────────────────────────────────────────────────────
const validEdit: ProfileEditInput = {
  display_name: 'Leesuho',
  job: '개발자',
  years: '2~3년차',
  interests: ['프로그래밍', '커리어'],
  goal: '역량 강화 · 스킬업',
};

describe('toUpdateArgs (클라 사전 검증 — update_profile)', () => {
  it('빈/공백 표시이름 → DISPLAY_NAME_REQUIRED', () => {
    expect(() => toUpdateArgs({ ...validEdit, display_name: '' })).toThrow('DISPLAY_NAME_REQUIRED');
    expect(() => toUpdateArgs({ ...validEdit, display_name: '   ' })).toThrow(
      'DISPLAY_NAME_REQUIRED',
    );
  });

  it('단일 필수 누락 → JOB/YEARS/GOAL_REQUIRED', () => {
    expect(() => toUpdateArgs({ ...validEdit, job: null })).toThrow('JOB_REQUIRED');
    expect(() => toUpdateArgs({ ...validEdit, years: null })).toThrow('YEARS_REQUIRED');
    expect(() => toUpdateArgs({ ...validEdit, goal: null })).toThrow('GOAL_REQUIRED');
  });

  it('관심분야 0개 → INTERESTS_MIN, 6개 → INTERESTS_MAX', () => {
    expect(() => toUpdateArgs({ ...validEdit, interests: [] })).toThrow('INTERESTS_MIN');
    expect(() =>
      toUpdateArgs({ ...validEdit, interests: ['a', 'b', 'c', 'd', 'e', 'f'] }),
    ).toThrow('INTERESTS_MAX');
  });

  it('정상 입력 → p_* 매핑 + 표시이름/관심 무해화(trim·앵글브래킷 제거)', () => {
    const args = toUpdateArgs({
      ...validEdit,
      display_name: '  Lee<script>  ',
      interests: ['  프로그래밍  ', '디자인'],
    });
    expect(args.p_display_name).toBe('Leescript'); // 앵글브래킷 제거 + trim
    expect(args.p_job).toBe('개발자');
    expect(args.p_years).toBe('2~3년차');
    expect(args.p_goal).toBe('역량 강화 · 스킬업');
    expect(args.p_interests).toEqual(['프로그래밍', '디자인']); // trim
  });
});

describe('프로필 라이프사이클 목 폴백 (supabase null 결정론)', () => {
  beforeEach(() => {
    resetMockOnboarding();
    resetMockNotificationPrefs();
  });

  it('getMyProfile → 결정론 시드(display_name·코호트·deleted_at null)', async () => {
    const p = await getMyProfile();
    expect(p.display_name).toBeTruthy();
    expect(p.job).toBeTruthy();
    expect(p.deleted_at).toBeNull();
  });

  it('updateProfile → 목 상태 갱신(재조회 반영)', async () => {
    await updateProfile({ ...validEdit, display_name: 'NewName' });
    const p = await getMyProfile();
    expect(p.display_name).toBe('NewName');
  });

  it('soft_delete → deleted_at 세팅, 멱등(재요청 시 유예시작 보존), restore → null', async () => {
    const d1 = await softDeleteAccount();
    expect(d1.deleted_at).not.toBeNull();
    const d2 = await softDeleteAccount(); // 멱등
    expect(d2.deleted_at).toBe(d1.deleted_at);
    const r = await restoreAccount();
    expect(r.deleted_at).toBeNull();
  });

  it('soft_delete 후 updateProfile → ACCOUNT_DELETED(유예중 수정 차단)', async () => {
    await softDeleteAccount();
    await expect(updateProfile(validEdit)).rejects.toThrow('ACCOUNT_DELETED');
  });
});

describe('알림 설정 목 폴백 (notification_settings 0013)', () => {
  beforeEach(() => resetMockNotificationPrefs());

  it('초기 0건 → 빈 배열, 카탈로그 기본값 병합', async () => {
    expect(await getNotificationPrefs()).toEqual([]);
    const merged = mergeNotificationState([]);
    expect(merged.find((m) => m.category === 'trend')?.enabled).toBe(true);
    expect(merged.find((m) => m.category === 'activity')?.enabled).toBe(false);
  });

  it('set_notification_pref → 저장·조회 반영', async () => {
    await setNotificationPref('trend', false);
    const prefs = await getNotificationPrefs();
    expect(prefs.find((p) => p.category === 'trend')?.enabled).toBe(false);
    const merged = mergeNotificationState(prefs);
    expect(merged.find((m) => m.category === 'trend')?.enabled).toBe(false);
  });

  it('결제 카테고리 → 클라에서도 차단(CATEGORY_BILLING_REJECTED)', async () => {
    await expect(setNotificationPref('billing', true)).rejects.toThrow('CATEGORY_BILLING_REJECTED');
    await expect(setNotificationPref('subscription_expiry', true)).rejects.toThrow(
      'CATEGORY_BILLING_REJECTED',
    );
  });

  it('빈 카테고리 → CATEGORY_REQUIRED', async () => {
    await expect(setNotificationPref('  ', true)).rejects.toThrow('CATEGORY_REQUIRED');
  });
});
