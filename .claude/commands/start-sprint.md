---
description: 새 스프린트를 시작합니다 (PM Agent 워크트리에서 호출)
---

# /start-sprint

사용자가 `/start-sprint`를 입력했습니다.

## 컨텍스트
이 명령은 **PM Agent 워크트리에서만** 의미가 있습니다. 다른 워크트리면 사용자에게 안내:
> "이 명령은 PM Agent 워크트리에서 호출해야 합니다. `./scripts/new-agent.sh pm-agent` 으로 PM 워크트리를 시작하세요."

## 절차 (PM Agent 워크트리인 경우)

`.claude/skills/sprint-kickoff.md` 스킬을 정확히 따르세요:

1. 사전 조건 확인 (spec 존재, 이전 스프린트 종료)
2. 다음 스프린트 번호 결정
3. Milestone 생성
4. (Sprint 2+) 이전 스프린트 인사이트 + 보안 티켓 검토
5. Spec → 티켓 분해
6. 의존성 그래프 정리
7. `shared-context/sprint-memory.md` 업데이트 + 커밋
8. 사용자에 보고

각 단계는 PM Agent 페르소나(`.claude/agents/pm-agent.md`)와 sprint-kickoff 스킬을 참조해 정확히 실행하세요.
