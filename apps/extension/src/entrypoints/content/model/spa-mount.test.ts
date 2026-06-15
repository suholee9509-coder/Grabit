// content script mount/unmount + SPA pushState 재주입 tests (spec Validation: content script 주입
// 단위 테스트 — 버튼 mount/unmount, SPA 내비게이션 시 재주입(유튜브 pushState)). Drives the pure
// syncMount reconciler that entrypoints/content/index.ts uses on every `wxt:locationchange`.

import { describe, it, expect, vi } from 'vitest';
import { isWatchPath, syncMount, type MountableUi } from './spa-mount';

function fakeUi() {
  const ui: MountableUi & { calls: string[] } = {
    calls: [],
    mount: vi.fn(() => ui.calls.push('mount')),
    remove: vi.fn(() => ui.calls.push('remove')),
  };
  return ui;
}

describe('isWatchPath', () => {
  it('only /watch is a video page', () => {
    expect(isWatchPath('/watch')).toBe(true);
    expect(isWatchPath('/')).toBe(false);
    expect(isWatchPath('/feed/subscriptions')).toBe(false);
    expect(isWatchPath('/results')).toBe(false);
    expect(isWatchPath('/watch_videos')).toBe(false); // strict — not a single watch page
  });
});

describe('syncMount — mount/unmount on initial load', () => {
  it('mounts the button on a watch page (first load, not yet mounted)', () => {
    const ui = fakeUi();
    const mounted = syncMount(ui, '/watch', false);
    expect(mounted).toBe(true);
    expect(ui.mount).toHaveBeenCalledTimes(1);
    expect(ui.remove).not.toHaveBeenCalled();
  });

  it('does NOT mount on a non-watch page, and does not redundantly remove on first load', () => {
    const ui = fakeUi();
    const mounted = syncMount(ui, '/feed/subscriptions', false);
    expect(mounted).toBe(false);
    expect(ui.mount).not.toHaveBeenCalled();
    expect(ui.remove).not.toHaveBeenCalled();
  });
});

describe('syncMount — SPA pushState re-injection (YouTube navigates without reload)', () => {
  it('watch → watch (new video): remove-then-mount so the fresh root captures the new video', () => {
    const ui = fakeUi();
    let mounted = syncMount(ui, '/watch', false); // initial mount
    mounted = syncMount(ui, '/watch', mounted); // pushState to a new video
    expect(mounted).toBe(true);
    // first mount, then re-injection (remove + mount) on the second navigation.
    expect(ui.calls).toEqual(['mount', 'remove', 'mount']);
  });

  it('watch → non-watch: tears the button down (no lingering UI on the home feed)', () => {
    const ui = fakeUi();
    let mounted = syncMount(ui, '/watch', false);
    mounted = syncMount(ui, '/', mounted);
    expect(mounted).toBe(false);
    expect(ui.calls).toEqual(['mount', 'remove']);
  });

  it('non-watch → watch: injects when arriving at a video page', () => {
    const ui = fakeUi();
    let mounted = syncMount(ui, '/', false);
    mounted = syncMount(ui, '/watch', mounted);
    expect(mounted).toBe(true);
    expect(ui.calls).toEqual(['mount']);
  });

  it('non-watch → non-watch: stays absent, no churn', () => {
    const ui = fakeUi();
    let mounted = syncMount(ui, '/', false);
    mounted = syncMount(ui, '/results', mounted);
    expect(mounted).toBe(false);
    expect(ui.mount).not.toHaveBeenCalled();
    expect(ui.remove).not.toHaveBeenCalled();
  });
});
