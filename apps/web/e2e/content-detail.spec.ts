import { test, expect } from '@playwright/test';
import { seedAuthedOnboarded, UUID_RE, EMAIL_RE } from './helpers';

/**
 * 콘텐츠 상세 e2e (목 경로) — 카드 클릭 또는 직접 진입 → /content/:id → 플레이어/탭 확인.
 * detail read = isSupabaseReady=false → demoContentMeta 폴백(결정론 제목).
 * ★ 콘솔 에러 단언은 YouTube 임베드(외부 iframe·iframe_api) 유래 에러를 제외(앱 로직 에러만 점검).
 */

test.beforeEach(async ({ page }) => {
  await seedAuthedOnboarded(page);
});

test('상세 직접 진입 → 제목 + 시청/원본 탭 + 플레이어', async ({ page }) => {
  // 앱 로직 콘솔 에러 수집(YouTube 외부 임베드 유래 제외).
  const appErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/youtube|ytimg|iframe_api|googlevideo|doubleclick|gstatic/i.test(t)) return;
    if (/Failed to load resource|net::ERR|ERR_/i.test(t)) return; // 네트워크 리소스(썸네일 등)
    appErrors.push(`[console.error] ${t}`);
  });
  page.on('pageerror', (err) => appErrors.push(`[pageerror] ${err.message}`));

  await page.goto('/content/demo-content-1');

  // 데모 메타 제목.
  await expect(
    page.getByRole('heading', { name: '한국의 젊은 창업가들이 미국으로 가는 이유' }),
  ).toBeVisible({ timeout: 15_000 });

  // 시청 정보/원본 소스 세그먼트(role=tab).
  const watchTab = page.getByRole('tab', { name: '시청 정보' });
  const sourceTab = page.getByRole('tab', { name: '원본 소스' });
  await expect(watchTab).toBeVisible();
  await expect(sourceTab).toBeVisible();
  await expect(watchTab).toHaveAttribute('aria-selected', 'true');

  // 원본 소스 탭 토글.
  await sourceTab.click();
  await expect(sourceTab).toHaveAttribute('aria-selected', 'true');

  // 원본 링크(외부) 노출.
  await expect(page.getByRole('link', { name: /원본 링크/ })).toBeVisible();

  expect(appErrors, appErrors.join('\n')).toHaveLength(0);
});

test('상세 DOM에 cross-user 식별자(uuid/email) 부재', async ({ page }) => {
  await page.goto('/content/demo-content-1');
  await expect(
    page.getByRole('heading', { name: '한국의 젊은 창업가들이 미국으로 가는 이유' }),
  ).toBeVisible({ timeout: 15_000 });

  const bodyText = await page.locator('body').innerText();
  expect(UUID_RE.test(bodyText), `uuid leak: ${UUID_RE.exec(bodyText)?.[0]}`).toBe(false);
  expect(EMAIL_RE.test(bodyText), `email leak: ${EMAIL_RE.exec(bodyText)?.[0]}`).toBe(false);
});
