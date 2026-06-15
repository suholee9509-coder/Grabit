import { supabase } from '@/shared/api';
import { sanitizeUserText } from '@/shared/lib';
import { INTERESTS_MAX, INTERESTS_MIN, NOTIFICATION_CATEGORIES } from '../model/options';
import type {
  CompleteOnboardingArgs,
  NotificationPref,
  OnboardingInput,
  Profile,
  ProfileEditInput,
  UpdateProfileArgs,
} from '../model/types';

/**
 * 프로필 데이터 표면 (entities/profile/api) — BE 0010 계약 위 TanStack Query 호출.
 * Supabase 미배선(자격 없음/로컬·테스트) 시 결정론적 목으로 폴백 + TODO 주석.
 *
 * 계약(0010):
 *   - rpc complete_onboarding(p_job,p_years,p_goal,p_interests) → public.profiles
 *   - rpc is_onboarded() → boolean (게이팅)
 *   - 42501 = 미인증 · 23514 = 검증(단일필수/관심 1~5)
 */

/** OnboardingInput → RPC 인자. 클라 측 사전 검증(BE가 재검증·무해화 — 이중 방어). */
export function toCompleteArgs(input: OnboardingInput): CompleteOnboardingArgs {
  if (!input.job) throw new Error('JOB_REQUIRED');
  if (!input.years) throw new Error('YEARS_REQUIRED');
  if (!input.goal) throw new Error('GOAL_REQUIRED');
  const interests = input.interests.map((s) => s.trim()).filter(Boolean);
  if (interests.length < INTERESTS_MIN) throw new Error('INTERESTS_MIN');
  if (interests.length > INTERESTS_MAX) throw new Error('INTERESTS_MAX');
  return {
    p_job: input.job,
    p_years: input.years,
    p_goal: input.goal,
    p_interests: interests,
  };
}

/* ── 목 폴백 (BE 미배선 시 결정론) ─────────────────────────────────────────────
 * TODO(BE 배선): Supabase 자격(VITE_SUPABASE_URL/ANON_KEY) 주입 후 목 경로 제거.
 *   현재는 자격 없으면 sessionStorage에 온보딩 완료 상태를 보존(데모/테스트 결정론).
 */
const MOCK_KEY = 'grabit.mock.onboarding';

interface MockState {
  onboarded: boolean;
  profile: Profile | null;
}

function readMock(): MockState {
  if (typeof sessionStorage === 'undefined') return { onboarded: false, profile: null };
  try {
    const raw = sessionStorage.getItem(MOCK_KEY);
    return raw ? (JSON.parse(raw) as MockState) : { onboarded: false, profile: null };
  } catch {
    return { onboarded: false, profile: null };
  }
}

function writeMock(state: MockState): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(MOCK_KEY, JSON.stringify(state));
  } catch {
    /* 무시(테스트 결정론) */
  }
}

/** 온보딩 완료 여부(게이팅). is_onboarded() RPC 또는 목. */
export async function fetchIsOnboarded(): Promise<boolean> {
  if (!supabase) return readMock().onboarded;
  const { data, error } = await supabase.rpc('is_onboarded');
  if (error) throw error;
  return Boolean(data);
}

/** 온보딩 완료 저장. complete_onboarding RPC 또는 목. 검증 실패는 throw(Error code 보존). */
export async function saveOnboarding(input: OnboardingInput): Promise<Profile> {
  const args = toCompleteArgs(input); // 클라 사전 검증(차단 UI 보조)
  if (!supabase) {
    const profile: Profile = {
      id: 'mock-user',
      display_name: null,
      job: args.p_job,
      years: args.p_years,
      goal: args.p_goal,
      interests: args.p_interests,
      onboarded_at: new Date(0).toISOString(), // 결정론(고정 타임스탬프)
      deleted_at: null,
    };
    writeMock({ onboarded: true, profile });
    return profile;
  }
  const { data, error } = await supabase.rpc('complete_onboarding', args);
  if (error) throw error;
  return data as Profile;
}

