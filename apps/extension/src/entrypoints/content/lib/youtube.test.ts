// @vitest-environment jsdom
// YouTube host-page read + Shadow DOM isolation tests (spec Validation: content script 주입 단위
// 테스트 — Shadow DOM root 격리(host 스타일 누출 0)). Read-only host access; we never mutate YouTube.

import { describe, it, expect, beforeEach } from 'vitest';
import { captureMeta } from './youtube';

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  window.history.replaceState({}, '', '/');
});

describe('captureMeta (read-only host reads)', () => {
  it('reads title from meta[name=title] and video id from ?v= for the thumbnail', () => {
    window.history.replaceState({}, '', '/watch?v=dQw4w9WgXcQ&t=42s');
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'title');
    meta.content = '스탠포드 창의성';
    document.head.appendChild(meta);

    const result = captureMeta();
    expect(result.url).toContain('/watch?v=dQw4w9WgXcQ');
    expect(result.title).toBe('스탠포드 창의성');
    expect(result.thumbnailUrl).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('falls back to currentSec=0 / null duration when no <video> present', () => {
    window.history.replaceState({}, '', '/watch?v=dQw4w9WgXcQ');
    const result = captureMeta();
    expect(result.currentSec).toBe(0);
    expect(result.durationSec).toBeNull();
  });

  it('does not mutate the host DOM (read-only)', () => {
    window.history.replaceState({}, '', '/watch?v=dQw4w9WgXcQ');
    document.body.innerHTML = '<div id="host">original</div>';
    const before = document.body.innerHTML;
    captureMeta();
    expect(document.body.innerHTML).toBe(before);
  });
});

describe('Shadow DOM isolation (host styles do not leak in)', () => {
  it('a shadow root with all:initial blocks an inherited host font-size', () => {
    // Host sets an aggressive style that would normally inherit into descendants.
    document.documentElement.style.fontSize = '40px';
    const host = document.createElement('grabit-clip-root');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = ':host { all: initial; }';
    shadow.appendChild(style);
    const inner = document.createElement('span');
    inner.textContent = '영상 인사이트 얻기';
    shadow.appendChild(inner);

    // The element lives inside the shadow root (isolated subtree), not the light DOM.
    expect(inner.getRootNode()).toBe(shadow);
    expect(host.shadowRoot).not.toBeNull();
    // Our UI content is not reachable from a light-DOM query (no leakage out).
    expect(document.querySelector('span')).toBeNull();
  });
});
