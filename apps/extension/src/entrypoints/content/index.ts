// Content script (MV3) — YouTube watch pages only.
// Mounts a Shadow-DOM-isolated React root (host page CSS isolation, no leakage in/out — spec
// [non-regression]) hosting the floating button "[영상 인사이트 얻기]" (Step3 green pill 136×36) →
// clip modal (Step4 998×702 트림·메모·공개·폴더·태그) → u0b ingest via the background SW.
//
// SPA re-injection: YouTube navigates via pushState (no full reload). WXT's ContentScriptContext
// fires `wxt:locationchange`; we remount the UI when navigating to/away from a /watch page so the
// button is present on every video and absent elsewhere.

import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { App } from './ui/App';
import { shadowCss } from './ui/shadow-css';
import { syncMount } from './model/spa-mount';

export default defineContentScript({
  matches: ['*://*.youtube.com/watch*'],
  // 'ui' world keeps us off the page's MAIN world; the Shadow DOM provides the actual style isolation.
  cssInjectionMode: 'ui',
  async main(ctx) {
    let reactRoot: Root | null = null;

    const ui = await createShadowRootUi(ctx, {
      name: 'grabit-clip-root',
      position: 'inline',
      anchor: 'body',
      // Stop key events from leaking to YouTube's player shortcuts while typing in the memo/tags.
      isolateEvents: true,
      // Additional styles not imported as a module (keyframes, font fallback). inheritStyles stays
      // false (WXT's `all: initial` reset) so host CSS cannot pierce our UI.
      css: shadowCss,
      onMount: (container) => {
        container.dataset.grabit = 'clip-ui-root';
        reactRoot = createRoot(container);
        reactRoot.render(createElement(App));
        return reactRoot;
      },
      onRemove: (root) => {
        root?.unmount();
        reactRoot = null;
      },
    });

    // Track whether our UI is currently injected so SPA navigation can re-inject (pushState) or tear
    // down. syncMount (pure, unit-tested in model/spa-mount.test.ts) owns the decision.
    let mounted = false;
    mounted = syncMount(ui, location.pathname, mounted);

    // Remount/unmount on SPA navigation (YouTube pushState — no full reload).
    ctx.addEventListener(window, 'wxt:locationchange', () => {
      mounted = syncMount(ui, location.pathname, mounted);
    });
  },
});
