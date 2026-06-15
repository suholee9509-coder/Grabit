import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from '@/shared/config';

/**
 * Supabase 브라우저 클라이언트 (shared/api) — OAuth + RPC 진입점(싱글턴).
 * - 자격(URL·anon) 없으면 null → 상위(features)는 목 경로 폴백(BE 미완/로컬·테스트 결정론).
 * - anon 키 = RLS 보호 공개 키(ADR-0001). 시크릿·서비스롤 ❌(브라우저 노출 금지).
 * - 세션은 supabase-js가 localStorage에 자동 영속(persistSession). 브라우저측 LLM/외부키 호출 없음(Auth·RPC만).
 */
export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** 클라이언트 배선 여부 — features가 목/실배선 분기(u1 패턴). */
export const isSupabaseReady = supabase != null;

/** 동일 클라이언트 함수 접근(u3 패턴 호환 — ingest/folders/tags 소비처). */
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

/** Supabase 구성 여부(u3 패턴 호환). */
export function isSupabaseConfigured(): boolean {
  return supabase != null;
}

export type { SupabaseClient };
