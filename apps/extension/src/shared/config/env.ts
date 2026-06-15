// Extension environment (client-safe values only — Supabase anon key is the RLS-protected public
// key per ADR-0001; NO secrets / service-role / external-provider keys ever reach the bundle).
// WXT/Vite inlines import.meta.env at build; WXT_* and VITE_* are exposed. We accept both so a
// single Supabase project can be shared with apps/web (which uses VITE_*).
// Read lazily (getters) so values reflect import.meta.env at access time (build-inlined in prod;
// stub-able in tests). 미설정 시 빈 문자열 → 인증/ingest 미배선(미인증 경로), 입력은 보존.

type EnvBag = Record<string, string | undefined>;

function bag(): EnvBag {
  const viteEnv = (import.meta as { env?: EnvBag }).env ?? {};
  // Merge process.env as a fallback for non-Vite runtimes (the test runner's node env exposes a
  // bare import.meta.env without our keys). `process` is absent in the extension/browser bundle, so
  // this branch only ever fires in tests; Vite-inlined values win in production.
  if (typeof process !== 'undefined' && process.env) {
    return { ...(process.env as EnvBag), ...viteEnv };
  }
  return viteEnv;
}

function pick(...keys: string[]): string {
  const raw = bag();
  for (const k of keys) {
    const v = raw[k];
    if (v && v.trim() !== '') return v;
  }
  return '';
}

export const env = {
  /** Supabase 프로젝트 URL (https://xxx.supabase.co). */
  get supabaseUrl(): string {
    return pick('WXT_SUPABASE_URL', 'VITE_SUPABASE_URL');
  },
  /** Supabase anon/public 키 (RLS 보호 — 클라이언트 노출 허용). */
  get supabaseAnonKey(): string {
    return pick('WXT_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
  },
  /** 웹 앱 오리진 — 로그인 팝업 목적지(웹 세션 획득). 미설정 시 빈 문자열. */
  get webAppUrl(): string {
    return pick('WXT_WEB_APP_URL', 'VITE_WEB_APP_URL');
  },
} as const;

/** clip-ingest Edge Function endpoint (derived from supabaseUrl). */
export function ingestEndpoint(): string {
  return env.supabaseUrl ? `${env.supabaseUrl}/functions/v1/clip-ingest` : '';
}

/** Supabase 자격이 설정됐는지 — 미설정 시 인증/ingest는 미배선(미인증 경로). */
export function hasSupabaseConfig(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
