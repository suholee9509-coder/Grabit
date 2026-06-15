import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase 브라우저 클라이언트(싱글턴). 익명 키만 사용(서비스 롤·서버 시크릿 ❌ — 브라우저 노출 금지).
 * RLS가 본인 데이터만 노출. 환경변수 미설정(로컬 데모) 시 null → UI는 목 데이터/스텁로 동작.
 *
 * ⚠ 브라우저측 LLM·외부 API 키 호출 금지(CLAUDE.md frozen). 여기선 Supabase anon 키만.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey);
}

/** 구성된 Supabase 클라이언트(없으면 null — 데모/오프라인 모드). */
export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

/** Supabase가 구성되어 실제 백엔드 호출이 가능한지. */
export function isSupabaseConfigured(): boolean {
  return client !== null;
}

export type { SupabaseClient };
