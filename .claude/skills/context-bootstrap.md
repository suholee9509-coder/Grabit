---
name: context-bootstrap
trigger: 새 worktree에서 작업 시작 시 (자동)
who: 전 에이전트 (자기 자신)
---

# Context Bootstrap

새 워크트리에서 Cursor를 처음 열었을 때 *반드시* 거치는 컨텍스트 로딩 절차.

이 스킬은 보통 워크트리 루트의 `CLAUDE.md`가 자동으로 가이드하지만, 명시적으로도 호출 가능.

## 절차

### 1. 자기 페르소나 확인

```bash
# 현재 워크트리에서 어느 에이전트인지 확인
cat CLAUDE.md | head -5

# 페르소나 풀 정의 로드
cat .claude/agents/<my-type>.md
```

frontmatter의 `name`, `role`, `reads:`, `writes:`, `handoff-targets:` 머릿속 정리.

### 2. `reads:` 파일 일괄 로드

페르소나 frontmatter `reads:`의 모든 파일 읽기:

```bash
# 예시 (Dev Agent)
cat config/quality_standards.md
cat config/definitions_of_done.md
cat shared-context/architecture.md
cat shared-context/brand-system.md  # UI 티켓이면
```

핵심 규칙 / 표준을 *작업 시작 전에* 머릿속에 둔다.

### 3. 현재 티켓 확인 (있으면)

```bash
# 워크트리 이름에 ticket 번호 있으면
TICKET=$(echo "$PWD" | grep -oE 'ticket-[0-9]+' | grep -oE '[0-9]+')
gh issue view "$TICKET"
```

티켓 본문의 Goal / Acceptance Criteria / Context를 머릿속에.

### 4. 의존성 / 선행 작업 확인

```bash
# Depends-on 있으면 그것들 상태 확인
# (티켓 본문에서 "Depends on: #N" 패턴)
gh issue view <depends-on-issue>
```

선행 머지 안 됐으면 → 사용자에 보고 + 정지.

### 5. gstack healthcheck

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

미설치 시 작업 정지.

### 6. 브랜드 시스템 확인 (UI/Dev/QA UI 티켓)

```bash
test -f shared-context/brand-system.md && echo "BRAND_OK" || echo "BRAND_MISSING"
```

UI 작업이고 `BRAND_MISSING`이면 → Brand Designer Foundation 먼저 호출 필요. 사용자 알림 + 정지.

### 7. 사용자에 준비 완료 보고

```
✓ Context loaded.
- Persona: <agent-type>
- Ticket: #<N> "<title>"
- Reads: <count>개 파일 로드됨
- Tools: gstack OK, gh OK
- Ready to start.
```

---

## 빠른 호출 (`/load-context` 슬래시 명령)

위 1-6 단계를 자동화한 슬래시 명령. 새 워크트리 진입 후 첫 메시지로:
```
/load-context
```

`/load-context`가 위 절차를 실행하고 7번처럼 보고합니다.

---

## Failure Modes

- **CLAUDE.md 없음**: 워크트리 잘못 만들어짐. `./scripts/new-agent.sh` 재실행 필요.
- **에이전트 페르소나 파일 없음**: `.claude/agents/<type>.md` 누락. 메인 레포에서 확인.
- **`reads:` 파일 일부 없음**: 누락된 파일 사용자에 보고. 작업 가능 여부는 페르소나의 Failure Modes 따름 (예: brand-system.md 없으면 UI/UX Designer 정지).
- **gstack 미설치**: 작업 불가. CLAUDE.md의 gstack 섹션 따라 사용자 안내.
