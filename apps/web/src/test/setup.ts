import '@testing-library/jest-dom/vitest';

/**
 * Vitest 셋업 — RTL matcher 등록 + jsdom 미구현 API 폴리필.
 * (PointerEvent capture·matchMedia 등은 테스트가 사용하는 만큼만 보강.)
 */

// jsdom에 setPointerCapture/releasePointerCapture 미구현 → no-op 폴리필(트림 핸들 드래그).
if (typeof Element !== 'undefined') {
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}
