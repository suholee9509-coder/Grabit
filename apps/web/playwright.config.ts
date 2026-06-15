import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e 설정 (Wave5) — 목 경로 결정론(Supabase env 미설정 → isSupabaseReady=false).
 *
 * - testDir: e2e/ (vitest include는 src/** 만 → e2e는 vitest와 격리).
 * - webServer: 빌드 산출물(dist)을 vite preview(:4173)로 서빙. reuseExistingServer로 로컬 재실행 친화.
 *     ★ Supabase env(VITE_SUPABASE_URL/ANON_KEY)를 주입하지 않으므로 모든 표면이 demo/mock 폴백 → 결정론.
 * - 단일 워커(목 세션은 sessionStorage·전역 상태가 없어 병렬 안전하지만 CI 안정성 위해 보수적).
 * - headless 기본(chromium). build는 사전 수행 또는 webServer command가 수행.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // 목 결정론: env 미주입 → isSupabaseReady=false.
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // dist를 미리 빌드(없으면 빌드) 후 preview로 서빙. Supabase env는 주입하지 않음(목 경로).
    command: 'pnpm exec vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
