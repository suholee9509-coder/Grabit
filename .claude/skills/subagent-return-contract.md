# Skill: subagent-return-contract

worker(frontend/backend/qa/security)가 PM에 반환하는 구조화 블록 + PM의 트리아지 규칙. (옛 수동 핸드오프 대체)

## 반환 블록 (worker → PM)
```
STATUS: done | escalation | qa-fail | pass | fail | audited | awaiting_design_choice
UNIT/SPRINT: <slug 또는 N>
BRANCH/PR: feat/<slug> / #<PR>
CRITERIA: [x] behavior  [x] negative  [x] non-regression  [x] state  [x] quality
FINDINGS: <흡수후보 | 신규단위후보 — PM 트리아지용>
WORKTREE: <path>
# 조건부
requires-user-review: true|false        # frontend 디자인 산출
PROPOSED_TICKETS: [...]                  # security Critical/High
FAIL_GUIDANCE: <무엇을 어떻게>            # qa fail
ADR: <state/decisions.md 추가분>          # backend 큰 결정
```
> 반환은 *짧은 구조화*만. verbose 로그·전체 diff ❌ (PM 컨텍스트 보호). 상세는 worktree의 `status.md`/PR에.

## PM 트리아지 (흡수 vs 신규단위)
| FINDINGS 성격 | 판정 |
|---|---|
| 현 단위 spec 범위 내 | 현 단위 흡수 (같은 소유자 continuation) |
| 인접하나 작음 | 흡수 우선 |
| 명백히 새 기능/스코프 | 다음 스프린트 새 단위 (PM이 계획 시 생성) |
| 보안 Critical/High | 신규 티켓 (Security 제안 → PM 생성) |

## 에스컬레이션 처리
`STATUS: escalation` → PM이 컨텍스트로 해소 또는 사용자 게이트 → 답을 주입해 *같은 worktree* continuation 재스폰.

## 절대 규칙
- worker는 GitHub 이슈를 만들지 않는다. PM이, 계획 시점에만.
- 작업 중 단위 분할 ❌. 미스사이징은 계획 단계로 표면화.
