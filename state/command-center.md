# Grabit Sprint Command Center

> PM의 **단일 SoT(영속 메모리)**. PM이 매 오케스트레이션 루프에서 읽고 갱신한다.
> (정적 규칙은 `config/`, 누적 아키텍처 결정은 `state/decisions.md`.)

## 0. Product North Star
**크롬 확장 기반 성장 콘텐츠(영상·아티클) 클리핑·큐레이션 서비스.** 외부 성장 콘텐츠를 *구간/영역 단위*로 즉시 클리핑하고, **AI 요약·태그·통계·소셜 애노테이션(집단지성)·또래 트렌드**로 '무엇을 봐야 하나'의 막막함과 FOMO를 줄여 *콘텐츠 소비 → 기록 → 복습 → 성장 체감*으로 연결한다. 타겟: 성장/커리어 콘텐츠를 소비하지만 정리·복습이 어려운 취준생~10년차(PM·디자이너·개발자·마케터).
> 기획 SoT: `docs/source/`(기능명세서·유저플로우 + manyfast) · 디자인 SoT: Figma(`docs/design/`).

## 1. Active Sprint
- Sprint: **0 (디자인 인벤토리 + 아키텍처 결정 + 스캐폴딩) — 미시작.** 기획 문서 2개 + Figma 링크 수령됨. **차단: Figma MCP + manyfast MCP 연결 대기** → 연결 후 디자인 인벤토리 + 스펙 역설계(§2) → ADR → 게이트 ⓐ → 스캐폴딩 + 디자인-시스템 추출.
- 목표(S0): Figma 프레임 인벤토리(`docs/design/`) · 제품 스펙 역설계 · 스택/데이터 ADR · FSD 스캐폴딩 · 디자인 토큰 추출(§5). (코드 기능 단위 없음)
- Milestone: _(미생성 — sprint-kickoff 시)_
- 통합브랜치: `sprint/0-integration` _(미생성)_
- 모드: Sprint 1 = 모드 2(트레이닝휠 — 각 dev 스폰 전 사용자 승인) → 이후 모드 1

## 2. Validated Spec / PRD (역설계)
> 상태: **수령됨·미검증.** 기획 문서 2개 + Figma 링크 확보. **대기: Figma MCP + manyfast MCP 연결** → Figma 프레임 인벤토리 → `/office-hours` → `/plan-ceo-review`(스코프) → prd-clarifier(화면·상태를 *프레임에서* 열거) → 여기 확정 → 게이트 ⓐ.
- **디자인 SoT('무엇')**: Figma `5GGyKsjXEOpjKMLtUodeSs`(page `2087:5987`, proto start `2074:86591`) · 인벤토리: `docs/design/README.md`
- **기획 SoT('왜·스코프·데이터규칙')**: `docs/source/기능명세서.md` · `docs/source/유저플로우.md` (+ manyfast MCP) · 포트폴리오(Notion)
- In scope (기획문서 기준, 검증 전): ① 크롬확장 클리핑(영상 타임스탬프/아티클 DOM영역 + 플로팅 메모) ② 라이브러리(폴더·태그·검색·정렬) ③ AI 요약(한줄/3줄/상세)·키워드·자동태그 ④ 콘텐츠 상세(임베드 뷰어·소셜 애노테이션 히트맵/하이라이트) ⑤ 홈/트렌드 추천·또래 비교 ⑥ 대시보드/통계 ⑦ 인증·온보딩(직업·연차·관심분야) ⑧ 설정·구독(Pro 결제)
- Out of scope / Open Questions: _(스코프 wedge·MVP 절단은 /office-hours에서 — TBD)_
- UX Spec: prd-clarifier로 Screens/States(프레임 기반)/A11y 작성 예정. 충돌 시 *무엇=Figma, 왜·스코프=문서*.

## 3. Feature Work-Units (현 스프린트 — spec: docs/units/<slug>/spec.md)
| slug | story(L1) | owner | status | branch/PR | wave | gate |
|---|---|---|---|---|---|---|
| _(없음 — Sprint 0/분해 전)_ | | | | | | |
> 이슈/마일스톤/보드는 sprint-kickoff(게이트 ⓑ)에서 등록. 보드 = Grabit(#2).

## 4. Decisions This Sprint
> 스프린트 중 라이브 추가 (date · who · what · why). 아키텍처 결정은 `state/decisions.md`(ADR)에도.
- 2026-06-15 · 사용자/PM · **에이전트 오케스트레이션 시스템 이식 완료** (PM 중심 5-에이전트 + `/goal` + 안티-증식 작업단위 계약).
- 2026-06-15 · 사용자 · **워크플로우 = UI 역설계(디자인-퍼스트)**. UI가 Figma에 픽스(90%+). frontend는 디자인 생성 ❌ → Figma MCP로 프레임 연동해 **픽셀-퍼펙트 퍼블리싱**. PM은 Figma에서 스펙 역설계. SoT: *무엇=Figma, 왜·스코프=기획문서*. 게이트 ⓒ = 충실도 사인오프.
- 2026-06-15 · 사용자 · **실행모드 = 역할 고정**: UI/frontend = **인터랙티브 워크트리(사용자 직접 운전)**, backend/qa/security = **백그라운드**. ★ 백그라운드 에이전트 모델 = `claude-opus-4-8` + `--effort max`(Ultra Code 제외 최상위).
- 2026-06-15 · 사용자 · **리소스 수령**: 기획문서 2개(`docs/source/{기능명세서,유저플로우}.md`) · Figma 링크(프로토타입+페이지, key `5GGyKsjXEOpjKMLtUodeSs`) · 포트폴리오(Notion). **manyfast MCP + Figma MCP 미연결** → 연결이 Sprint 0 착수 전제. 다음 = MCP 연결 → Sprint 0 디자인 인벤토리·스펙 역설계.

## 5. Design System (Figma 추출)
> **디자인 = 고정 Figma SoT** (`docs/design/README.md`). frontend가 **디자인-시스템 단위**에서 Figma MCP로 토큰을 추출 → `src/app/styles`. 보이스 시드: `config/brand_seed.md`.
- Figma 파일: `5GGyKsjXEOpjKMLtUodeSs` (page `2087:5987`) — 링크·프레임 인벤토리: `docs/design/README.md`. ⚠ Figma MCP 미연결.
- 상태: **미추출** (디자인-시스템 단위 선행 — 모든 화면 단위의 의존).
- 토큰: `--color-*`, `--space-*`, `--text-*`, `--radius-*` (Figma 추출 후 사전 기록) · 보이스: config/brand_seed.md

## 6. Escalations Open
| unit | question | awaiting |
|---|---|---|
| _(없음)_ | | |

## 7. Risks / WIP cap
- WIP 상한: **2 동시 단위** (기본 — 스프린트 계획 시 조정).
- 리스크: _(스프린트 계획 시 기록)_

---
Last updated: 2026-06-15 by PM (시스템 이식 + UI 역설계 워크플로우 + 실행모드(UI=워크트리·BG=opus4.8 max) + 리소스 수령. 다음 = Figma/manyfast MCP 연결 → Sprint 0 디자인 인벤토리·스펙 역설계)
