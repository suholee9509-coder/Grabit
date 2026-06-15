# Unit: u0-design-system

> Sprint 0 · Wave 0 (선행, Lane A) · owner=frontend · **mode=하이브리드** (① 디자이너 에이전트 추출+1차[BG] → ② 사용자 워크트리 충실도 마감) · dep=스캐폴딩 후 · migration 없음
> 매 턴 spec + 대상 Figma(`668:29`) reload. 디자인 생성 ❌ → 고정 Figma SoT 추출·픽셀-퍼펙트.

## User Story (L1 — 검증의 north star · 각 인수기준이 여기로 추적)
- **L1-a** As a developer, I have a systematized design foundation (tokens + **all styles incl. shadows/effects** + UI primitives) extracted 1:1 from Figma, so every screen is pixel-perfect on shared values, not eyeballed.
- **L1-b** As a user, I land in a consistent app shell (좌측 GNB[홈/검색/라이브러리/수신함 + 내 폴더 + 최근 본 컨텐츠 + 컨텐츠 추가] + 톱바; **대시보드 탭 없음**) so the app is navigable.
- **L1-c** As a developer, the gap-fill screens (빈·로딩·에러·설정·계정·알림) can be built consistently on this foundation.

**Production acceptance (관찰가능):** 토큰/컴포넌트 미리보기 페이지에서 모든 토큰·`shared/ui` 컴포넌트가 Figma `668:29`와 1:1로 렌더되고, 앱 셸이 GNB(대시보드 제외)로 내비 가능하다.

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- **토큰·스타일·컴포넌트 SoT**: 페이지 "디자인 시스템" `668:29` + 컴포넌트 SECTION `2562:7927`
- **앱 셸 참조**: 홈 `2087:69031`(좌 GNB·톱바·사이드바 구조) · 라이브러리 `2117:22041`(GNB 활성 상태)

---
/goal --tokens <예산>  [Figma `668:29`에서 디자인 토큰·모든 스타일(그림자/이펙트 포함)·컴포넌트를 추출해 systematize하고, `shared/ui` 프리미티브 + 앱 셸을 구현해 모든 화면의 픽셀-퍼펙트 파운데이션을 만든다]

### Source of truth (매 턴 reload)
- read   docs/units/u0-design-system/spec.md (이 파일) · update status.md
- view   Figma `668:29` + `2562:7927` (Figma MCP) — 변수·스타일·컴포넌트 *정확값*
- 참조: state/decisions.md **ADR-0001** · config/quality_standards.md · docs/design/README.md

### Acceptance criteria (스토리 도출 · 관찰가능 · 각 항목 → L1-x)
**FE** (① 에이전트 추출/1차 → ② 사용자 마감, 동일 기준)
- [behavior] **토큰 추출**: `668:29`의 색/타이포/간격/반경/**그림자·이펙트** 변수·스타일 → CSS 변수(`apps/web/src/app/styles/tokens.css`: `--color-*`,`--text-*`,`--space-*`,`--radius-*`,`--shadow-*`) + 토큰 사전(Command Center §5). 눈대중 임의값 ❌. → L1-a
- [behavior] **shared/ui 프리미티브**: 버튼·칩·카드·탭·토글·인풋·드롭다운·모달·토스트·아바타·배지를 Figma 컴포넌트(`2562:7927`)와 1:1로. `apps/web/src/shared/ui/**`, **추출 토큰만** 사용. → L1-a
- [behavior] **앱 셸**: 좌측 GNB(홈/검색/라이브러리/수신함 + 내 폴더 + 최근 본 컨텐츠 + 컨텐츠 추가, **대시보드 탭 ❌**) + 톱바 + 콘텐츠 영역 레이아웃. `apps/web/src/app/**` + `widgets/`. → L1-b
- [state] 다크테마(#000/#121212) 기본 + 컴포넌트 상태(기본/호버/활성/비활성/포커스) 프레임대로. → L1-c
- [fidelity] 토큰/컴포넌트 미리보기가 `668:29`와 1:1(색·간격·타이포·**그림자**·반경·상태). → L1-a
- [non-regression] FSD 경계(`lint:fsd` 0): `shared`는 상위 레이어 임포트 ❌, 배럴 경유.

### Validation (증명 명령 — QA가 clean checkout 재실행)
- 토큰/컴포넌트 미리보기 페이지(또는 Storybook) 렌더 + `/design-review` 충실도(`668:29` 대비) PASS + 스크린샷.
- `tsc -b` 0 · `pnpm lint` 0 · `pnpm lint:fsd` 0 · 콘솔 에러 0.

### Boundaries
- only edit: `apps/web/src/app/styles/**` · `apps/web/src/shared/ui/**` · `apps/web/src/app/**`(셸) · `apps/web/src/widgets/{gnb,topbar}/**`.
- do not change: 백엔드(`supabase/**`)·u0b · 화면 단위 `features/`·`pages/`.
- 정적 유지: 화면 단위 퍼블리싱(u1~)은 다음 웨이브. out of scope: 화면별 데이터·라우팅.
- main 직접 푸시 ❌ · blast radius = `feat/u0-design-system`.

### Loop behavior
- **① 디자이너 에이전트(BG)**: 토큰 추출 + 토큰/컴포넌트 인벤토리 + `shared/ui` 1차 스켈레톤 + 앱 셸 스캐폴드까지 → status.md에 산출물·gap 기록 후 **정지(사용자 인계)**. 추측 ❌(프레임에 없으면 escalation).
- **② 사용자(인터랙티브 워크트리)**: 픽셀-퍼펙트 컴포넌트 마감 + `/design-review` 반복 + **게이트 ⓒ 충실도 사인오프**.
- goal = 모든 L1-x가 관찰가능하게 충족될 때까지. 미충족 done ❌ → ESCALATION(§no-fake-done).
