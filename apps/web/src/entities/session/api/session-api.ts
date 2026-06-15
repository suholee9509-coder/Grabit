import { supabase } from '@/shared/api';

/**
 * 세션 데이터 표면 (entities/session) — Supabase Auth 세션 조회/구독/종료.
 * Supabase 미배선 시 결정론적 목(sessionStorage 플래그)으로 폴백 + TODO.
 */

/** FE가 소비하는 최소 세션 모양(인증 여부·user id). */
export interface SessionInfo {
  authenticated: boolean;
  userId: string | null;
}

const MOCK_SESSION_KEY = 'grabit.mock.session';

function readMockSession(): SessionInfo {
  if (typeof sessionStorage === 'undefined') return { authenticated: false, userId: null };
  return sessionStorage.getItem(MOCK_SESSION_KEY)
    ? { authenticated: true, userId: 'mock-user' }
    : { authenticated: false, userId: null };
}

/** TODO(BE 배선): Supabase 자격 주입 후 목 세션 경로 제거. */
export function setMockSession(authenticated: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  if (authenticated) sessionStorage.setItem(MOCK_SESSION_KEY, '1');
  else sessionStorage.removeItem(MOCK_SESSION_KEY);
}

/** 현재 세션 조회. */
export async function fetchSession(): Promise<SessionInfo> {
  if (!supabase) return readMockSession();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const session = data.session;
  return {
    authenticated: Boolean(session),
    userId: session?.user.id ?? null,
  };
}

/** 세션 변경 구독 — 콜백에 최신 SessionInfo 전달. 해제 함수 반환. */
export function subscribeSession(cb: (info: SessionInfo) => void): () => void {
  if (!supabase) {
    // 목: 변경 이벤트 없음(라우팅은 쿼리 재조회로 처리). 즉시 현재값 전달.
    cb(readMockSession());
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb({ authenticated: Boolean(session), userId: session?.user.id ?? null });
  });
  return () => data.subscription.unsubscribe();
}

/** 로그아웃. */
export async function signOut(): Promise<void> {
  if (!supabase) {
    setMockSession(false);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
