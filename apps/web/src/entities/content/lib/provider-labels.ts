/**
 * provider 키 → 표시 라벨(출처필터 탭 라벨 — 프레임 카피 2087:38908~38946).
 * SourceLogo(컴포넌트)와 분리(react-refresh: 컴포넌트 파일은 컴포넌트만 export).
 */
export const PROVIDER_LABELS: Record<string, string> = {
  youtube: 'Youtube',
  longblack: 'Long Black',
  medium: 'Medium',
  tistory: 'Tistory',
  eoplanet: 'EO planet',
  publy: 'Publy',
};

/** provider 키 → 라벨(미등록 시 원문 그대로). */
export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider.toLowerCase()] ?? provider;
}
