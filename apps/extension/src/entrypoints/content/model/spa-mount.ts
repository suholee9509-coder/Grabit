// SPA mount orchestration for the YouTube content script (spec Validation: content script 주입 —
// mount/unmount + SPA pushState 재주입). YouTube navigates via pushState (no full reload), so the
// injected UI must be (re)mounted on every /watch page and removed everywhere else. This is the pure,
// testable core of entrypoints/content/index.ts — it has no WXT/DOM globals, so it unit-tests the
// exact reinjection decision without a running browser.

/** Minimal surface of the WXT shadow-root UI we drive (mount = inject, remove = teardown). */
export interface MountableUi {
  mount: () => void;
  remove: () => void;
}

/** True when the given pathname is a watch page (the only place we inject). */
export function isWatchPath(pathname: string): boolean {
  return pathname === '/watch';
}

/**
 * Reconcile the UI to a pathname after an SPA navigation. On a /watch page we remove-then-mount so a
 * fresh root captures the NEW video's metadata/position (YouTube swaps the video without remounting
 * the content script). Off /watch we remove the UI so the button never lingers on non-video pages.
 * `currentlyMounted` lets the caller avoid a redundant remove() on the very first non-watch load.
 */
export function syncMount(
  ui: MountableUi,
  pathname: string,
  currentlyMounted: boolean,
): boolean {
  if (isWatchPath(pathname)) {
    // remove-then-mount = re-injection for the new video (idempotent if not yet mounted).
    if (currentlyMounted) ui.remove();
    ui.mount();
    return true;
  }
  if (currentlyMounted) ui.remove();
  return false;
}
