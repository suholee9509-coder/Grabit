# scripts/

| 스크립트 | 용도 |
|---|---|
| `setup-labels.sh` | 5-에이전트 GitHub 라벨 일괄 생성 (1회) |
| `status.sh` | 읽기전용 대시보드 (이슈/worktree/dev status.md). 1차 시각화는 GitHub Project 보드 |

> worktree 생성·핸드오프는 더 이상 스크립트가 하지 않는다.
> PM이 dev를 `claude -p "/goal"`로 스폰하고, worktree는 플랫폼(`EnterWorktree`/`git worktree`)이, 라벨은 PM이 `gh`로 직접 관리한다.
