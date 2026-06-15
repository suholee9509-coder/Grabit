# Quality Standards

모든 dev가 따르는 코드 품질 베이스라인. 성공조건의 `[quality]` 검증이 이를 강제한다.
> §8–§10의 구체 스택은 **Sprint 0 ADR로 확정**(`state/decisions.md`) — 아래는 확정 전 권장 베이스라인. §1–§7은 스택 불문 항상 적용.

## §1 단순성 우선
- 문제를 푸는 *최소* 코드. 추측성 추상화 ❌ (지금 필요한 것만).
- 기존 패턴·유틸 재사용 우선. 새 코드 짓기 전에 검색.

## §2 타입 시스템 활용
- TypeScript strict. `any` 금지(불가피하면 주석으로 이유). `tsc --noEmit` 0.
- 도메인 타입은 `shared/types`. 생성된 백엔드/스키마 타입은 동기화 유지.

## §3 에러 처리는 경계에서
- 외부 API·사용자 입력·서버 함수 경계에서만 방어 (zod/유효성). 내부 호출은 신뢰.
- 에러 메시지에 내부 구조·시크릿 누출 ❌.

## §4 테스트는 외부 동작 기준
- 내부 구조가 아니라 *계약/행위* 테스트. **의미있는 테스트 — 동어반복(`expect(true).toBe(true)`) 금지.**
- AI/비결정적 로직은 결정론적 계약 테스트로 경계를 고정.

## §5 보안
- **클라이언트/브라우저측 LLM·외부 API 키 호출 금지** → 서버(엣지 함수/백엔드)만. (크롬 익스텐션: content/popup 번들에 키 ❌ → background→서버 경유.)
- SQL/쿼리 파라미터화. XSS(`dangerouslySetInnerHTML`/외부·AI 출력 렌더) 주의. CSRF. `.env` 커밋 ❌.

## §6 주석 최소화
- 코드가 *무엇*을 하는지는 코드가 말한다. 주석은 *왜*(비자명한 결정)만. 과도한 주석 정리.

## §7 커밋
- 작은 단위 커밋(1 커밋 = 1 논리 단위). 의미있는 메시지(`fix bug` ❌ → `fix race in clip-capture save` O).

## §8 FSD 아키텍처 (frontend — Sprint 0 확정 시 적용)
- 레이어: `app → pages → widgets → features → entities → shared`. **하향 임포트만**, 동일 레이어 크로스슬라이스 ❌.
- 배럴(`index.ts`) 경유 공개. 슬라이스 내부 직접 임포트 ❌.
- (크롬 익스텐션 MV3) background/content-script/popup/options 엔트리를 FSD 레이어에 매핑 — Sprint 0 스캐폴딩에서 확정.

## §9 UI / 디자인 시스템 — 고정 Figma SoT, 픽셀-퍼펙트 (스택은 Sprint 0 ADR)
- **디자인 = Figma 1차 SoT.** 화면·상태·컴포넌트·토큰을 *생성하지 않고* Figma MCP로 정확 값을 추출해 구현. **픽셀-퍼펙트 충실도**가 인수기준([fidelity]).
- 권장 스택 베이스라인: React + Vite + TypeScript + Tailwind + shadcn/ui (Sprint 0 ADR로 확정).
- **디자인 토큰 = Figma 추출**: 색/간격/타이포/반경은 Figma에서 추출돼 `src/app/styles` 토큰으로(`var(--color-*)`, `var(--space-*)`, `var(--text-*)`). 눈대중 임의값 ❌ (Command Center §5).
- 빈/로딩/에러 상태 항상 구현 — **프레임에 정의된 대로**(프레임에 없으면 추측 ❌ → 디자인 공백 escalation). AI slop(균일 그라디언트·의미없는 카드) ❌.
- `/design-review` = **참조 프레임 대비 충실도 검증**(생성형 미적 평가 ❌). `[copy:N]`은 프레임 텍스트 우선, 동적 카피만 보이스 따름.

## §10 AI / 백엔드 특화
- 외부 모델 추론은 *서버측 게이트웨이*로 단일화 — 키·에러·토큰/비용 로깅 일원화. 프로바이더 락인 회피(어댑터 경유).
- 비결정적 출력(분류·요약·추출 등)은 *테스트 가능한 계약*으로 경계를 고정. 프롬프트는 SoT 파일(`docs/` 또는 함수 내 상수)로 버전 관리.
- LLM/외부 신뢰 경계: 모델 출력을 그대로 실행/렌더 ❌ (검증·이스케이프).
