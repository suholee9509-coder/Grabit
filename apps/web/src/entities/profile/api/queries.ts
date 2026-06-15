import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIsOnboarded, fetchMyProfileJob, saveOnboarding } from './profile-api';
import type { OnboardingInput, Profile } from '../model/types';

/** 쿼리 키(entities 소유). */
export const profileKeys = {
  all: ['profile'] as const,
  onboardingGate: ['profile', 'onboarding-gate'] as const,
  myJob: ['profile', 'my-job'] as const,
};

/**
 * 현재 사용자 직군(라벨용, u2) — 추천 캐러셀 제목 "{job}이 많이 본 컨텐츠".
 * 자기 행만 read(RLS-safe) · job 외 필드 미사용. 없으면 폴백 라벨은 소비처가 처리.
 */
export function useMyProfileJob() {
  return useQuery({
    queryKey: profileKeys.myJob,
    queryFn: fetchMyProfileJob,
    staleTime: 60_000,
  });
}

/**
 * 온보딩 게이팅 쿼리 — is_onboarded() (라우팅 가드가 소비).
 * enabled: 인증된 경우에만(미인증 시 게이트 평가 불필요 → 로그인으로).
 */
export function useOnboardingGate(enabled: boolean) {
  return useQuery({
    queryKey: profileKeys.onboardingGate,
    queryFn: fetchIsOnboarded,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 온보딩 완료 저장 뮤테이션 — complete_onboarding RPC.
 * 성공 시 게이트 쿼리 무효화(완료=홈 게이팅 즉시 반영).
 */
export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation<Profile, Error, OnboardingInput>({
    mutationFn: saveOnboarding,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.onboardingGate });
    },
  });
}
