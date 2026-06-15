import { test, expect } from '@playwright/test';
import { collectConsoleErrors, seedAuthedOnboarded, UUID_RE, EMAIL_RE } from './helpers';

/**
 * 홈 e2e (목 경로) — 인증+온보딩 시드 후 홈 진입.
 * 세그먼트(취향관|피드) 토글 + 카드 표시 + 누출(uuid user_id/email) 부재.
 */

test.beforeEach(async ({ page }) => {
  await seedAuthedOnboarded(page);
});

test('홈 진입 — 취향관 기본 + 피드 토글 + 카드 표시', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  // 홈 도착(가드 통과) — 사이드바 GNB·CTA.
  await expect(page.getByRole('button', { name: '컨텐츠 추가' }).first()).toBeVisible({
    timeout: 15_000,
  });

  // 1차 세그먼트(role=tablist) — 취향관/피드 탭.
  const tasteTab = page.getByRole('tab', { name: '취향관' });
  const feedTab = page.getByRole('tab', { name: '피드' });
  await expect(tasteTab).toBeVisible();
  await expect(feedTab).toBeVisible();

  // 기본 = 취향관(aria-selected). "추천 컨텐츠" 섹션 노출.
  await expect(tasteTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('region', { name: '추천 컨텐츠' })).toBeVisible();

  // 피드 탭 토글 → "실시간 인기 그랩" 섹션 노출.
  await feedTab.click();
  await expect(feedTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('region', { name: '실시간 인기 그랩' })).toBeVisible();

  // 취향관 복귀.
  await tasteTab.click();
  await expect(tasteTab).toHaveAttribute('aria-selected', 'true');

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('홈 DOM에 cross-user 식별자(uuid user_id/email) 부재', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '컨텐츠 추가' }).first()).toBeVisible({
    timeout: 15_000,
  });

  const bodyText = await page.locator('body').innerText();
  expect(UUID_RE.test(bodyText), `uuid leak: ${UUID_RE.exec(bodyText)?.[0]}`).toBe(false);
  expect(EMAIL_RE.test(bodyText), `email leak: ${EMAIL_RE.exec(bodyText)?.[0]}`).toBe(false);
});

test('홈 카드 클릭 → /content/:id 상세 이동', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '컨텐츠 추가' }).first()).toBeVisible({
    timeout: 15_000,
  });

  // 추천 영역 첫 카드(버튼) 클릭 → 상세 라우팅.
  const recRegion = page.getByRole('region', { name: '추천 컨텐츠' });
  await recRegion.getByRole('button').first().click();
  await expect(page).toHaveURL(/\/content\/.+/, { timeout: 15_000 });
});
