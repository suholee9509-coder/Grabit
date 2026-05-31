#!/usr/bin/env bash
# 사용: ./scripts/handoff.sh <issue-number> <next-agent>
# 효과:
#   1) 현재 agent:* 라벨 모두 제거
#   2) agent:<next-agent> 라벨 추가
#   3) 핸드오프 코멘트 게시
#   4) (라벨 변경에 의해 GitHub Projects 컬럼 자동 이동)
#
# 예시:
#   ./scripts/handoff.sh 5 reviewer       # 티켓 #5 → Reviewer
#   ./scripts/handoff.sh 12 dev           # 티켓 #12 → Dev (회귀)
#   ./scripts/handoff.sh 7 brand-designer # 티켓 #7 → Brand Designer

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "사용: $0 <issue-number> <next-agent>"
  echo "next-agent: solution-planner | pm-agent | dev | reviewer | qa | ui-ux-designer | brand-designer | security"
  exit 1
fi

ISSUE=$1
NEXT=$2

# 유효한 에이전트 타입 검증
VALID_TYPES=("solution-planner" "pm-agent" "dev" "reviewer" "qa" "ui-ux-designer" "brand-designer" "security")
if [[ ! " ${VALID_TYPES[*]} " =~ " ${NEXT} " ]]; then
  echo "✗ 유효하지 않은 next-agent: $NEXT"
  echo "  허용: ${VALID_TYPES[*]}"
  exit 1
fi

# 이슈 존재 확인
if ! gh issue view "$ISSUE" >/dev/null 2>&1; then
  echo "✗ 이슈 #$ISSUE 존재하지 않음"
  exit 1
fi

# 모든 agent:* 라벨 제거 (있는 것만)
ALL_AGENT_LABELS="agent:solution-planner,agent:pm-agent,agent:dev,agent:reviewer,agent:qa,agent:ui-ux-designer,agent:brand-designer,agent:security"
gh issue edit "$ISSUE" --remove-label "$ALL_AGENT_LABELS" 2>/dev/null || true

# 새 agent 라벨 추가
gh issue edit "$ISSUE" --add-label "agent:$NEXT" >/dev/null

# 핸드오프 코멘트
TIMESTAMP=$(date +"%Y-%m-%d %H:%M %Z")
COMMENT_BODY="🔄 **Handoff** → \`agent:$NEXT\`

⏱ ${TIMESTAMP}

다음 단계: \`./scripts/new-agent.sh $NEXT $ISSUE\` 으로 새 워크트리 시작"

gh issue comment "$ISSUE" --body "$COMMENT_BODY" >/dev/null

# 결과 요약
echo "✅ Issue #$ISSUE → agent:$NEXT"
echo "  핸드오프 코멘트 게시됨"
echo ""
echo "다음 단계 (사용자):"
echo "  ./scripts/new-agent.sh $NEXT $ISSUE"
