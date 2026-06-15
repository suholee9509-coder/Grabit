import { supabase } from '@/shared/api';
import { INTERESTS_MAX, INTERESTS_MIN } from '../model/options';
import type { CompleteOnboardingArgs, OnboardingInput, Profile } from '../model/types';

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
