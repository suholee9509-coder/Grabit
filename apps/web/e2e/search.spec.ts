import { test, expect } from '@playwright/test';
import { collectConsoleErrors, seedAuthedOnboarded } from './helpers';

/**
 * 검색 e2e (목 경로) — /search → 쿼리 입력 → 결과 또는 빈 상태.
 * useSearchResults는 demoSearchMyContent 폴백(isSupabaseReady=false).
 *   - 'IT 업계 동향' → DEMO_RESULTS 매칭(결과 헤더).
 *   - 매칭 없는 쿼리 → 빈 상태 문구.
 */

test.beforeEach(async ({ page }) => {
  await seedAuthedOnboarded(page);
});

test('검색 진입 → 매칭 쿼리 → 결과 헤더 노출', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/search');

  // 발견 모드 검색바(aria-label="검색").
  const input = page.getByRole('textbox', { name: '검색' });
  await expect(input).toBeVisible({ timeout: 15_000 });

  await input.fill('IT 업계 동향');
  await input.press('Enter');

  // 결과 헤더 — '‘IT 업계 동향’ 검색 결과'.
  await expect(page.getByText('‘IT 업계 동향’ 검색 결과')).toBeVisible({ timeout: 15_000 });

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('검색 진입 → 매칭 없는 쿼리 → 빈 상태 문구', async ({ page }) => {
  await page.goto('/search');
  const input = page.getByRole('textbox', { name: '검색' });
  await expect(input).toBeVisible({ timeout: 15_000 });

  await input.fill('존재하지않는검색어zxqv');
  await input.press('Enter');

  await expect(page.getByText('‘존재하지않는검색어zxqv’의 검색 결과가 없습니다.')).toBeVisible({
    timeout: 15_000,
  });
});

test('검색 결과 카드 클릭 → /content/:id 이동', async ({ page }) => {
  await page.goto('/search');
  const input = page.getByRole('textbox', { name: '검색' });
  await expect(input).toBeVisible({ timeout: 15_000 });

  await input.fill('IT 업계 동향');
  await input.press('Enter');
  await expect(page.getByText('‘IT 업계 동향’ 검색 결과')).toBeVisible({ timeout: 15_000 });

  // 결과 그리드 첫 카드 텍스트(데모 res-1) 클릭.
  await page.getByText('IT 업계 동향 2026 — 반도체·AI 인프라 투자 사이클 정리').first().click();
  await expect(page).toHaveURL(/\/content\/.+/, { timeout: 15_000 });
});
