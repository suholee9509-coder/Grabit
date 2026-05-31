# Handoff Rules

에이전트 간 핸드오프의 표준 규칙. 모든 에이전트가 따름.

---

## §1. 일반 원칙

### §1.1 한 번에 한 에이전트
- 1 티켓은 *정확히 1개* `agent:*` 라벨
- 두 에이전트가 동시에 같은 티켓 작업 X
- 핸드오프 시점이 명확

### §1.2 명시적 핸드오프
- 핸드오프는 `./scripts/handoff.sh` 또는 `/handoff <agent>` 슬래시 명령으로
- 라벨 직접 수정 / GitHub UI 사용 X (스크립트가 보장하는 일관성 유지)

### §1.3 Self-Review 통과 필수
- 자기 페르소나의 Self-Review Checklist 모두 ✓
- 미통과 시 핸드오프 거부

---

## §2. 허용된 핸드오프 매트릭스

각 에이전트의 `handoff-targets`만 허용:

| From | 허용된 To |
|------|----------|
| solution-planner | pm-agent |
| pm-agent | dev, ui-ux-designer, brand-designer |
| ui-ux-designer | dev, brand-designer |
| brand-designer (Foundation) | (대기 — 자동 핸드오프 없음) |
| brand-designer (Production) | dev, ui-ux-designer |
| dev | reviewer |
| reviewer | qa (APPROVE), dev (REQUEST_CHANGES) |
| qa | (merge 권장 — 사용자가 머지), dev (FAIL 시) |
| security | pm-agent (다음 스프린트 통합) |

위 매트릭스 외 핸드오프는 거부.

---

## §3. 산출물 요건 (핸드오프 시 만족해야 함)

### §3.1 → PM Agent (from Solution Planner)
- [ ] `shared-context/spec-{slug}.md` 5섹션 완성
- [ ] 사용자 컨펌
- [ ] git 커밋

### §3.2 → Dev / UI/UX Designer / Brand Designer (from PM)
- [ ] GitHub Issue 생성됨 + agent/type/priority 라벨
- [ ] Milestone 어사인
- [ ] 본문에 AC + Context + Depends-on (있으면)
- [ ] sprint-memory.md 업데이트

### §3.3 → Brand Designer (from UI/UX Designer)
- [ ] `design-output/<feature>/copy-placeholders.md`에 모든 `[copy:N]` + 컨텍스트
- [ ] HTML/CSS 산출물 + brand-system.md 토큰 사용

### §3.4 → Dev (from UI/UX Designer 또는 Brand Designer)
- [ ] (UI/UX) `design-output/<feature>/README.md` 작성됨
- [ ] (Brand) 카피 `shared-context/copy/<...>.md`에 picked variant + git 커밋

### §3.5 → Reviewer (from Dev)
- [ ] PR 생성됨 (`/ship` 통해)
- [ ] PR 본문에 AC 매핑
- [ ] Self `/review` 통과
- [ ] Out of Scope 침범 없음

### §3.6 → QA (from Reviewer)
- [ ] PR review comment: APPROVE
- [ ] AC 검증 결과 모두 ✓
- [ ] Issues Found = 빈 (Blocking 0)

### §3.7 → Dev (from Reviewer or QA, 회귀)
- [ ] Verdict 코멘트에 *구체* 수정 가이드 (file:line + 무엇 + 어떻게)
- [ ] FAIL 이유 분류됨

### §3.8 → "ready-to-merge" (from QA)
- [ ] `/qa` PASS
- [ ] `/codex` PASS (교차 검증)
- [ ] (UI면) `/design-review` 통과
- [ ] PR comment에 verdict + sign-off

### §3.9 → PM Agent (from Security)
- [ ] `shared-context/security/sprint-{N}.md` 작성됨
- [ ] Critical/High 신규 티켓 모두 생성
- [ ] 통합 요청 이슈 생성

---

## §4. 회귀 (Regress) 규칙

### §4.1 Reviewer → Dev
- 라벨: `agent:reviewer` 제거 → `agent:dev` 추가
- PR review = REQUEST_CHANGES (gh pr review --request-changes)
- 같은 PR 사용 (새 PR X)
- Dev가 수정 + 다시 push → 자동으로 PR 업데이트
- Dev가 다시 `/handoff reviewer`로 핸드오프

### §4.2 QA → Dev
- 라벨: `agent:qa` 제거 → `agent:dev` 추가
- PR comment에 FAIL verdict
- 같은 PR 사용
- 회귀 후 Reviewer를 *다시 거치는지*는 변경 양에 따름:
  - 작은 수정 (< 30 LOC): Reviewer 생략 가능 (Dev가 명시적 결정)
  - 큰 수정: Reviewer 다시 거침 (`/handoff reviewer`)

### §4.3 회귀 한도
- 같은 티켓이 *3+ 회 회귀*하면 → blocker. 사용자에 보고:
  > "티켓 #N이 N번 회귀했습니다. 근본 문제 검토 필요. spec 재검증 또는 PM 분해 재논의 권장."

---

## §5. 다중 에이전트 협업 (UI 작업 예시)

UI 티켓의 일반 흐름:

```
PM → UI/UX Designer → Brand Designer (카피) → Dev → Reviewer → QA → ready-to-merge
        ↑                  ↓
        └─── (UI/UX가 brand-system.md 부족 발견 시 회귀 가능)
```

### 핵심
- UI/UX Designer가 카피 *위치만* 정함 (`[copy:N]`)
- Brand Designer가 *내용* 채움
- Dev는 둘 다 받아 wiring + 적용
- 빠른 케이스 (간단한 UI): UI/UX → Dev 직접, Dev이 [copy:N] 그대로 두고 Brand 후속 호출

---

## §6. 비동기 / 병렬 핸드오프

### §6.1 가능한 케이스
- 같은 스프린트의 *다른 티켓* → 병렬
- 같은 티켓의 다른 에이전트 → 직렬 (위 매트릭스 따름)

### §6.2 사용자 컨트롤
- 사용자가 어느 티켓을 *시작 가능한지* 보드에서 확인 (`./scripts/status.sh`)
- 동시에 여러 워크트리 / 여러 Cursor 창 가능
- 단, Claude 구독 rate limit 주의 (동시 활성 4개 이하 권장)

---

## §7. 핸드오프 거부 시나리오

다음 시 핸드오프 *하지 마라* + 사용자에 알림:

1. Self-Review 미통과
2. 산출물 검증 실패 (writes 항목 누락)
3. handoff-targets 위반
4. Depends-on 미머지 (다음 에이전트가 작업 못함)
5. gstack 또는 gh CLI 도구 실패

각 케이스 → 페르소나의 Failure Modes 따름.
