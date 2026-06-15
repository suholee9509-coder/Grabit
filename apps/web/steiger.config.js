import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

/**
 * FSD 경계 검사 (ADR-0001):
 *   - 레이어 하향 임포트만 (app→pages→widgets→features→entities→shared)
 *   - 동일 레이어 크로스-슬라이스 ❌
 *   - 퍼블릭 API(배럴) 경유
 * steiger = FSD-native 린터. `pnpm lint:fsd`.
 *
 * 하드 경계 규칙(하향임포트·크로스슬라이스·배럴)은 전부 유지.
 * 휴리스틱 규칙 2종은 off:
 *   - insignificant-slice: u3 Boundaries가 features/{clip-add,clip-trim,clip-tags,clip-folder}를
 *     명시적으로 절단(수직 슬라이스)하므로 "단일 참조 = 병합" 권고는 스펙과 충돌.
 *   - repetitive-naming: clip-* 접두는 도메인 의도(클립 편집 피처군) — 의도된 명명.
 */
export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off',
      'fsd/repetitive-naming': 'off',
    },
  },
]);
