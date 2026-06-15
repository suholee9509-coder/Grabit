import { test, expect } from '@playwright/test';
import { collectConsoleErrors, seedAuthedOnboarded, UUID_RE, EMAIL_RE } from './helpers';

/**
 * 라이브러리 e2e (목 경로) — /library 진입 → 헤더·컨텐츠/인사이트 탭·폴더·출처필터 확인.
 * read 훈은 isSupabaseReady=false → demo 폴백(결정론). 누출 부재 단언.
 */

test.beforeEach(async ({ page }) => {
  await seedAuthedOnboarded(page);
});

test('라이브러리 진입 — 헤더 + 컨텐츠/인사이트 탭 토글', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/library');

  // 헤더 — '라이브러리' 제목.
  await expect(page.getByRole('heading', { name: '라이브러리', exact: true })).toBeVisible({
    timeout: 15_000,
  });

  // SourceFilter 토글 — 컨텐츠/인사이트(role=tab).
  const contentTab = page.getByRole('tab', { name: '컨텐츠', exact: true });
  const insightTab = page.getByRole('tab', { name: '인사이트', exact: true });
  await expect(contentTab).toBeVisible();
  await expect(insightTab).toBeVisible();
  await expect(contentTab).toHaveAttribute('aria-selected', 'true');

  // 인사이트 탭 토글.
  await insightTab.click();
  await expect(insightTab).toHaveAttribute('aria-selected', 'true');

  // 컨텐츠 탭 복귀.
  await contentTab.click();
  await expect(contentTab).toHaveAttribute('aria-selected', 'true');

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('라이브러리 좌측 — 내 컨텐츠/북마크 탭 + 검색바', async ({ page }) => {
  await page.goto('/library');
  await expect(page.getByRole('heading', { name: '라이브러리', exact: true })).toBeVisible({
    timeout: 15_000,
  });

  // 좌측 사이드바 탭 — 내 컨텐츠/북마크.
  await expect(page.getByRole('tab', { name: '내 컨텐츠' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '북마크' })).toBeVisible();

  // 본문 검색바 클릭 → /search 이동.
  await page.getByRole('button', { name: '컨텐츠 검색' }).click();
  await expect(page).toHaveURL(/\/search$/, { timeout: 15_000 });
});

test('라이브러리 DOM에 cross-user 식별자(uuid/email) 부재', async ({ page }) => {
  await page.goto('/library');
  await expect(page.getByRole('heading', { name: '라이브러리', exact: true })).toBeVisible({
    timeout: 15_000,
  });
  const bodyText = await page.locator('body').innerText();
  expect(UUID_RE.test(bodyText), `uuid leak: ${UUID_RE.exec(bodyText)?.[0]}`).toBe(false);
  expect(EMAIL_RE.test(bodyText), `email leak: ${EMAIL_RE.exec(bodyText)?.[0]}`).toBe(false);
});
