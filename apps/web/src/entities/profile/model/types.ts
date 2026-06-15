/**
 * 프로필 코호트 입력 모델 (entities/profile) — ADR-0002 #6 public/private 분리 반영.
 * BE 계약(0010 complete_onboarding / profiles)과 1:1.
 */

/** 온보딩 누적 입력 — 4단계 stepper가 채운다(직접입력 관심사 포함). */
export interface OnboardingInput {
  /** ① 직업 (단일·필수) — public 코호트. */
  job: string | null;
  /** ② 연차 (단일·필수) — public 코호트. */
  years: string | null;
  /** ③ 관심분야 (복수 1~5, 직접입력 포함) — private. */
  interests: string[];
  /** ④ 목표 ≈ 현재상황 (단일·필수) — private. */
  goal: string | null;
}

/** 빈 온보딩 입력 초기값. */
export const emptyOnboardingInput: OnboardingInput = {
  job: null,
  years: null,
  interests: [],
  goal: null,
};

/**
 * complete_onboarding RPC 페이로드 — BE 0010 시그니처와 1:1
 * (p_job text, p_years text, p_goal text, p_interests text[]).
 */
export interface CompleteOnboardingArgs {
  p_job: string;
  p_years: string;
  p_goal: string;
  p_interests: string[];
}

/** profiles 행(부분 — FE가 소비하는 필드만). BE returns public.profiles. */
export interface Profile {
  id: string;
  display_name: string | null;
  job: string | null;
  years: string | null;
  goal: string | null;
  interests: string[] | null;
  /** 온보딩 완료 타임스탬프 — NULL = 미완료(게이팅). */
  onboarded_at: string | null;
}
