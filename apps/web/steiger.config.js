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
  {
    // insignificant-slice = "단일 참조 슬라이스 병합 권고"(어드바이저리).
    // u1 스펙 Boundaries가 features/{social-login,onboarding-steps,extension-install-modal}·
    // widgets/onboarding-stepper를 별도 슬라이스로 명시 요구 → 병합 금지. 후속 유닛(u2+)에서
    // 참조가 늘어난다. 경계(레이어 방향·동일레이어 크로스슬라이스·공개 API) 규칙은 전부 유지.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
]);
