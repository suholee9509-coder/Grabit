import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

/**
 * FSD 경계 검증(steiger) — ADR-0001 "FSD 가볍게 유지(순수성이 산출물 ❌)" 정합.
 * 실제 경계 위반(상향임포트·동일레이어 크로스슬라이스·배럴 우회)은 전부 유지.
 * 단 아래 2개 "권고성" 규칙만 비활성: 화면 단위의 feature 분리(social-login·clip-trim 등)는
 * 캡슐화·테스트·재사용을 위한 의도적 설계이므로 단일참조/도메인반복을 에러로 보지 않는다.
 */
export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off', // 단일 참조 슬라이스 병합 권고 — 의도적 분리 허용
      'fsd/repetitive-naming': 'off', // clip-* 등 도메인 반복 — 자연스러움
    },
  },
]);
