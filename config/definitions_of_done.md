# Definitions of Done

각 작업 단위가 *완료*되었다고 선언하기 위해 만족해야 할 기준. **Dev**, **QA**, **PM**의 핵심 참조.

---

## §1. 일반 원칙

"Done"의 의미는 단계마다 다름. 각 단계의 DoD를 명확히 분리.

| 단계 | DoD 의미 |
|------|---------|
| Spec | "PM이 티켓 분해 가능" |
| Ticket (created) | "Dev가 작업 시작 가능" |
| PR (Dev) | "Reviewer 검토 가능" |
| PR (Reviewer APPROVE) | "QA 검증 가능" |
| PR (QA PASS) | "사용자 머지 가능" |
| Sprint | "보안 감사 가능" |

---

## §2. Spec DoD (Solution Planner 산출)

`shared-context/spec-{slug}.md`이 다음 모두 만족:

- [ ] **Problem** 1 문단 (누가, 무엇 때문에, 어떻게 막혀 있는지)
- [ ] **User**: persona 구체적 + JTBD 형태 ("I want to X so that Y") + status quo + desperation 등급
- [ ] **Success Criteria**: 검증 가능한 메트릭 ≥ 3개 (측정 불가 표현 금지)
- [ ] **In Scope**: 명확한 항목 리스트
- [ ] **Out of Scope**: 의도적 제외 ≥ 1개 (왜 제외했는지 1줄)
- [ ] **Open Questions**: PM이 답할 수 있는 수준
- [ ] **Strategic Notes**: 잘못된 전제 ≥ 1개 발견됨
- [ ] **`/prd-clarifier` 통과** — PRD에 `## UX Spec` 섹션 작성됨
- [ ] **추적 문서** (`shared-context/spec-{slug}-clarification-session.md`) 존재 + 모든 Q&A + Session Summary
- [ ] **모든 In Scope 항목**이 UX Spec의 Main Flows / Screens / Data Model에 매핑됨
- [ ] 사용자 컨펌
- [ ] git 커밋 (PRD + 추적 문서 둘 다)

---

## §3. Ticket DoD (PM Agent 산출)

GitHub Issue가 다음 모두 만족:

- [ ] Title이 명확 (≤ 80자)
- [ ] **Goal** 1 문단 (무엇을 / 왜)
- [ ] **Acceptance Criteria** ≥ 1개, 검증 가능한 체크리스트
- [ ] **Context** (Spec 링크, Relevant files, Depends-on if any)
- [ ] **Definition of Done** 섹션 참조 (이 문서의 §X)
- [ ] 라벨: agent:* + type:* + priority:* (각 1개씩)
- [ ] Milestone 어사인
- [ ] 추정 ≤ 300 LOC

---

## §4. Dev PR DoD (Dev Agent 산출)

PR이 다음 모두 만족:

- [ ] PR 본문에 What / Why / AC 매핑 / How / Testing / Out of Scope / Brand 미해결
- [ ] AC 매핑이 *실제 코드*와 일치 (체크박스 + 파일:라인)
- [ ] Self `/review` 통과 (issues 모두 처리)
- [ ] config/quality_standards.md 위반 없음
- [ ] 단위 테스트 추가 (외부 동작 기준, AC당 ≥ 1개)
- [ ] (UI PR) brand-system.md 토큰 사용 + `[copy:N]` 플레이스홀더
- [ ] (UI PR) 빈 / 에러 / 로딩 상태 처리
- [ ] Out of Scope 침범 X
- [ ] commit 메시지 의미 있음 (`fix bug` X)
- [ ] PR title이 conventional 또는 명확
- [ ] `Closes #N` 명시

---

## §5. Reviewer DoD (Reviewer Agent 산출)

PR review comment가 다음 모두 만족:

- [ ] Verdict 명확 (APPROVE / REQUEST_CHANGES / BLOCK)
- [ ] AC 검증 결과 모두 (체크박스 + file:line)
- [ ] Blocking issues 모두 file:line + 무엇 + 어떻게
- [ ] Style 선호 강요 X (config/quality_standards.md만 근거)
- [ ] Out of Scope 침범 검토됨
- [ ] (UI) brand-system.md 검증 결과
- [ ] /review 자동 분석 요약

