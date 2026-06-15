import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabaseConfig } from '@/shared/config';

/**
 * Supabase 브라우저 클라이언트 (shared/api) — OAuth + RPC 진입점.
 * - 자격(URL·anon)이 없으면 null → 상위(features)는 목 경로로 폴백(BE 미완/로컬·테스트 결정론).
 * - anon 키는 RLS 보호 공개 키(ADR-0001). 시크릿 ❌.
 * - 세션은 supabase-js가 localStorage에 자동 영속(persistSession 기본 on, 웹 세션).
 *   브라우저측 LLM/외부키 호출 없음(Auth·RPC만).
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

/** 클라이언트가 실제로 배선됐는지 — features가 목/실배선을 분기. */
export const isSupabaseReady = supabase != null;
