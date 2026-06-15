import { test, expect } from '@playwright/test';
import { collectConsoleErrors, seedAuthedOnboarded } from './helpers';

/**
 * 클립 추가 플로우 e2e (목 경로) — 홈 '컨텐츠 추가' → Step1 URL → Step2 편집(메모/폴더/태그) → 저장.
 * ingest는 isSupabaseConfigured()=false → 결정론 성공 스텁 → 완료 토스트 + 모달 닫힘.
 */

test.beforeEach(async ({ page }) => {
  await seedAuthedOnboarded(page);
});

test('컨텐츠 추가 → URL 입력 → 편집(메모/태그) → 저장 완료', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto('/');

  // 사이드바 '컨텐츠 추가' CTA → Step1 링크 모달.
  await page.getByRole('button', { name: '컨텐츠 추가' }).first().click();

  const step1Title = page.getByRole('heading', { name: '새 클립 추가' });
  await expect(step1Title).toBeVisible({ timeout: 10_000 });

  // YouTube URL 입력 → [다음].
  const urlInput = page.getByLabel('컨텐츠 링크');
  await urlInput.fill('https://www.youtube.com/watch?v=W3F8I0GNuFg');
  await page.getByRole('button', { name: '다음' }).click();

  // Step2 편집 모달(제목 '컨텐츠 추가') — 메타 로드 후.
  await expect(page.getByRole('heading', { name: '컨텐츠 추가', exact: true })).toBeVisible({
    timeout: 10_000,
  });

  // 인사이트 메모 입력.
  await page.getByLabel('인사이트 메모').fill('이 클립 저장 이유 — e2e 테스트 메모');

  // 태그 추가: "태그 추가" 칩 → 입력 → Enter.
  await page.getByRole('button', { name: '태그 추가' }).click();
  const tagInput = page.getByLabel('태그 입력');
  await tagInput.fill('테스트태그');
  await tagInput.press('Enter');
  await expect(page.getByText('테스트태그')).toBeVisible();

  // [완료] — 기본 트림 구간(데모 메타 92s → 32~61, valid)로 활성.
  const doneBtn = page.getByRole('button', { name: '완료' });
  await expect(doneBtn).toBeEnabled();
  await doneBtn.click();

  // 완료 토스트 + 모달 닫힘(Step2 제목 사라짐).
  await expect(page.getByText('클립을 저장했어요.')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('heading', { name: '컨텐츠 추가', exact: true })).toHaveCount(0);

  expect(errors, errors.join('\n')).toHaveLength(0);
});

test('Step1 지원하지 않는 링크 → [다음] 차단', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '컨텐츠 추가' }).first().click();
  await expect(page.getByRole('heading', { name: '새 클립 추가' })).toBeVisible();

  const urlInput = page.getByLabel('컨텐츠 링크');
  await urlInput.fill('not-a-valid-url');
  await urlInput.blur();

  // [다음] 비활성(검증 실패) — Step2로 진행 안 함.
  await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: '컨텐츠 추가', exact: true })).toHaveCount(0);
});
