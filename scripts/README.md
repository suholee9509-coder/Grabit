# scripts/

작은 shell 헬퍼 모음. 워크트리 생성, 핸드오프, 보드 상태 확인.

총 코드량 ~100 LOC. 디버깅/유지보수가 쉬운 단순한 bash.

---

## 스크립트

| 스크립트 | 사용법 | 효과 |
|---------|--------|------|
| [new-agent.sh](new-agent.sh) | `./scripts/new-agent.sh <agent-type> [<ticket-number>]` | git worktree 생성 + CLAUDE.md 자동 작성 + Cursor 자동 오픈 |
| [handoff.sh](handoff.sh) | `./scripts/handoff.sh <issue-number> <next-agent>` | GitHub Issue 라벨 변경 + 핸드오프 코멘트 |
| [status.sh](status.sh) | `./scripts/status.sh` | 현재 모든 활성 티켓을 agent별로 그룹화 출력 |

---

## 사전 요구사항

- `gh` CLI 인증됨 (`gh auth login`)
- `git` 2.5+ (worktree 지원)
- `jq` (status.sh에서 JSON 파싱)
- `uuidgen` (new-agent.sh에서 unique ID)
- macOS의 경우 `cursor` CLI 설치됨 (Cursor 앱 → Command Palette → "Install 'cursor' command")

---

## 주의사항

- 모든 스크립트는 레포 루트에서 실행 가정 (`pwd`로 검증)
- `worktrees/` 디렉토리에 생성됨 (.gitignore 처리됨)
- 머지 후 워크트리는 수동으로 정리: `git worktree remove worktrees/<name>`
- 라벨이 GitHub에 미리 만들어져 있어야 함 (Phase 5에서 셋업)

---

## 향후 확장

shell 스크립트가 100 LOC 넘어가면 TS CLI(`attn`)로 마이그레이션 검토. 지금은 bash로 충분.
