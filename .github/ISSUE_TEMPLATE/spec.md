---
name: New Goal / Spec Request
about: 사용자가 새 목표를 등록하면 Solution Planner가 처리할 티켓
title: "[New Goal] "
labels: agent:solution-planner, type:planning
---

## 사용자 입력 목표
<원본 그대로 — 사용자 언어>

## 컨텍스트 (있으면)
- 왜 지금:
- 관련 사용자 피드백:
- 관련 이전 스프린트:

## Solution Planner 작업

이 티켓을 받은 Solution Planner는:
1. `./scripts/new-agent.sh solution-planner` 으로 워크트리 시작
2. 이 티켓에 `gh issue view <N>` 으로 사용자 입력 확인
3. 페르소나 워크플로우 따름:
   - Office-hours 6 forcing questions
   - Plan-CEO-review 전제 도전
   - `shared-context/spec-{slug}.md` 작성
4. 사용자 컨펌 후 `./scripts/handoff.sh <N> pm-agent`

## 산출물
- `shared-context/spec-{slug}.md` (Solution Planner 페르소나 양식 따름)

## Definition of Done
`config/definitions_of_done.md` §2 (Spec DoD) 따름.
