#!/usr/bin/env bash
# 사용: ./scripts/setup-labels.sh
# 효과: Grabit 5-에이전트 시스템 GitHub 라벨 일괄 생성 (1회)
set -euo pipefail

if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh CLI 인증 필요: gh auth login"; exit 1
fi

create_label() {
  local NAME=$1 COLOR=$2 DESC=$3
  if gh label create "$NAME" --color "$COLOR" --description "$DESC" 2>/dev/null; then
    echo "  ✓ created: $NAME"
  else
    gh label edit "$NAME" --color "$COLOR" --description "$DESC" >/dev/null 2>&1 && echo "  ↻ updated: $NAME" || echo "  ⚠ failed: $NAME"
  fi
}

echo "▶ Agent labels (5)"
create_label "agent:pm"        "06B6D4" "PM 계획/오케스트레이션 (Planning)"
create_label "agent:frontend"  "EC4899" "Frontend — 디자인 + FE (In Build)"
create_label "agent:backend"   "3B82F6" "Backend — 알고리즘·AI·BE (In Build)"
create_label "agent:qa"        "EAB308" "QA — 기능완료 e2e (In QA)"
create_label "agent:security"  "DC2626" "Security — 스프린트말 감사 (In Security)"

echo "▶ Type labels (3)"
create_label "type:feature"   "0E8A16" "Feature 작업단위"
create_label "type:security"  "991B1B" "보안 이슈 (Security 발견)"
create_label "type:chore"     "5319E7" "인프라/문서/잡무"

echo "▶ Priority labels (4)"
create_label "priority:P0" "B60205" "즉시 (보안 핫픽스 등)"
create_label "priority:P1" "EE0701" "이번 스프린트"
create_label "priority:P2" "FBCA04" "다음 스프린트 후보"
create_label "priority:P3" "C5C5C5" "백로그"

echo "▶ Status (보조)"
create_label "blocked" "FBCA04" "의존성 대기"

echo ""
echo "✅ 라벨 셋업 완료 (13개)."
echo "다음: .github/SETUP.md — Project 보드(#2) Status 컬럼 정렬 + PROJECT_PAT 시크릿."
