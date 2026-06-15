# Grabit Sprint Command Center

> PM의 **단일 SoT(영속 메모리)**. PM이 매 오케스트레이션 루프에서 읽고 갱신한다.
> (정적 규칙은 `config/`, 누적 아키텍처 결정은 `state/decisions.md`.)

## 0. Product North Star
**크롬 익스텐션 기반 영상 클리핑·큐레이션 커리어 콘텐츠 플랫폼.** 막연한 성장 불안(FOMO)으로 커리어 콘텐츠를 소비하지만 성장을 체감하지 못하는 사람을 위해, 긴 영상의 핵심을 *클리핑·큐레이션*해 **체감되는 성장**으로 전환한다. 제품 SoT: 기획 문서 전달 후 `docs/source/`에 비치 → §2에서 검증.

## 1. Active Sprint
- Sprint: **0 (아키텍처 결정 + 스캐폴딩) — 미시작.** 기획 문서 수령 → 스펙 검증(§2) → ADR(`state/decisions.md`) → 게이트 ⓐ → 스캐폴딩.
- 목표(S0): 제품 스펙 검증 · 스택/데이터/AI 구조 ADR 확정 · FSD 스캐폴딩. (코드 기능 단위 없음)
- Milestone: _(미생성 — sprint-kickoff 시)_
- 통합브랜치: `sprint/0-integration` _(미생성)_
- 모드: Sprint 1 = 모드 2(트레이닝휠 — 각 dev 스폰 전 사용자 승인) → 이후 모드 1

## 2. Validated Spec / PRD
> 상태: **미검증 (기획 문서 대기).** 문서 수령 시: `/office-hours`(6 forcing Q) → `/plan-ceo-review`(스코프) → prd-clarifier(UX Spec) → 여기 기록 → 게이트 ⓐ.
- 제품 SoT: _(TBD — `docs/source/`)_
- In scope (MVP): _(TBD)_
- Out of scope: _(TBD)_
- Open Questions: _(TBD)_
- UX Spec: prd-clarifier로 Screens/States/A11y 작성 예정.

## 3. Feature Work-Units (현 스프린트 — spec: docs/units/<slug>/spec.md)
| slug | story(L1) | owner | status | branch/PR | wave | gate |
|---|---|---|---|---|---|---|
| _(없음 — Sprint 0/분해 전)_ | | | | | | |
> 이슈/마일스톤/보드는 sprint-kickoff(게이트 ⓑ)에서 등록. 보드 = Grabit(#2).

## 4. Decisions This Sprint
> 스프린트 중 라이브 추가 (date · who · what · why). 아키텍처 결정은 `state/decisions.md`(ADR)에도.
- 2026-06-15 · 사용자/PM · **에이전트 오케스트레이션 시스템 이식 완료** (PM 중심 5-에이전트 + `/goal` + 안티-증식 작업단위 계약). 다음 = 기획 문서 수령 → Sprint 0.

## 5. Brand System
> frontend `/design-consultation` Foundation 산출(토큰·보이스). 시드: `config/brand_seed.md`.
- 상태: **미작성** (브랜드 파운데이션 단위에서 도출 — 토큰/보이스 TBD).
- 토큰: `--color-*`, `--space-*`, `--text-*` (TBD) · 보이스: (TBD)

## 6. Escalations Open
| unit | question | awaiting |
|---|---|---|
| _(없음)_ | | |

## 7. Risks / WIP cap
- WIP 상한: **2 동시 단위** (기본 — 스프린트 계획 시 조정).
- 리스크: _(스프린트 계획 시 기록)_

---
Last updated: 2026-06-15 by PM (오케스트레이션 시스템 이식. 다음 = 기획 문서 수령 → 스펙 검증 → Sprint 0 ADR)
