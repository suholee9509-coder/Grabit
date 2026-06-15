import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Vitest 셋업 — RTL matcher + jsdom 폴리필 + 테스트 후 정리(결정론).
 */

// jsdom 미구현 PointerEvent capture → no-op 폴리필(u3 트림 핸들 드래그).
if (typeof Element !== 'undefined') {
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}

// 각 테스트 후 DOM·스토리지 정리.
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});