/** 테스트/로그아웃용 목 리셋(목 경로에서만 의미). */
export function resetMockOnboarding(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(MOCK_KEY);
}

/**
 * 현재 사용자 직군(라벨용, u2) — 자기 행 select(own row, RLS-safe). cross-user 아님.
 * Supabase 미배선 시 목 상태(saveOnboarding이 보존한 job) 폴백. 없으면 null → 화면 폴백 라벨.
 * profiles는 RLS로 본인 행만 read(0010 계약) — user_id 직접 노출 ❌(job 필드만 반환).
 */
export async function fetchMyProfileJob(): Promise<{ job: string | null }> {
  if (!supabase) {
    return { job: readMock().profile?.job ?? null };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('job')
    .maybeSingle();
  if (error) throw error;
  return { job: (data as { job: string | null } | null)?.job ?? null };
}

/* ── u11 프로필 수정 / 라이프사이클 / 알림설정 (0013 계약 소비) ────────────────────────────────
 * 패턴: 온보딩과 동일(supabase null → 결정론 목 + 동일 Error code 보존). 본인 행만(RLS self).
 */

/**
 * ProfileEditInput → update_profile RPC 인자. 클라 사전 검증(BE 0013이 재검증·무해화 — 이중 방어).
 * toCompleteArgs 패턴 미러 + display_name 빈/공백 차단. 표시이름·관심분야는 무해화(XSS 방어 보조).
 */
export function toUpdateArgs(input: ProfileEditInput): UpdateProfileArgs {
  const name = sanitizeUserText(input.display_name, 60);
  if (name === '') throw new Error('DISPLAY_NAME_REQUIRED');
  if (!input.job) throw new Error('JOB_REQUIRED');
  if (!input.years) throw new Error('YEARS_REQUIRED');
  if (!input.goal) throw new Error('GOAL_REQUIRED');
  const interests = input.interests
    .map((s) => sanitizeUserText(s, 40))
    .filter(Boolean);
  if (interests.length < INTERESTS_MIN) throw new Error('INTERESTS_MIN');
  if (interests.length > INTERESTS_MAX) throw new Error('INTERESTS_MAX');
  return {
    p_display_name: name,
    p_job: input.job,
    p_years: input.years,
    p_goal: input.goal,
    p_interests: interests,
  };
}

/** 목 프로필 기본값(자격 없을 때) — 온보딩 목 상태 우선, 없으면 결정론적 시드(데모/테스트). */
function mockProfile(): Profile {
  const saved = readMock().profile;
  if (saved) {
    return { ...saved, display_name: saved.display_name ?? 'Leesuho' };
  }
  return {
    id: 'mock-user',
    display_name: 'Leesuho', // OAuth 이름 초기값 placeholder(결정론)
    job: '개발자',
    years: '2~3년차',
    goal: '역량 강화 · 스킬업',
    interests: ['프로그래밍', '커리어'],
    onboarded_at: new Date(0).toISOString(),
    deleted_at: null,
  };
}

/** 현재 사용자 프로필 조회(자기 행, deleted_at 포함). get_my_profile() RPC 또는 목. */
export async function getMyProfile(): Promise<Profile> {
  if (!supabase) return mockProfile();
  const { data, error } = await supabase.rpc('get_my_profile');
  if (error) throw error;
  return data as Profile;
}

/** 프로필 수정 저장. update_profile RPC 또는 목. 검증 실패는 throw(Error code 보존). */
export async function updateProfile(input: ProfileEditInput): Promise<Profile> {
  const args = toUpdateArgs(input); // 클라 사전 검증(차단 UI 보조)
  if (!supabase) {
    const current = mockProfile();
    if (current.deleted_at) throw new Error('ACCOUNT_DELETED'); // 0013 P0002 패리티(유예중 수정 차단)
    const next: Profile = {
      ...current,
      display_name: args.p_display_name,
      job: args.p_job,
      years: args.p_years,
      goal: args.p_goal,
      interests: args.p_interests,
    };
    writeMock({ onboarded: true, profile: next });
    return next;
  }
  const { data, error } = await supabase.rpc('update_profile', args);
  if (error) throw error;
  return data as Profile;
}

/** 회원 탈퇴(soft-delete, 30일 유예). soft_delete_account() RPC 또는 목. 멱등(이미 deleted 무해). */
export async function softDeleteAccount(): Promise<Profile> {
  if (!supabase) {
    const current = mockProfile();
    const next: Profile = {
      ...current,
      deleted_at: current.deleted_at ?? new Date(0).toISOString(), // 멱등(기존 유예시작 보존)
    };
    writeMock({ onboarded: true, profile: next });
    return next;
  }
  const { data, error } = await supabase.rpc('soft_delete_account');
  if (error) throw error;
  return data as Profile;
}

/** 계정 복구(deleted_at 해제). restore_account() RPC 또는 목. 멱등(live 행 무해). */
export async function restoreAccount(): Promise<Profile> {
  if (!supabase) {
    const next: Profile = { ...mockProfile(), deleted_at: null };
    writeMock({ onboarded: true, profile: next });
    return next;
  }
  const { data, error } = await supabase.rpc('restore_account');
  if (error) throw error;
  return data as Profile;
}

/* ── 알림 설정 (notification_settings 0013) — 비결제 카테고리만 ─────────────────────────────── */
const MOCK_NOTIF_KEY = 'grabit.mock.notification-prefs';

function readMockPrefs(): NotificationPref[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(MOCK_NOTIF_KEY);
    return raw ? (JSON.parse(raw) as NotificationPref[]) : [];
  } catch {
    return [];
  }
}

