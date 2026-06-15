/**
 * entities/profile 배럴 — 코호트 입력 모델 + 프로필 데이터 표면(공개 API).
 * 상위 레이어(features/pages)는 항상 '@/entities/profile'에서 임포트.
 */
export {
  JOB_OPTIONS,
  YEARS_OPTIONS,
  INTEREST_OPTIONS,
  GOAL_OPTIONS,
  INTERESTS_MIN,
  INTERESTS_MAX,
} from './model/options';
export type {
  JobOption,
  YearsOption,
  InterestOption,
  GoalOption,
} from './model/options';
export {
  emptyOnboardingInput,
} from './model/types';
export type {
  OnboardingInput,
  CompleteOnboardingArgs,
  Profile,
} from './model/types';
export {
  toCompleteArgs,
  fetchIsOnboarded,
  saveOnboarding,
  resetMockOnboarding,
  fetchMyProfileJob,
} from './api/profile-api';
export {
  profileKeys,
  useOnboardingGate,
  useCompleteOnboarding,
  useMyProfileJob,
} from './api/queries';
