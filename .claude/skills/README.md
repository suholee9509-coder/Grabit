# .claude/skills/ — 프로젝트 고유 워크플로우

gstack 스킬이 아니라 Grabit 오케스트레이션 워크플로우 참조. (gstack 스킬은 `~/.claude/skills/gstack/`)

| 스킬 | 용도 | 주체 |
|---|---|---|
| [sprint-kickoff.md](sprint-kickoff.md) | 스펙 → Feature 작업단위 분해 + 보드 등록 (사이징 게이트·WIP) | PM |
| [sprint-close.md](sprint-close.md) | 통합 → 보안 감사 → 머지 → 회고 | PM |
| [prd-clarifier.md](prd-clarifier.md) | 검증 스펙에 UX Spec 추가 (상태 사전 열거) | PM |
| [subagent-return-contract.md](subagent-return-contract.md) | worker 반환 블록 + 흡수/신규단위 트리아지 | 전 worker + PM |
| [worker-bootstrap.md](worker-bootstrap.md) | 스폰된 worker 시동 의식 | dev/qa/security |

> 정본 규칙은 `config/work-unit-contract.md`. 이 스킬들은 그 규칙을 *실행*하는 절차.
