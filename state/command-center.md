# Grabit Sprint Command Center

> PM의 **단일 SoT(영속 메모리)**. PM이 매 오케스트레이션 루프에서 읽고 갱신한다.
> (정적 규칙은 `config/`, 누적 아키텍처 결정은 `state/decisions.md`.)

## 0. Product North Star
**크롬 익스텐션 기반 영상 클리핑·큐레이션 커리어 콘텐츠 플랫폼.** 막연한 성장 불안(FOMO)으로 커리어 콘텐츠를 소비하지만 성장을 체감하지 못하는 사람을 위해, 긴 영상의 핵심을 *클리핑·큐레이션*해 **체감되는 성장**으로 전환한다. 제품 SoT: 기획 문서 전달 후 `docs/source/`에 비치 → §2에서 검증.

## 1. Active Sprint
- Sprint: **0 (디자인 인벤토리 + 아키텍처 결정 + 스캐폴딩) — 미시작.** Figma 연동 + 기획 문서 수령 → 스펙 역설계(§2) → ADR(`state/decisions.md`) → 게이트 ⓐ → 스캐폴딩 + 디자인-시스템 추출.
- 목표(S0): Figma 프레임 인벤토리(`docs/design/`) · 제품 스펙 역설계 · 스택/데이터 ADR · FSD 스캐폴딩 · 디자인 토큰 추출(§5). (코드 기능 단위 없음)
- Milestone: _(미생성 — sprint-kickoff 시)_
- 통합브랜치: `sprint/0-integration` _(미생성)_
- 모드: Sprint 1 = 모드 2(트레이닝휠 — 각 dev 스폰 전 사용자 승인) → 이후 모드 1

## 2. Validated Spec / PRD (역설계)
> 상태: **미검증 (Figma 연동 + 기획 문서 대기).** 수령 시: Figma 프레임 인벤토리 → `/office-hours` → `/plan-ceo-review`(스코프) → prd-clarifier(화면·상태를 *프레임에서* 열거) → 여기 기록 → 게이트 ⓐ.
- **디자인 SoT('무엇')**: Figma — _(링크 TBD)_ · 인벤토리: `docs/design/README.md`
- **기획 SoT('왜·스코프·데이터규칙')**: _(TBD — `docs/source/`)_
- In scope (MVP): _(TBD — 프레임 + 기획문서 교차)_
- Out of scope: _(TBD)_
- Open Questions / 디자인 공백: _(TBD)_
- UX Spec: prd-clarifier로 Screens/States(프레임 기반)/A11y 작성 예정. 충돌 시 *무엇=Figma, 왜·스코프=문서*.

## 3. Feature Work-Units (현 스프린트 — spec: docs/units/<slug>/spec.md)
| slug | story(L1) | owner | status | branch/PR | wave | gate |
|---|---|---|---|---|---|---|
| _(없음 — Sprint 0/분해 전)_ | | | | | | |
> 이슈/마일스톤/보드는 sprint-kickoff(게이트 ⓑ)에서 등록. 보드 = Grabit(#2).

## 4. Decisions This Sprint
> 스프린트 중 라이브 추가 (date · who · what · why). 아키텍처 결정은 `state/decisions.md`(ADR)에도.
- 2026-06-15 · 사용자/PM · **에이전트 오케스트레이션 시스템 이식 완료** (PM 중심 5-에이전트 + `/goal` + 안티-증식 작업단위 계약).
- 2026-06-15 · 사용자 · **워크플로우 = UI 역설계(디자인-퍼스트)**. UI가 Figma에 픽스(90%+). frontend는 디자인 생성 ❌ → Figma MCP로 프레임 연동해 **픽셀-퍼펙트 퍼블리싱**. PM은 Figma에서 스펙 역설계. SoT: *무엇=Figma, 왜·스코프=기획문서*. 게이트 ⓒ = 충실도 사인오프. 다음 = Figma 링크 + 기획 문서 수령 → Sprint 0(디자인 인벤토리).

## 5. Design System (Figma 추출)
> **디자인 = 고정 Figma SoT** (`docs/design/README.md`). frontend가 **디자인-시스템 단위**에서 Figma MCP로 토큰을 추출 → `src/app/styles`. 보이스 시드: `config/brand_seed.md`.
- Figma 파일: _(링크 TBD — 사용자 전달)_
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
Last updated: 2026-06-15 by PM (시스템 이식 + UI 역설계 워크플로우 채택. 다음 = Figma 링크 + 기획 문서 수령 → Sprint 0 디자인 인벤토리·스펙 역설계)
