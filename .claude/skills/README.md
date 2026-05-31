# .claude/skills/

Grabit 프로젝트 고유의 **반복 워크플로우**.

gstack 스킬(`/qa`, `/review` 등)과 별개로, **이 프로젝트만의** 작업 흐름을 정의합니다. 각 스킬은 마크다운 한 페이지(50-150줄)이며 명령어를 그대로 복붙 가능한 형태로 작성됩니다.

---

## 스킬 인덱스

| 파일 | 언제 호출 | 누가 호출 |
|------|----------|----------|
| [sprint-kickoff.md](sprint-kickoff.md) | 새 스프린트 시작 시 | PM Agent |
| [handoff-checklist.md](handoff-checklist.md) | 모든 핸드오프 시 | 전 에이전트 |
| [context-bootstrap.md](context-bootstrap.md) | 새 worktree에서 작업 시작 시 | 전 에이전트 (자동) |
| [sprint-close.md](sprint-close.md) | 스프린트 종료 선언 시 | PM Agent |
| [prd-clarifier.md](prd-clarifier.md) | Solution Planner의 `/plan-ceo-review` 직후 (워크플로우 Step 4) | Solution Planner (only) |

**prd-clarifier 보조 설명**: 스코프 확정된 PRD에 구조화된 적대적 질문(Quick 5 ~ Ultralong 35)으로 모호점을 발굴하고 `## UX Spec` 섹션을 추가하는 워크플로우. Solution Planner 전용 — 다른 에이전트가 직접 호출 X. 산출물은 PRD 본문 보강 + 추적 문서(`spec-{slug}-clarification-session.md`).

---

## gstack 스킬과의 차이

| | gstack 스킬 (`/qa`, `/review` 등) | 이 폴더의 스킬 |
|--|----------------------------------|---------------|
| 위치 | `~/.claude/skills/gstack/` (글로벌) | `.claude/skills/` (프로젝트) |
| 범위 | 모든 프로젝트 공통 | Grabit 한정 |
| 호출 | `/명령` (Cursor 슬래시) | 이 README의 파일 직접 참조 |
| 예시 | `/qa` (브라우저 테스트) | `sprint-kickoff` (마일스톤 + 라벨 셋업) |

이 폴더의 스킬은 *프로세스 컨벤션*이고, gstack은 *재사용 가능한 액션*입니다.
