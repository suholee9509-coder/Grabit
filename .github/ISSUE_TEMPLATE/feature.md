---
name: Feature Ticket
about: PM Agent가 생성하는 기능 티켓 양식 (또는 사용자가 수동으로)
title: "[Feature] "
labels: type:feature
---

## Goal
<무엇을 / 왜 — 1 문단>

## Acceptance Criteria
- [ ] <검증 가능한 결과 1>
- [ ] <검증 가능한 결과 2>
- [ ] <에지 케이스 또는 에러 처리>

## Context
- **Spec**: `shared-context/spec-{slug}.md`
- **Relevant files**: <list>
- **Depends on**: #<num> (있으면)
- **Related**: #<num>

## Definition of Done
`config/definitions_of_done.md` §<섹션 번호> 따름.

## Notes for Implementer
<선택. "이 부분 X처럼 처리하면 안 됨" 같은 가드레일>

---

🤖 PM Agent가 자동 생성한 티켓이라면 이 양식을 따라 채워집니다. 사람이 수동으로 만들면 PM Agent가 검토 후 보강 가능합니다.