function writeMockPrefs(prefs: NotificationPref[]): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(MOCK_NOTIF_KEY, JSON.stringify(prefs));
  } catch {
    /* 무시(테스트 결정론) */
  }
}

/** 알림 설정 조회. get_notification_prefs() RPC 또는 목(0건=빈 → 카탈로그 기본값 표기). */
export async function getNotificationPrefs(): Promise<NotificationPref[]> {
  if (!supabase) return readMockPrefs();
  const { data, error } = await supabase.rpc('get_notification_prefs');
  if (error) throw error;
  return (data as NotificationPref[] | null) ?? [];
}

/** 알림 토글 저장(upsert). set_notification_pref(p_category,p_enabled) RPC 또는 목. */
export async function setNotificationPref(
  category: string,
  enabled: boolean,
): Promise<NotificationPref> {
  const cat = sanitizeUserText(category, 40);
  if (cat === '') throw new Error('CATEGORY_REQUIRED');
  // 비결제 가드(0013 CHECK 패리티) — 결제 카테고리는 클라에서도 차단.
  const BILLING = new Set(['billing', 'subscription', 'subscription_expiry', 'receipt', 'payment']);
  if (BILLING.has(cat)) throw new Error('CATEGORY_BILLING_REJECTED');
  if (!supabase) {
    const prefs = readMockPrefs().filter((p) => p.category !== cat);
    const next: NotificationPref = { category: cat, enabled };
    writeMockPrefs([...prefs, next]);
    return next;
  }
  const { data, error } = await supabase.rpc('set_notification_pref', {
    p_category: cat,
    p_enabled: enabled,
  });
  if (error) throw error;
  return data as NotificationPref;
}

/** 테스트용 알림 목 리셋. */
export function resetMockNotificationPrefs(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(MOCK_NOTIF_KEY);
}

/**
 * 카탈로그 + 저장된 prefs를 병합해 현재 ON/OFF 상태 산출(0건=카탈로그 기본값).
 * NOTIFICATION_CATEGORIES 순서 유지(설정 화면 행 순서). 결정론.
 */
export function mergeNotificationState(prefs: NotificationPref[]): NotificationPref[] {
  const byCat = new Map(prefs.map((p) => [p.category, p.enabled]));
  return NOTIFICATION_CATEGORIES.map((c) => ({
    category: c.category,
    enabled: byCat.get(c.category) ?? c.enabledByDefault,
  }));
}
