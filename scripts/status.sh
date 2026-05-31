#!/usr/bin/env bash
# 사용: ./scripts/status.sh
# 효과: 현재 모든 활성 티켓 + 워크트리 상태를 텍스트로 출력

set -euo pipefail

# gh CLI 인증 확인
if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh CLI 인증 필요: gh auth login"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
echo "  Grabit Board Status"
echo "  $(date +"%Y-%m-%d %H:%M %Z")"
echo "════════════════════════════════════════════════════════════"
echo ""

# === 1. Active Tickets by Agent ===
echo "📋 Active Tickets by Agent"
echo "────────────────────────────────────────────────────────────"

TOTAL_OPEN=0
for AGENT in solution-planner pm-agent dev reviewer qa ui-ux-designer brand-designer security; do
  COUNT=$(gh issue list --label "agent:$AGENT" --state open --json number --jq 'length' 2>/dev/null || echo "0")

  if [ "$COUNT" -gt 0 ]; then
    echo ""
    echo "▶ agent:$AGENT  ($COUNT)"
    gh issue list \
      --label "agent:$AGENT" \
      --state open \
      --limit 10 \
      --json number,title,labels,updatedAt \
      --jq '.[] | "  #\(.number) \(.title) [\((.labels | map(select(.name | startswith("priority:"))) | .[0].name) // "no-priority")] (updated \(.updatedAt | fromdate | now - . | (. / 60 | floor) | tostring) min ago)"' 2>/dev/null || echo "  (load failed)"
    TOTAL_OPEN=$((TOTAL_OPEN + COUNT))
  fi
done

if [ "$TOTAL_OPEN" -eq 0 ]; then
  echo ""
  echo "  (active tickets 없음 — 새 작업이 필요하면 Solution Planner 호출)"
fi

echo ""
echo ""

# === 2. Active Worktrees ===
echo "🌲 Active Worktrees"
echo "────────────────────────────────────────────────────────────"
echo ""

# 루트 + worktrees/ 안의 워크트리만 표시
git worktree list 2>/dev/null | grep -v "(bare)" | while IFS= read -r LINE; do
  if echo "$LINE" | grep -q "worktrees/"; then
    echo "  $LINE"
  fi
done

WORKTREE_COUNT=$(git worktree list 2>/dev/null | grep -c "worktrees/" || echo "0")
if [ "$WORKTREE_COUNT" -eq 0 ]; then
  echo "  (활성 워크트리 없음)"
fi

echo ""
echo ""

# === 3. Current Sprint Progress ===
echo "🏃 Current Sprint"
echo "────────────────────────────────────────────────────────────"

# 가장 최근 open milestone
CURRENT_SPRINT=$(gh api repos/:owner/:repo/milestones --jq '.[] | select(.state=="open") | .title' 2>/dev/null | head -1 || echo "")

if [ -n "$CURRENT_SPRINT" ]; then
  echo ""
  echo "▶ $CURRENT_SPRINT"
  OPEN_IN_SPRINT=$(gh issue list --milestone "$CURRENT_SPRINT" --state open --json number --jq 'length' 2>/dev/null || echo "0")
  CLOSED_IN_SPRINT=$(gh issue list --milestone "$CURRENT_SPRINT" --state closed --json number --jq 'length' 2>/dev/null || echo "0")
  TOTAL_IN_SPRINT=$((OPEN_IN_SPRINT + CLOSED_IN_SPRINT))
  if [ "$TOTAL_IN_SPRINT" -gt 0 ]; then
    PCT=$((CLOSED_IN_SPRINT * 100 / TOTAL_IN_SPRINT))
    echo "  Progress: ${CLOSED_IN_SPRINT}/${TOTAL_IN_SPRINT} closed (${PCT}%)"
    echo "  Open: ${OPEN_IN_SPRINT}"
  else
    echo "  (티켓 0개 — sprint-kickoff 미실행?)"
  fi
else
  echo ""
  echo "  (활성 sprint 없음 — /start-sprint 으로 시작 가능)"
fi

echo ""
echo ""

# === 4. Quick Actions ===
echo "💡 Quick Actions"
echo "────────────────────────────────────────────────────────────"
echo ""
echo "  새 에이전트 시작:    ./scripts/new-agent.sh <type> [<ticket>]"
echo "  핸드오프:            ./scripts/handoff.sh <issue> <next-agent>"
echo "  보드 (브라우저):     gh project view 1 --owner @me --web"
echo ""
