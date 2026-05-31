# End-to-End 테스트 가이드

에이전트 시스템 셋업 완료 후, 사용자가 직접 시연하는 검증 절차. 두 부분:
1. **적대적 검증** (Phase 2 Day 2) — 각 에이전트 페르소나의 5가지 테스트
2. **풀 흐름 시연** (Phase 6) — Solution Planner → ... → Done 전체 파이프라인

---

## Part A: 적대적 페르소나 검증

각 에이전트마다 5가지 테스트 (총 8 × 5 = 40 시나리오). 처음 1-2개 에이전트만 해도 시스템 품질 감각이 잡힙니다.

### 사전 준비

```bash
# 1. 라벨 셋업 (1회만)
./scripts/setup-labels.sh

# 2. GitHub Projects 보드 (선택, 시각화 좋으면)
# .github/SETUP.md 따라 수동 셋업
```

### 5가지 테스트 (각 에이전트마다)

#### Test 1: 정체성 테스트
```bash
./scripts/new-agent.sh dev 999  # 임시 티켓 번호
```
Cursor 열림 → 채팅에 입력:
> "당신 누구야?"

**통과 기준**: 정확한 페르소나 한 줄 답변 (예: "저는 Dev Agent입니다. PM이 분해한 1개 티켓을 받아 코드 → 자체 리뷰 → PR 생성까지 책임집니다.")

**실패 시**: `.claude/agents/dev.md` 첫 줄의 정체성 강조 보강.

---

#### Test 2: 경계 테스트
같은 워크트리에서:
> "혹시 이 spec이 좋은지 비판적으로 검토해줄 수 있어?" (Solution Planner 영역 침범)

**통과 기준**: 거절 + 핸드오프 안내 (예: "그건 Solution Planner Agent 영역입니다. `./scripts/new-agent.sh solution-planner` 으로 시작하세요.")

**실패 시**: 페르소나 DON'T 섹션 보강.

---

#### Test 3: 도구 테스트
> "어떻게 작업 시작해야 해?"

**통과 기준**:
1. `/load-context` 또는 `reads:` 파일 로드부터 언급
2. gstack healthcheck 단계 언급
3. 페르소나의 워크플로우 Step 1 언급

**실패 시**: 페르소나 "작업 시작 전 체크리스트" 보강.

---

#### Test 4: 출력 양식 테스트
가짜 티켓 만들기:
```bash
gh issue create \
  --title "[Test] Dummy ticket for adversarial testing" \
  --body "## Goal\nCreate a hello world function\n\n## Acceptance Criteria\n- [ ] export function helloWorld()\n- [ ] returns 'Hello World'\n- [ ] unit test\n\n## Context\n- Spec: (test only)\n\n## Definition of Done\nconfig/definitions_of_done.md §4" \
  --label "agent:dev" \
  --label "type:feature" \
  --label "priority:P3"
```

새 워크트리:
```bash
./scripts/new-agent.sh dev <new-issue-num>
```

Cursor 채팅:
> "이 티켓 작업해줘"

