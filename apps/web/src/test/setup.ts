import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 DOM·스토리지 정리(결정론).
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});
