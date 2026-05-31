---
name: Bug Report
about: 버그 리포트 (사용자 또는 QA Agent가 발견)
title: "[Bug] "
labels: type:bug
---

## What's broken
<관찰된 동작 — 1 문단>

## Expected behavior
<기대 동작>

## Reproduction steps
1.
2.
3.

## Environment
- 브라우저 / OS / 버전:
- (해당 시) 사용자 ID / 세션:
- 발견 시점:

## Severity / Priority 추정
- [ ] P0 — 데이터 손실 / 보안 / 프로덕션 다운
- [ ] P1 — 핵심 기능 작동 안 함
- [ ] P2 — 일부 기능 영향
- [ ] P3 — 사소함

## Acceptance Criteria (수정 후)
- [ ] <regression 테스트 추가>
- [ ] <원래 시나리오 정상 작동>
- [ ] (선택) 관련 영역 추가 검증

## Context
- **Related PR**: #<num> (이 PR의 회귀라면)
- **Sprint**: <어느 스프린트에서 발견>
- **Discovered by**: <agent:qa / 사용자 / Sprint security 등>

## Definition of Done
`config/definitions_of_done.md` §4 (Dev PR DoD) 따름. 추가로:
- [ ] regression 테스트 1개
- [ ] 근본 원인 분석 (포스트모템 노트 — 큰 버그면)
