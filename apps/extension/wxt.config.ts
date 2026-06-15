import { defineConfig } from 'wxt';

// WXT config — Grabit MV3 chrome extension (ADR-0001).
// content script (YouTube floating button + clip modal, Shadow DOM isolated) · popup (React) ·
// background service worker. Auth = 웹 로그인 팝업 → Supabase 세션 → chrome.storage → bearer → 401 재로그인.
// host_permissions = YouTube only (영상 전용 — 아티클/하이라이트 제외, spec §게이트 ⓐ).
// This is the buildable skeleton; clip flow + ingest wiring land in follow-up sub-specs.
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Grabit',
    description: '어디서든 발견한 인사이트 영상을 클립하고 큐레이션하세요.',
    // storage: 세션·설정 저장 · activeTab: 사용자 제스처 시 현재 탭 접근 · scripting: 동적 주입.
    permissions: ['storage', 'activeTab', 'scripting'],
    // 영상 페이지(유튜브 우선)에만 content script 주입 (Shadow DOM 격리).
    host_permissions: [
      'https://*.youtube.com/*',
      'https://youtu.be/*',
    ],
    // 웹 로그인 핸드오프: 웹앱(externally_connectable)이 OAuth 후 세션 토큰을 background로 전달.
    // 실제 웹 오리진은 통합 시 채워짐(플레이스홀더 — 로컬 개발 + 배포 오리진).
    externally_connectable: {
      matches: ['http://localhost/*', 'https://*.grabit.app/*'],
    },
  },
});
