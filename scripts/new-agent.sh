#!/usr/bin/env bash
# 사용: ./scripts/new-agent.sh <agent-type> [<ticket-number>]
# 효과:
#   1) git worktree 생성 (worktrees/<type>-{ticket-N}-<uuid>)
#   2) 워크트리 안에 CLAUDE.md 자동 작성 (페르소나 + 티켓 컨텍스트)
#   3) Cursor 자동 오픈
#
# 예시:
#   ./scripts/new-agent.sh solution-planner       # 전략 작업
#   ./scripts/new-agent.sh dev 5                  # 티켓 #5의 Dev 작업
#   ./scripts/new-agent.sh reviewer 5             # 티켓 #5 PR 리뷰
#   ./scripts/new-agent.sh security 1             # Sprint 1 보안 감사

set -euo pipefail

# 인자 검증
if [ $# -lt 1 ]; then
  echo "사용: $0 <agent-type> [<ticket-number>]"
  echo "agent-type: solution-planner | pm-agent | dev | reviewer | qa | ui-ux-designer | brand-designer | security"
  exit 1
fi

AGENT_TYPE=$1
TICKET=${2:-}

# 유효한 에이전트 타입 검증
VALID_TYPES=("solution-planner" "pm-agent" "dev" "reviewer" "qa" "ui-ux-designer" "brand-designer" "security")
if [[ ! " ${VALID_TYPES[*]} " =~ " ${AGENT_TYPE} " ]]; then
  echo "✗ 유효하지 않은 agent-type: $AGENT_TYPE"
  echo "  허용: ${VALID_TYPES[*]}"
  exit 1
fi

# 페르소나 파일 존재 확인
PERSONA=".claude/agents/${AGENT_TYPE}.md"
if [ ! -f "$PERSONA" ]; then
  echo "✗ 페르소나 파일 없음: $PERSONA"
  exit 1
fi

# 워크트리 경로 + 브랜치 이름 (UUID로 unique)
UUID=$(uuidgen | cut -c1-6 | tr '[:upper:]' '[:lower:]')

if [ -n "$TICKET" ]; then
  # 보안/스프린트 에이전트는 sprint-N 형태
  if [ "$AGENT_TYPE" = "security" ]; then
    WORKTREE_NAME="${AGENT_TYPE}-sprint-${TICKET}-${UUID}"
    BRANCH="agent/${AGENT_TYPE}-sprint-${TICKET}-${UUID}"
    CONTEXT_LINE="현재 스프린트: ${TICKET}"
  elif [ "$AGENT_TYPE" = "reviewer" ] || [ "$AGENT_TYPE" = "qa" ]; then
    # PR 리뷰/QA는 보통 PR 번호 기준
    WORKTREE_NAME="${AGENT_TYPE}-pr-${TICKET}-${UUID}"
    BRANCH="agent/${AGENT_TYPE}-pr-${TICKET}-${UUID}"
    CONTEXT_LINE="현재 PR: #${TICKET}"
  else
    WORKTREE_NAME="${AGENT_TYPE}-ticket-${TICKET}-${UUID}"
    BRANCH="agent/${AGENT_TYPE}-${TICKET}-${UUID}"
    CONTEXT_LINE="현재 티켓: #${TICKET}"
  fi
else
  # 지속 워크트리 (Solution Planner, PM, UI/UX, Brand 등 — 티켓 없을 때)
  WORKTREE_NAME="${AGENT_TYPE}-${UUID}"
  BRANCH="agent/${AGENT_TYPE}-${UUID}"
  CONTEXT_LINE="(전략 작업 — 특정 티켓 없음)"
fi

WORKTREE_PATH="worktrees/${WORKTREE_NAME}"

# 워크트리 디렉토리 이미 있으면 거부
if [ -d "$WORKTREE_PATH" ]; then
  echo "✗ 워크트리 이미 존재: $WORKTREE_PATH"
  exit 1
fi

# git worktree 생성 (main 브랜치 기준)
echo "▸ git worktree 생성: $WORKTREE_PATH"
git worktree add -b "$BRANCH" "$WORKTREE_PATH" >/dev/null

# 워크트리 안에 CLAUDE.md 자동 작성
TICKET_BLOCK=""
if [ -n "$TICKET" ] && [ "$AGENT_TYPE" != "security" ]; then
  if [ "$AGENT_TYPE" = "reviewer" ] || [ "$AGENT_TYPE" = "qa" ]; then
    TICKET_BLOCK="
**현재 PR**: #${TICKET}

\`\`\`bash
gh pr view ${TICKET}      # PR 정보
gh pr diff ${TICKET}      # diff 보기
\`\`\`
"
  else
    TICKET_BLOCK="
**현재 티켓**: #${TICKET}

\`\`\`bash
gh issue view ${TICKET}   # 티켓 본문 + AC + Context
\`\`\`
"
  fi
elif [ -n "$TICKET" ] && [ "$AGENT_TYPE" = "security" ]; then
  TICKET_BLOCK="
**스프린트**: ${TICKET}

\`\`\`bash
gh issue list --milestone \"Sprint ${TICKET}\" --state closed   # 머지된 이슈
gh pr list --milestone \"Sprint ${TICKET}\" --state merged       # 머지된 PR
\`\`\`
"
fi

cat > "$WORKTREE_PATH/CLAUDE.md" <<EOF
# 당신은 ${AGENT_TYPE} Agent입니다

${CONTEXT_LINE}

## 페르소나 (이 파일 다음에 반드시 읽어야 함)

\`.claude/agents/${AGENT_TYPE}.md\`

페르소나의 frontmatter \`reads:\`에 명시된 모든 파일을 \`/load-context\`로 일괄 로드하세요.
${TICKET_BLOCK}

## 작업 시작 절차

1. \`/load-context\` 실행 → 페르소나 + reads 파일 일괄 로드
2. gstack healthcheck (페르소나가 안내)
3. 페르소나의 "워크플로우" 따름
4. 완료 시 \`/handoff <next-agent>\` 또는 (작업 종료)

## 워크트리 정보

- 경로: ${WORKTREE_PATH}
- 브랜치: ${BRANCH}
- 메인 레포의 모든 \`.claude/\`, \`config/\`, \`shared-context/\`, \`scripts/\` 그대로 사용 가능

## 메인 레포의 빠른 참조

- 페르소나 정의: \`.claude/agents/\`
- 워크플로우: \`.claude/skills/\`
- 슬래시 명령: \`.claude/commands/\`
- 정적 표준: \`config/\`
- 런타임 컨텍스트: \`shared-context/\`
- 도구: \`scripts/\`, gstack

당신의 정체성과 역할은 \`.claude/agents/${AGENT_TYPE}.md\`에 있습니다. 그 파일을 읽고 작업을 시작하세요.
EOF

echo "▸ CLAUDE.md 작성됨: $WORKTREE_PATH/CLAUDE.md"

# Cursor 자동 오픈
if command -v cursor >/dev/null 2>&1; then
  cursor "$WORKTREE_PATH"
  echo "▸ Cursor 오픈: $WORKTREE_PATH"
else
  echo "⚠ cursor CLI 없음. 수동 오픈 필요:"
  echo "  cursor $WORKTREE_PATH"
  echo "  (Cursor 앱 → Command Palette → 'Install cursor command in PATH')"
fi

# 결과 요약
echo ""
echo "✅ ${AGENT_TYPE} 워크트리 준비 완료"
echo "  Path: $WORKTREE_PATH"
echo "  Branch: $BRANCH"
if [ -n "$TICKET" ]; then
  echo "  ${CONTEXT_LINE}"
fi
echo ""
echo "다음 단계: Cursor에서 \`/load-context\` 입력해서 컨텍스트 로드"