APPROVE의 경우:
- [ ] AC 모두 ✓
- [ ] Blocking 0개
- [ ] Out of Scope 침범 없음

---

## §6. QA DoD (QA Agent 산출)

PR comment + 산출물이 다음 모두 만족:

- [ ] AC 시나리오 결과 (PASS/FAIL 명시)
- [ ] `/qa` 실행됨 + 결과
- [ ] `/codex` 실행됨 + 결과 (교차 검증)
- [ ] (UI) `/design-review` 실행됨
- [ ] Verdict (PASS / FAIL)
- [ ] (FAIL) 구체 수정 가이드
- [ ] regression 발견 시 별도 issue 생성됨
- [ ] sign-off (날짜 + 에이전트명)

PASS의 경우:
- [ ] `/qa` PASS
- [ ] `/codex` PASS
- [ ] (UI) `/design-review` 통과
- [ ] 모든 AC가 *실행*으로 검증됨

---

## §7. UI/UX Designer DoD

`design-output/<feature>/`이 다음 모두 만족:

- [ ] `/design-shotgun` 실행 → 사용자 변형 픽
- [ ] `/design-html` 산출물 (시맨틱 HTML + 디자인 토큰)
- [ ] `/design-review` 통과
- [ ] 모든 텍스트 = `[copy:N]` 플레이스홀더 (시스템 메시지 제외)
- [ ] `copy-placeholders.md`에 각 placeholder 컨텍스트 + 길이 + tone hint
- [ ] README.md (어떤 변형 픽, wiring 가이드)
- [ ] 빈 / 에러 / 로딩 상태 디자인 (필요한 경우)
- [ ] 접근성 (aria, role, 키보드)

---

## §8. Brand Designer DoD

### Foundation
`shared-context/brand-system.md`이 다음 모두 만족:

- [ ] 5섹션 모두 (Essence / Audience / Visual / Voice / Do's and Don'ts)
- [ ] 색 페어 접근성 검증됨 (대비 ratio)
- [ ] CSS 변수 (Dev이 직접 사용)
- [ ] Voice DO/DON'T ≥ 3개 each + 예시
- [ ] Visual/Verbal Do's & Don'ts ≥ 5개 each
- [ ] 사용자 컨펌
- [ ] git 커밋

### Production (1 자산당)
`shared-context/copy/<...>.md` 또는 `shared-context/brand/briefs/<...>.md`:

- [ ] 3 variants (Direct / Curious / Concrete) + Why
- [ ] 추천 명확
- [ ] 사용자 픽
- [ ] brand-system.md 준수 명시 (어느 §)
- [ ] git 커밋

---

## §9. Security DoD

`shared-context/security/sprint-{N}.md`이 다음 모두 만족:

- [ ] 머지된 PR 모두 검토됨 (목록 명시)
- [ ] `/cso` 실행됨
- [ ] 수동 검토 4영역 (auth, DB, API, frontend)
- [ ] 발견 사항 분류 (Critical / High / Medium / Low) + 분류 이유
- [ ] 모든 Critical / High에 Fix 가이드
- [ ] 신규 티켓 모두 생성됨 (Critical은 P0, High는 P1)
- [ ] 이전 스프린트 trend 분석
- [ ] PM에 통합 요청 이슈

---

## §10. Sprint DoD

스프린트가 다음 모두 만족:

- [ ] Milestone의 모든 이슈 closed
- [ ] 모든 PR merged (또는 의도적 다음 스프린트로 이동)
- [ ] Security Agent 호출됨 + 리포트 작성됨
- [ ] sprint-memory.md 회고 추가
- [ ] Critical/High 보안 티켓 다음 스프린트 통합 결정됨
- [ ] Milestone closed

---

## §11. DoD 위반 시

- 핸드오프 차단 (다음 에이전트로 못 넘김)
- 미충족 항목 사용자 보고
- 처리 후 재시도

DoD가 부족하다고 느끼면 → 별도 티켓으로 보강 PR.
