# Definitions of Done

작업단위 계약(`work-unit-contract.md`) 기반. 각 단계가 "끝났다"의 객관 기준.

## §1 Spec DoD (PM)
- [ ] `/office-hours` + `/plan-ceo-review` + prd-clarifier로 검증됨
- [ ] In/Out of scope 명확, Open Questions 답됨 또는 별도 처리 결정
- [ ] Command Center §2에 기록

## §2 Feature 작업단위 DoD (PM, 계획 시점)
- [ ] **L1 User Story + production acceptance** 정의 (1 story ≈ 1 unit)
- [ ] 수직 슬라이스로 분해 (화면/플로우 단위 — BE+FE+상태(프레임에서 열거)+배선+테스트 사전 열거, 스토리에서 도출)
- [ ] **성공조건 5섹션** 작성 (`work-unit-contract.md` §B) — 관찰가능·Boundaries 명시 · (UI면 **대상 Figma 프레임 + [fidelity](프레임 1:1) 기준**)
- [ ] 사이징 게이트 통과 (한 소유자·한 세션)
- [ ] `docs/units/<slug>/{spec,plan,status}.md` 생성 (spec = 성공조건)
- [ ] GitHub Issue 1개(feature-unit) + 라벨 3종 + 마일스톤
- [ ] **★ 게이트 ⓑ 사용자 분해 승인**

## §3 dev 완료 DoD (frontend/backend, goal-loop)
- [ ] spec.md 모든 Acceptance criteria(behavior·negative·non-regression·state·**(UI)[fidelity] 프레임 1:1**) 코드로 구현 + 매핑
- [ ] **no-fake-done**: 미충족 기준은 `escalation` (done 선언 ❌). 검증은 실제 명령 출력으로 증명
- [ ] **품질 게이트 전부**: `tsc --noEmit` 0 · lint 0 · 관련 테스트 통과(의미있는) · 셀프 `/review` 무이슈
- [ ] (UI) `/design-review` **충실도(지정 Figma 프레임 1:1) PASS** · 콘솔 에러 0 · **Figma 추출 토큰(§5)만 사용** · FSD 준수
- [ ] (조건 해당 BE) `/codex review` 통과 + 명시
- [ ] in-flight 발견 흡수됨 (새 티켓 0) · Boundaries 밖 미수정 · 디자인 공백은 추측 ❌(escalation)
- [ ] `status.md` 최신 · `/ship`으로 PR
- [ ] (UI 화면) **★ 게이트 ⓒ 충실도 사인오프**(Figma 프레임 1:1 픽셀-퍼펙트) 거침

## §4 기능 QA DoD (qa)
- [ ] **verify-first**: Validation 명령을 clean checkout에서 재실행 통과 (fail-fast — false-done 차단)
- [ ] **각 L1-x 스토리**(L1-a, L1-b, …) production acceptance를 *개별* e2e 재현 — **하나라도 미충족이면 유닛 FAIL** (모든 L1-x 충족 시에만 PASS)
- [ ] 슬라이스 전체 기준이 *실제 실행*으로 검증 (`/qa` + `/codex`, UI면 `/design-review` **프레임 1:1 충실도**)
- [ ] verdict가 모든 검증 정직 반영 (한쪽만 통과 = FAIL); PASS만 통합; FAIL은 같은 소유자 continuation

## §5 Security DoD (스프린트 말)
- [ ] `sprint/<n>-integration` 전수 `/cso` + 수동 4영역(auth/DB/API+AI/frontend·익스텐션)
- [ ] 분류 + Fix 가이드 + 추세 분석 → `state/security/sprint-{N}.md`
- [ ] Critical/High를 PM에 제안 티켓으로 반환

## §6 Sprint DoD
- [ ] 모든 단위 통합 + 기능 QA PASS
- [ ] 통합브랜치 보안 감사 완료
- [ ] **★ 게이트 ⓓ 사용자 최종 머지 승인** → main
- [ ] `/retro` → learnings + Command Center §4 · 보안 티켓 다음 스프린트 편입
- [ ] retro 지표: 계획외 하위단위 스폰 = 0
