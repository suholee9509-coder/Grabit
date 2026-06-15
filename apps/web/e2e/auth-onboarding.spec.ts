import { test, expect } from '@playwright/test';
import { collectConsoleErrors, seedAuthedNotOnboarded } from './helpers';

/**
 * 인증/온보딩 e2e (목 경로 — Supabase env 없음).
 * 플로우: /login → 목 소셜 로그인(use-social-login: supabase null → setMockSession(true) + /auth/callback) →
 *   콜백이 온보딩 미완료 판정 → /onboarding 4단계(직업·연차·관심 1~5·목표) → 완료 → 홈(/).
 */

test('미인증 → /login 진입(가드: RequireOnboarded → /login)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');
  // 보호 라우트는 미인증 시 /login으로 리다이렉트.
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Grab your growth, Together' })).toBeVisible();
  await expect(page.getByTestId('social-google')).toBeVisible();
  await expect(page.getByTestId('social-kakao')).toBeVisible();
  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('목 소셜 로그인 → 온보딩 4단계 완료 → 홈 도착', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/login');
  await expect(page.getByTestId('social-google')).toBeVisible();

  // 목 로그인: supabase null → setMockSession(true) 후 window.location.assign('/auth/callback').
  await page.getByTestId('social-google').click();

  // 콜백이 세션 확정 → 온보딩 미완료 → /onboarding 으로 이동.
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });

  // ① 직업 — 단일 선택.
  await expect(
    page.getByRole('heading', { name: '어떤 일을 하고 계신가요?' }),
  ).toBeVisible();
  await page.getByTestId('chip-개발자').click();
  await page.getByTestId('onboarding-next').click();

  // ② 연차 — 단일 선택.
  await expect(
    page.getByRole('heading', { name: '경력이 어떻게 되시나요?' }),
  ).toBeVisible();
  await page.getByTestId('chip-2~3년차').click();
  await page.getByTestId('onboarding-next').click();

  // ③ 관심분야 — 복수(1~5). 두 개 선택해 다중선택 경로도 커버.
  await expect(
    page.getByRole('heading', { name: '관심 분야가 어떻게 되시나요?' }),
  ).toBeVisible();
  await page.getByTestId('chip-프로그래밍').click();
  await page.getByTestId('chip-커리어').click();
  await page.getByTestId('onboarding-next').click();

  // ④ 목표 — 단일 선택. next 라벨 = '완료'.
  await expect(
    page.getByRole('heading', { name: '지금 어떤 목표를 향해 가고 있나요?' }),
  ).toBeVisible();
  await page.getByTestId('chip-역량 강화 · 스킬업').click();

  const nextBtn = page.getByTestId('onboarding-next');
  await expect(nextBtn).toHaveText('완료');
  await nextBtn.click();

  // 완료 → 홈(/?onboarded=1). 사이드바 '컨텐츠 추가' CTA가 보이면 홈 도착.
  await expect(page).toHaveURL(/\/\?onboarded=1$/, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: '컨텐츠 추가' })).toBeVisible();

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('이미 인증·미완료로 시드 → /login 진입 시 /onboarding으로 리다이렉트(RedirectIfAuthed)', async ({
  page,
}) => {
  await seedAuthedNotOnboarded(page);
  await page.goto('/login');
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: 15_000 });
  await expect(
    page.getByRole('heading', { name: '어떤 일을 하고 계신가요?' }),
  ).toBeVisible();
});
