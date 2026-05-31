---
description: 현재 워크트리의 티켓을 다음 에이전트로 핸드오프합니다
argument-hint: <next-agent-type>
---

# /handoff

사용자가 `/handoff <next-agent>`를 입력했습니다.

## 절차

### 1. 현재 워크트리에서 티켓 번호 추출

```bash
# 워크트리 디렉토리 이름에서 ticket 번호 패턴 매칭
TICKET=$(echo "$PWD" | grep -oE 'ticket-[0-9]+' | grep -oE '[0-9]+')

if [ -z "$TICKET" ]; then
  echo "✗ 현재 워크트리에 ticket 번호 없음. 수동으로 처리:"
  echo "  ./scripts/handoff.sh <issue-number> $1"
  exit 1
fi
```

### 2. Self-Review 통과 확인

`.claude/skills/handoff-checklist.md`의 체크리스트 + 자기 페르소나의 "Self-Review Checklist" 모두 통과 확인.

**미통과 항목 있으면** → 핸드오프 *하지 마라*. 사용자에 미통과 항목 보고.

### 3. 산출물 검증

자기 페르소나 frontmatter `writes:` 항목이 모두 작성/업데이트되었는지 확인:
```bash
# 페르소나 frontmatter writes: 의 각 파일/리소스 존재 검증
```

### 4. shared-context 커밋 (필요 시)

```bash
git add shared-context/
git commit -m "<agent>: <한 줄 요약>"  # 변경 있으면만
```

### 5. 핸드오프 실행

```bash
./scripts/handoff.sh "$TICKET" "$1"
```

이 스크립트가 자동으로:
- agent:* 라벨 변경
- 핸드오프 코멘트 게시
- (라벨 변경에 의해) GitHub Projects 컬럼 자동 이동

### 6. 사용자에 보고

```
✓ Issue #$TICKET handoff to agent:$1
✓ 다음: ./scripts/new-agent.sh $1 $TICKET 으로 새 워크트리 시작
```

## Failure Modes

- **인자 미제공** (`/handoff` 만 입력): "다음 에이전트를 명시하세요. 예: `/handoff reviewer`"
- **유효하지 않은 agent type**: 페르소나의 `handoff-targets` 확인. 허용되지 않으면 거부.
- **Self-Review 미통과**: 핸드오프 거부. 미통과 항목 명시 + 처리 후 재시도 안내.
