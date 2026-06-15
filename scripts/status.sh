#!/usr/bin/env bash
# 사용: ./scripts/status.sh
# 효과: 현재 스프린트 보드/이슈 + worktree 현황 (읽기전용 대시보드)
# 주: 1차 시각화는 GitHub Project 보드. 이건 터미널 빠른 확인용.
set -euo pipefail

echo "═══ Grabit 현황 ═══"
echo ""
echo "▶ 열린 작업단위 (agent별)"
for a in pm frontend backend qa security; do
  CNT=$(gh issue list --label "agent:$a" --state open --json number --jq 'length' 2>/dev/null || echo "?")
  printf "  %-10s %s\n" "$a" "$CNT"
done

echo ""
echo "▶ 열린 이슈 목록"
gh issue list --state open --json number,title,labels \
  --jq '.[] | "  #\(.number) [\(([.labels[].name] | map(select(startswith("agent:"))) | join(","))|gsub("agent:";""))] \(.title)"' 2>/dev/null || echo "  (조회 실패 — gh 인증 확인)"

echo ""
echo "▶ worktrees"
git worktree list 2>/dev/null | sed 's/^/  /' || echo "  (git worktree 없음)"

echo ""
echo "▶ dev /goal status.md (진행 중 단위)"
for f in docs/units/*/status.md; do
  [ -f "$f" ] || continue
  echo "  $(dirname "$f" | xargs basename): $(head -1 "$f" 2>/dev/null)"
done

echo ""
echo "보드: gh project view 2 --owner suholee9509-coder --web"
