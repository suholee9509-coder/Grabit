#!/usr/bin/env bash
# 사용: ./scripts/setup-labels.sh
# 효과: Grabit 시스템에 필요한 GitHub 라벨 일괄 생성 (1회만 실행)

set -euo pipefail

if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh CLI 인증 필요: gh auth login"
  exit 1
fi

echo "▸ Grabit 라벨 셋업 시작..."
echo ""

# Helper: 라벨 생성 또는 업데이트 (이미 있으면 무시)
create_label() {
  local NAME=$1
  local COLOR=$2
  local DESC=$3
  if gh label create "$NAME" --color "$COLOR" --description "$DESC" 2>/dev/null; then
    echo "  ✓ created: $NAME"
  else
    # 이미 있으면 업데이트
    gh label edit "$NAME" --color "$COLOR" --description "$DESC" >/dev/null 2>&1 && echo "  ↻ updated: $NAME" || echo "  ⚠ failed: $NAME"
  fi
}

echo "▶ Agent labels (8개)"
create_label "agent:solution-planner" "8B5CF6" "Solution Planner가 작업 중 (스펙 도출)"
create_label "agent:pm-agent"         "06B6D4" "PM Agent가 작업 중 (티켓 분해/스프린트 운영)"
create_label "agent:dev"              "3B82F6" "Dev Agent에 어사인 (구현)"
create_label "agent:reviewer"         "F97316" "Reviewer 차례 (PR 리뷰)"
create_label "agent:qa"               "EAB308" "QA 차례 (기능 테스트 + 교차검증)"
create_label "agent:ui-ux-designer"   "EC4899" "UI/UX Designer 차례 (제품 UI 설계)"
create_label "agent:brand-designer"   "F472B6" "Brand Designer 차례 (브랜드/카피)"
create_label "agent:security"         "DC2626" "Security Agent (스프린트 종료 보안 감사)"

echo ""
echo "▶ Type labels (6개)"
create_label "type:feature"   "0E8A16" "신규 기능"
create_label "type:bug"       "B60205" "버그 수정"
create_label "type:security"  "991B1B" "보안 이슈 / 핫픽스"
create_label "type:ui"        "D63384" "UI/UX 작업"
create_label "type:planning"  "5319E7" "기획/스펙 (Solution Planner / PM 산출물)"
create_label "type:docs"      "0075CA" "문서 / 표준 변경"

echo ""
echo "▶ Priority labels (4개)"
create_label "priority:P0" "B60205" "즉시 처리 (보안 핫픽스, 데이터 손실 등)"
create_label "priority:P1" "EE0701" "이번 스프린트 안에 처리"
create_label "priority:P2" "FBCA04" "다음 스프린트 후보 (백로그)"
create_label "priority:P3" "C5C5C5" "백로그, 시간 남으면 처리"

echo ""
echo "▶ Status labels (보조)"
create_label "ready-to-merge" "2EA043" "QA 통과 — 사용자가 머지 가능"
create_label "blocked"        "FBCA04" "외부 의존성 대기 (Depends-on 미충족 등)"
create_label "stale"          "808080" "30분+ 업데이트 없음 (자동 모니터링)"

echo ""
echo "✅ 라벨 셋업 완료. 총 21개 라벨."
echo ""
echo "다음 단계:"
echo "  1. GitHub Projects 보드 생성 (수동):"
echo "     gh project create --title \"Grabit\" --owner @me"
echo "  2. 컬럼 추가: Backlog, Spec, Design, In Dev, In Review, In QA, Done"
echo "  3. (선택) Projects 워크플로우에서 라벨 → 컬럼 자동 이동 설정"
echo ""
echo "보드 URL 확인: gh project list --owner @me"
