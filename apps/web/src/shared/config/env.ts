/**
 * 환경 변수 접근 (shared/config) — 브라우저 안전 값만(VITE_*).
 * 시크릿/프로바이더 키는 절대 클라이언트 번들에 넣지 않는다(quality_standards §5).
 * Supabase anon 키는 RLS로 보호되는 공개 키 → 클라이언트 노출 허용(ADR-0001).
 *
 * E4(확장 웹스토어 URL): 실제 확장 ID는 u6에서 주입 → 플레이스홀더 env.
 */
const raw = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

export const env = {
  /** Supabase 프로젝트 URL (예: https://xxx.supabase.co). */
  supabaseUrl: raw.VITE_SUPABASE_URL ?? '',
  /** Supabase anon/public 키 (RLS 보호 — 클라이언트 노출 허용). */
  supabaseAnonKey: raw.VITE_SUPABASE_ANON_KEY ?? '',
  /**
   * 크롬 웹스토어 확장 설치 URL (E4 — 실제 확장 ID는 u6에서 주입).
   * 미설정 시 웹스토어 홈으로 폴백(플레이스홀더). 새 탭으로 연다.
   */
  extensionWebstoreUrl:
    raw.VITE_EXTENSION_WEBSTORE_URL ?? 'https://chrome.google.com/webstore',
  /** 약관/개인정보 링크 목적지(E6 — 법무 페이지 별도 단위 전 플레이스홀더). */
  termsUrl: raw.VITE_TERMS_URL ?? '#',
  privacyUrl: raw.VITE_PRIVACY_URL ?? '#',
} as const;

/** Supabase 자격이 설정됐는지 — 미설정 시 FE는 목 경로로 폴백(BE 미완/로컬 개발). */
export const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey);
