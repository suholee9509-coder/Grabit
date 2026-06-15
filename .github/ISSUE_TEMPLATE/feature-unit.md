---
name: Feature 작업단위
about: 한 소유자가 한 worktree 세션에 end-to-end로 끝내는 수직 Feature 슬라이스
title: "<slug>: <한 줄 목표>"
labels: ["agent:frontend", "type:feature", "priority:P1"]
---

> 생성은 **PM만, 계획 시점에만**. 세부는 *이 이슈 내 체크리스트*로 (별도 이슈 ❌ — 보드 작게).
> 성공조건 정본: `docs/units/<slug>/spec.md` (이 이슈는 그 요약 + 추적). 구조·레퍼런스: `docs/units/README.md`.

## User Story (L1 — 검증의 north star · 각 인수기준이 여기로 추적)
- [ ] **L1-a** As a <user>, I can <do X> so that <value>.
- [ ] **L1-b** As a <user>, ...   (시나리오 여럿이면 라벨로 쪼갬)
**Production acceptance** (관찰가능): <prod-like 환경에서 사용자가 실제로 X를 할 수 있다 — QA가 각 L1-x를 e2e 검증>

## Owner
- [ ] frontend (UI = 인터랙티브 워크트리)  /  [ ] backend (헤드리스 /goal)   (라벨 `agent:*`와 일치)

## Figma frames (UI 유닛)
- <프레임 식별자/링크> (+ 빈/로딩/에러 상태)   — docs/design/README

## Success Criteria (= docs/units/<slug>/spec.md, dev `/goal` 조건 · 각 → L1-x)
- [ ] [behavior] <사용자가 X 할 수 있다> — 증명: <test/명령>  → L1-a
- [ ] [negative] <잘못된 입력/엣지에서 Y> — 증명: <test>
- [ ] [non-regression] <기존 Z 안 깨짐> — 증명: <test>
- [ ] [state] 빈/로딩/에러 각각 정의된 동작
- [ ] [fidelity] 지정 Figma 프레임과 1:1 (UI) — 증명: /design-review 충실도  → L1-b
- [ ] [quality] tsc 0 · lint 0 · 의미있는 테스트 통과 · 셀프 /review

## Boundaries
- only edit: <허용 경로>
- do not change: <인증·결제·마이그레이션 등>
- preserve: <계약/동작>

## Out of scope (의도적 제외)
- <항목> — <후속/다른 단위>

## In-flight 규칙
> 이 단위 범위 내 발견(엣지·배선·hardening·QA수정)은 *이 단위·이 소유자가 흡수*. 새 티켓 ❌.
> 범위 밖 발견은 PM에 보고 → 트리아지.
