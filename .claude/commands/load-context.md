---
description: 현재 에이전트의 frontmatter reads 파일을 일괄 로드합니다
---

# /load-context

사용자가 `/load-context`를 입력했습니다.

## 절차

### 1. 현재 에이전트 타입 확인

```bash
# 워크트리의 CLAUDE.md에서 에이전트 타입 추출
AGENT_TYPE=$(cat CLAUDE.md | grep -oE '당신은 [a-z-]+ Agent' | head -1 | awk '{print $2}')

# 또는 워크트리 디렉토리 이름에서 추출 (백업)
if [ -z "$AGENT_TYPE" ]; then
  AGENT_TYPE=$(echo "$PWD" | grep -oE 'worktrees/[a-z-]+' | sed 's|worktrees/||' | sed 's|-ticket.*||' | sed 's|-pr.*||' | sed 's|-sprint.*||')
fi

echo "Agent: $AGENT_TYPE"
```

### 2. 페르소나 frontmatter 읽기

```bash
PERSONA=".claude/agents/${AGENT_TYPE}.md"
test -f "$PERSONA" || { echo "✗ 페르소나 파일 없음: $PERSONA"; exit 1; }
```

`reads:` 섹션 추출 (yaml frontmatter 안):
- `config/quality_standards.md`
- `shared-context/architecture.md`
- ...

### 3. 각 reads 파일 로드

```bash
# 예시 — 실제로는 페르소나의 frontmatter를 파싱해서 동적으로
for FILE in $(yq '.reads[]' "$PERSONA"); do
  echo "=== $FILE ==="
  cat "$FILE" 2>/dev/null || echo "  (없음 — 작업 가능 여부는 페르소나 Failure Modes 참조)"
done
```

(yq가 없으면 grep + sed로 frontmatter 파싱)

### 4. 추가 컨텍스트 로드

페르소나 외에 자주 필요한 것:
- 현재 티켓 (워크트리 이름에서 번호 추출 → `gh issue view`)
- gstack healthcheck

### 5. 사용자에 요약 보고

```
✓ Context loaded (agent: $AGENT_TYPE)
- Persona: .claude/agents/$AGENT_TYPE.md ✓
- Reads (N개): 
  - config/quality_standards.md ✓
  - shared-context/architecture.md ✓
  - ...
- Ticket: #N "<title>" ✓ (또는 "no ticket — strategic mode")
- gstack: OK / MISSING
- Brand system: OK / MISSING
- Ready to start.
```

## Failure Modes

- **페르소나 파일 없음**: 메인 레포의 `.claude/agents/<type>.md` 확인. 누락이면 시스템 셋업 미완료.
- **`reads:` 파일 일부 없음**: 페르소나 Failure Modes 참조해 작업 가능 여부 결정. 예: brand-system.md 없으면 UI/UX Designer는 정지.
- **워크트리 이름에서 에이전트 타입 추출 실패**: `pwd`로 사용자에 보여주고 수동으로 어떤 에이전트인지 확인.
