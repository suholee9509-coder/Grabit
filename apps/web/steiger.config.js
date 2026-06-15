import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

/**
 * FSD 경계 검사 (ADR-0001):
 *   - 레이어 하향 임포트만 (app→pages→widgets→features→entities→shared)
 *   - 동일 레이어 크로스-슬라이스 ❌
 *   - 퍼블릭 API(배럴) 경유
 * steiger = FSD-native 린터. `pnpm lint:fsd`.
 *
 * 스캐폴드 단계: 레이어는 .gitkeep만 (빈 슬라이스). 후속 유닛(u0~)이 채운다.
 */
export default defineConfig([
  ...fsd.configs.recommended,
]);