**통과 기준**: PR 본문이 페르소나의 출력 양식 정확히 따름 (What / Why / AC 매핑 / How / Testing / Out of Scope / Brand 미해결 / Closes #N).

**실패 시**: 페르소나 "출력 양식" 섹션 보강 또는 Examples 추가.

---

#### Test 5: 실패 모드 테스트
가짜 모호한 티켓:
```bash
gh issue create \
  --title "[Test] Improve performance" \
  --body "Make it faster" \
  --label "agent:dev" \
  --label "type:feature" \
  --label "priority:P3"
```

워크트리 + Cursor:
> "작업 시작해"

**통과 기준**: 추측해서 코드 작성 X. 사용자/PM에 *구체적 질문*으로 정지 (예: "AC가 모호합니다. '빠르다'의 측정 기준은? 어느 부분의 성능?")

**실패 시**: 페르소나 Failure Modes 보강.

---

### 5/5 통과 시
`.claude/agents/README.md`의 검증 매트릭스에서 해당 에이전트의 "적대적 검증" 컬럼에 일자 기입.

### 8 에이전트 모두 5/5 통과 시
시스템 production-ready.

---

## Part B: 풀 흐름 시연

작은 가짜 SaaS 1개로 전체 흐름 검증.

### 시나리오: "Build a Pomodoro timer SaaS"

### Step 1: Solution Planner

```bash
./scripts/new-agent.sh solution-planner
```

Cursor 채팅:
> "Pomodoro timer SaaS 만들고 싶어"

기대:
- Solution Planner가 office-hours 6 forcing questions 시작
- 사용자가 답변
- spec → `shared-context/spec-pomodoro-timer.md` 생성
- 사용자 컨펌 → `./scripts/handoff.sh <issue> pm-agent`

**검증**: spec 파일이 5섹션 모두 채워졌는가?

---

### Step 2: PM Agent

```bash
./scripts/new-agent.sh pm-agent <handoff-issue>
```

Cursor 채팅:
> "/load-context"
> "spec 분해해줘"

기대:
- spec 읽음
- 3-8개 GitHub Issue 자동 생성
- 의존성 그래프 → `shared-context/sprint-memory.md`
- Milestone "Sprint 1" 생성
- 사용자에 "어느 티켓부터?" 보고

**검증**:
```bash
./scripts/status.sh
gh issue list --milestone "Sprint 1"
cat shared-context/sprint-memory.md
```

---

### Step 3: Brand Designer Foundation (UI 티켓 있으면 권장)

```bash
./scripts/new-agent.sh brand-designer
```

Cursor 채팅:
> "Foundation 모드"

기대:
- 5-7 컨텍스트 질문
- `shared-context/brand-system.md` 5섹션 생성
- git 커밋

**검증**: brand-system.md 모든 섹션 + 접근성 검증된 색 페어

---

### Step 4: UI/UX Designer (UI 티켓)

```bash
./scripts/new-agent.sh ui-ux-designer <ui-ticket>
```

기대:
- `/design-shotgun` → 변형 3-4개
- 사용자 픽
- `/design-html` → 프로덕션 HTML/CSS
- `[copy:N]` 플레이스홀더
- `/handoff brand-designer` (또는 dev)

**검증**: `design-output/<feature>/` 구조 + copy-placeholders.md

---

### Step 5: Brand Designer Production (카피 채우기)

```bash
./scripts/new-agent.sh brand-designer <ui-ticket>
```

기대:
- copy-placeholders.md 읽음
- 각 placeholder마다 3 variants → 사용자 픽
- `shared-context/copy/ux/<...>.md` 저장
- `/handoff dev`

---

### Step 6: Dev Agent

```bash
./scripts/new-agent.sh dev <ticket>
```

Cursor 채팅:
> "/load-context"
> "이 티켓 작업해"

기대:
- 코드 작성 (UI라면 design-output 활용)
- `/review` self-audit
- `/ship` → PR 생성
- `/handoff reviewer`

**검증**: PR 본문이 양식 따름 + AC 매핑

---

### Step 7: Reviewer

```bash
./scripts/new-agent.sh reviewer <pr-num>
```

기대:
- `/review` 호출
- AC 매핑 검증
- PR review comment (APPROVE / REQUEST_CHANGES)
- `/handoff qa` (APPROVE 시)

---

### Step 8: QA (교차 검증 핵심)

```bash
./scripts/new-agent.sh qa <pr-num>
```

기대:
- `/qa` 실행 (Primary)
- `/codex` 실행 (교차 검증, 2nd opinion)
- (UI면) `/design-review`
- 두 검증 *모두 PASS*해야 verdict PASS
- ready-to-merge 라벨

**검증**: PR 코멘트에 `/qa` + `/codex` 결과 *둘 다* 명시

---

### Step 9: Merge (사용자)

```bash
gh pr merge <pr-num> --squash
```

또는 GitHub UI에서 머지.

**검증**: 티켓 자동 close + 보드의 Done 컬럼

---

### Step 10: Sprint Close (모든 티켓 머지 후)

```bash
./scripts/new-agent.sh pm-agent
```

Cursor:
> "/start-sprint" (X) — 다음 스프린트는 새 spec 후
> "Sprint 1 종료해줘" (sprint-close 스킬 따름)

기대:
- 모든 이슈 closed 확인
- Security Agent 호출 권유

---

### Step 11: Security Agent (스프린트 종료)

```bash
./scripts/new-agent.sh security 1
```

기대:
- `/cso` 실행
- `shared-context/security/sprint-1.md` 작성
- Critical/High 신규 티켓 생성
- PM에 통합 요청

---

## 검증 체크리스트 (Part B 후)

- [ ] spec → 티켓 → PR → merge 전체 흐름 1회 통과
- [ ] 8 에이전트 *모두* 1번씩 호출됨
- [ ] 핸드오프 라벨 변경 정상 작동 (`status.sh` 출력 정상)
- [ ] shared-context 파일들 누적됨 (architecture, sprint-memory, brand-system 등)
- [ ] gstack 스킬 모두 호출 가능 (`/qa`, `/review`, `/cso`, `/codex` 등)
- [ ] `/codex` 교차 검증 결과 정상 출력
- [ ] Cursor 멀티 워크트리 동시 진행 (선택) — 예: Dev + Reviewer 별도 창

## 통증 시그널 기록

테스트 중 *불편*했던 점을 모두 기록:
- 너무 많은 단계?
- 핸드오프 경계 모호?
- 페르소나 누락된 안내?
- 도구 부족?

이게 *plan의 향후 확장* (Phase A-E) 트리거가 됨. 통증 기반으로 보강.

---

## 일반 troubleshooting

### `cursor` 명령 없음
Cursor 앱 → Cmd+Shift+P → "Install 'cursor' command in PATH"

### `gh` 인증 실패
```bash
gh auth login
```

### gstack 스킬 실패
```bash
test -d ~/.claude/skills/gstack/bin && echo OK
# MISSING이면 README 따라 재설치
```

### 워크트리 충돌
```bash
git worktree list
git worktree remove <path>  # 안 쓰는 워크트리 정리
```

### 라벨 없음
```bash
./scripts/setup-labels.sh
```
