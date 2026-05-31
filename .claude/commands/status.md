---
description: 현재 보드 상태 (활성 티켓 + 워크트리)를 표시합니다
---

# /status

사용자가 `/status`를 입력했습니다.

## 절차

### 1. status 스크립트 실행

```bash
./scripts/status.sh
```

이 스크립트가 출력:
- agent별 활성 (open) 티켓 수 + 목록
- 현재 살아있는 git worktrees

### 2. (선택) 추가 정보

사용자가 더 자세한 정보 요청하면:

```bash
# 특정 milestone (현재 스프린트)의 진행률
gh issue list --milestone "Sprint N" --json state | jq '[.[] | .state] | group_by(.) | map({state: .[0], count: length})'

# 핸드오프 대기 중인 티켓 (라벨 있고 워크트리 없는 것)
# (수동 분석 필요 — gh issue list + git worktree list 비교)

# GitHub Projects 보드 (브라우저 오픈)
gh project view 2 --owner @me --web
```

### 3. 사용자에 인사이트 제공

`status.sh` 출력만 그대로 보여주지 말고, *해석*을 함께:
- "Reviewer 큐에 3개 쌓임. 병목일 수 있음"
- "Brand Designer 카피 대기 5개. 일괄 처리 권장"
- "Dev 워크트리 2개 살아있음. 작업 중인 티켓: #3, #5"

## Failure Modes

- **`status.sh` 실행 실패**: gh CLI 인증 확인 (`gh auth status`)
- **이슈가 너무 많아 출력 압도적**: 가장 중요한 것만 요약 (P0, 가장 오래된 것)
