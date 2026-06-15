import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchIsOnboarded,
  fetchMyProfileJob,
  getMyProfile,
  getNotificationPrefs,
  restoreAccount,
  saveOnboarding,
  setNotificationPref,
  softDeleteAccount,
  updateProfile,
} from './profile-api';
import type {
  NotificationPref,
  OnboardingInput,
  Profile,
  ProfileEditInput,
} from '../model/types';

/** 쿼리 키(entities 소유). */
export const profileKeys = {
  all: ['profile'] as const,
  onboardingGate: ['profile', 'onboarding-gate'] as const,
  myJob: ['profile', 'my-job'] as const,
  me: ['profile', 'me'] as const,
  notificationPrefs: ['profile', 'notification-prefs'] as const,
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

/**
 * 현재 사용자 프로필(설정 프로필 섹션·복구 배너) — get_my_profile().
 * 자기 행만(RLS self) · deleted_at 포함(유예중이면 복구 배너 평가).
 * enabled: 인증된 경우에만(미인증 시 조회 불필요).
 */
export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: getMyProfile,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 프로필 수정 저장 뮤테이션 — update_profile RPC.
 * 성공 시 프로필 전체 무효화(me·myJob — 라벨/카드 갱신). 낙관 갱신은 호출처가 결정.
 */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<Profile, Error, ProfileEditInput>({
    mutationFn: updateProfile,
    onSuccess: (next) => {
      qc.setQueryData(profileKeys.me, next); // 재조회 없이 즉시 반영(낙관)
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 회원 탈퇴(soft-delete) 뮤테이션 — soft_delete_account().
 * 성공 시 프로필·게이트 무효화(복구 배너 평가). 멱등(이미 deleted 무해).
 */
export function useSoftDelete() {
  const qc = useQueryClient();
  return useMutation<Profile, Error, void>({
    mutationFn: () => softDeleteAccount(),
    onSuccess: (next) => {
      qc.setQueryData(profileKeys.me, next);
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 계정 복구 뮤테이션 — restore_account(). 복구 배너 1클릭.
 * 성공 시 프로필·게이트 무효화(라이브 상태 즉시 반영).
 */
export function useRestoreAccount() {
  const qc = useQueryClient();
  return useMutation<Profile, Error, void>({
    mutationFn: () => restoreAccount(),
    onSuccess: (next) => {
      qc.setQueryData(profileKeys.me, next);
      qc.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/** 알림 설정 조회 — get_notification_prefs(). 0건=빈(카탈로그 기본값은 소비처가 병합). */
export function useNotificationPrefs(enabled = true) {
  return useQuery<NotificationPref[]>({
    queryKey: profileKeys.notificationPrefs,
    queryFn: getNotificationPrefs,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 알림 토글 저장 뮤테이션 — set_notification_pref(category, enabled).
 * 성공/실패와 무관히 prefs 재조회(낙관 롤백은 소비처가 처리).
 */
export function useSetNotificationPref() {
  const qc = useQueryClient();
  return useMutation<NotificationPref, Error, { category: string; enabled: boolean }>({
    mutationFn: ({ category, enabled }) => setNotificationPref(category, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.notificationPrefs });
    },
  });
}
