# .claude/commands/

Cursor에서 `/<명령>` 형태로 호출되는 슬래시 명령들.

각 파일은 그 명령이 무엇을 하는지 + 어떻게 동작하는지를 설명합니다. 대부분 `scripts/*.sh`의 wrapper입니다.

---

## 명령 인덱스

| 명령 | 동작 | 사용 시점 |
|------|------|----------|
| [`/start-sprint`](start-sprint.md) | `sprint-kickoff` 스킬 실행 | PM Agent가 새 스프린트 시작할 때 |
| [`/handoff`](handoff.md) `<agent>` | 현재 티켓을 다음 에이전트에 어사인 | 모든 에이전트, 작업 완료 시 |
| [`/status`](status.md) | 현재 보드 상태 텍스트 출력 | 사용자가 전체 현황 확인할 때 |
| [`/load-context`](load-context.md) | frontmatter `reads:`의 모든 파일 읽기 | 새 워크트리에서 작업 시작할 때 |

---

## 슬래시 명령 동작 원리

Cursor는 `.claude/commands/<name>.md` 파일이 있으면 채팅 패널에서 `/<name>`을 자동 인식합니다. 사용자가 입력하면 그 마크다운의 내용이 LLM에 컨텍스트로 주입되고, LLM이 거기 정의된 액션을 수행합니다.

따라서 명령 파일에는 *LLM에게 줄 정확한 지시*를 작성해야 합니다.

예시 (`handoff.md`의 핵심):
```markdown
사용자가 `/handoff <agent>`를 입력했습니다.

다음 단계를 수행하세요:
1. 현재 워크트리의 티켓 번호 확인 (`pwd`로 확인 또는 CLAUDE.md 참조)
2. Self-Review Checklist 통과 여부 확인 (`.claude/agents/<현재타입>.md` 참조)
3. `./scripts/handoff.sh <issue> <agent>` 실행
4. 결과를 사용자에게 보고
```

명령 파일은 *짧고 결정적*이어야 합니다. 긴 추론은 페르소나(`.claude/agents/`)에 두세요.
