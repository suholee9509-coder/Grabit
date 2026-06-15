import type { Page } from '@playwright/test';

/**
 * e2e 목 세션 헬퍼 — Supabase env 미설정 시 결정론적 목 경로를 시드.
 *
 * 목 키(코드 확인 — sessionStorage):
 *   - entities/session/api/session-api.ts: MOCK_SESSION_KEY = 'grabit.mock.session' (값 '1' → authenticated).
 *   - entities/profile/api/profile-api.ts: MOCK_KEY = 'grabit.mock.onboarding'
 *       (JSON { onboarded:boolean, profile:Profile|null }).
 *
 * supabase-js의 detectSessionInUrl/persistSession은 localStorage이지만, 본 앱의 *목* 폴백은
 * sessionStorage를 쓴다(코드 SoT). 따라서 addInitScript로 sessionStorage를 시드한다.
 * addInitScript는 매 네비게이션 직전(페이지 스크립트 이전) 실행 → 가드가 첫 렌더부터 통과.
 */

export const MOCK_SESSION_KEY = 'grabit.mock.session';
export const MOCK_ONBOARDING_KEY = 'grabit.mock.onboarding';

/** 결정론적 온보딩 완료 프로필(profile-api.ts saveOnboarding 목 셰이프 거울). */
const MOCK_PROFILE = {
  id: 'mock-user',
  display_name: null,
  job: '개발자',
  years: '2~3년차',
  goal: '역량 강화 · 스킬업',
  interests: ['프로그래밍', '커리어'],
  onboarded_at: new Date(0).toISOString(),
  deleted_at: null,
};

/**
 * 인증됨 + 온보딩 완료 상태로 시드(홈/보호 라우트 결정론 진입).
 * 가드(RequireOnboarded)가 첫 렌더부터 통과하도록 addInitScript로 주입.
 */
export async function seedAuthedOnboarded(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionKey, onboardingKey, profile }) => {
      try {
        sessionStorage.setItem(sessionKey, '1');
        sessionStorage.setItem(
          onboardingKey,
          JSON.stringify({ onboarded: true, profile }),
        );
      } catch {
        /* ignore */
      }
    },
    { sessionKey: MOCK_SESSION_KEY, onboardingKey: MOCK_ONBOARDING_KEY, profile: MOCK_PROFILE },
  );
}

/**
 * 인증됨 + 온보딩 미완료 상태로 시드(/onboarding 게이트 통과 — 4단계 노출).
 */
export async function seedAuthedNotOnboarded(page: Page): Promise<void> {
  await page.addInitScript(
    ({ sessionKey, onboardingKey }) => {
      try {
        sessionStorage.setItem(sessionKey, '1');
        sessionStorage.removeItem(onboardingKey);
      } catch {
        /* ignore */
      }
    },
    { sessionKey: MOCK_SESSION_KEY, onboardingKey: MOCK_ONBOARDING_KEY },
  );
}

/**
 * 콘솔 에러/페이지 에러 수집기 — 단언용. error 레벨 콘솔과 pageerror(uncaught)만 수집.
 * (네트워크 404/리소스 경고는 제외 — 앱 로직 에러에 집중.)
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

/**
 * 본문 DOM에 cross-user 식별자(uuid user_id 형태·이메일)가 노출되지 않는지 점검용 정규식.
 * - 이메일: 본문 텍스트에 노출되면 누출 의심.
 * - 'mock-user'는 데모 식별자(본인)로 허용(타 user 아님). 실제 BE uuid 패턴만 의심.
 */
export const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i;
export const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
