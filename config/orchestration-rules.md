# Orchestration & Escalation Rules

> 수동 라벨 핸드오프 매트릭스를 대체. PM이 유일 오케스트레이터이므로 핸드오프가 아니라 *스폰·반환·트리아지*다.

## §1 PM = 유일 디스패처
- PM만 dev/QA/Security를 스폰한다. 에이전트 간 직접 핸드오프 없음.
- dev = headless `claude -p "/goal"` (worktree). QA/Security = Agent 툴 (worktree=통합브랜치).
- 사용자는 PM 한 세션과만 대화한다.

## §2 반환 계약 (worker → PM)
모든 worker는 종료 시 구조화 블록을 반환(페르소나별 상세):
```
STATUS: done | escalation | qa-fail | pass | fail | audited | awaiting_design_choice
UNIT/SPRINT · BRANCH/PR · CRITERIA([x]/[ ]) · FINDINGS(흡수후보|신규단위후보)
WORKTREE · (디자인) requires-user-review · (보안) PROPOSED_TICKETS
```
반환은 *짧은 구조화*만 (verb 로그 ❌) — PM 컨텍스트 보호.

## §3 에스컬레이션 → continuation
1. dev가 결정 필요 시 `status.md`에 `STATUS: escalation` + 질문·시도·정지지점 기록 후 정지.
2. PM이 컨텍스트로 해소 → 또는 **사용자 게이트**.
3. PM이 답을 주입해 *같은 worktree*로 continuation 재스폰 (코드·plan·status 디스크 보존).

## §4 흡수 vs 신규단위 결정표 (PM)
| 발견 성격 | 판정 |
|---|---|
| 현 단위 spec 범위 내(엣지·배선·hardening·QA수정) | **현 단위 흡수** (같은 소유자) |
| 현 단위 밖, 같은 기능 인접 | 흡수 가능하면 흡수, 아니면 신규단위 후보 |
| 명백히 새 기능/스코프 | **다음 스프린트 새 단위** (PM이 계획 시 생성) |
| 보안 Critical/High (스프린트말) | 신규 티켓 (Security 제안 → PM 생성) |
> 어느 경우도 *작업 중 새 티켓 생성 ❌* (PM이 계획 시점에만).

## §5 사용자 게이트 (모드 1 / Sprint 1 = 모드 2)
| 게이트 | 시점 |
|---|---|
| ⓐ 스코프 | Sprint 0 + 스펙 검증 후 |
| ⓑ 스프린트 계획 | 분해 후, 스폰 전 (= 안티-증식 게이트) |
| ⓒ 디자인 충실도 | FE 화면 구현 시마다 (Figma 프레임 대비 픽셀-퍼펙트 사인오프 → 사람 게이트) |
| ⓓ 최종 머지 | 스프린트말 보안 후 |
| (Sprint 1) 기능 배정 | 각 dev 스폰 전 (트레이닝휠) |
- 모드 2 졸업: Sprint 1이 *계획외 하위단위 0 · 단위당 에스컬레이션 ≤1*로 출시.

## §6 첫 루프 캘리브레이션
- 모든 신규 단위 dev `/goal` 첫 ~5턴은 관찰 (status.md). Sprint 1·고위험 단위는 사용자가, 그 외엔 PM이.
- 고위험(인증·결제·마이그레이션): Boundaries 강화 + 완전 unattended 금지 + 조건부 `/codex`.

## §7 완료 검증 (false-done 차단)
- **예방**: dev는 기준 미충족 시 `done` 금지 → `escalation`. 검증은 *주장*이 아니라 실제 명령 출력으로만.
- **탐지**: dev `done` → **QA verify-first**(spec의 Validation 명령을 clean checkout에서 재실행, exit code 판정, fail-fast) → 통과해야 스토리 e2e. **PM은 accept/reject *결정*만, *실행*은 QA에 위임**(verbose 로그의 PM 컨텍스트 오염·독립성 약화 방지).
- **CI**(Sprint 0+): dev `/ship` PR에서 같은 Validation을 GitHub Actions가 외부 반복(비-LLM·un-gameable).
- 최상위 완료 기준 = **L1 User Story**(사용자가 X를 프로덕션 수준에서 실제로 할 수 있나) — 가장 못 속이는 기준.

## §8 실행 모드 — 역할 기준 (UI=인터랙티브, 그 외=백그라운드)
실행 모드는 *역할로 고정*된다 (단위별 선택 ❌):

- **UI / frontend = 인터랙티브 워크트리 (사용자가 직접 운전)** — *항상*. UI 연동·퍼블리싱은 취향·미세조정 협의가 잦아 백그라운드로 돌리지 않는다. **사용자**가 worktree를 열어 직접 운전하는 인터랙티브 Claude Code 세션에서 frontend 페르소나로 작업.
  - 셋업: 플랫폼 워크트리(EnterWorktree) 또는 `git worktree add ../grabit-<slug> <branch>` 후 그 폴더에서 `claude` 실행 → frontend.md 페르소나.
  - 도구: **Figma MCP**(프레임 연동·추출) + `/design-review`(충실도). 생성 스킬(shotgun/consultation/html) 미사용 — 디자인 고정 SoT. 결정·디자인 공백은 *사용자에게 직접 질문*.
  - PM은 headless 스폰 ❌ → worktree·spec을 준비하고 사용자에게 "이 단위 운전하세요"로 핸드오프. 통합은 여전히 PM 소유(게이트 ⓒ 충실도/ⓓ 머지).

- **backend = 헤드리스 `/goal` (백그라운드)** · **qa / security = Agent 툴 (백그라운드)** — PM이 스폰·통합(§1).
  - **★ 백그라운드 에이전트 모델 = `claude-opus-4-8` + `--effort max`** (Ultra Code 제외 최상위). 헤드리스 `claude -p` 스폰엔 `--model claude-opus-4-8 --effort max`, Agent 툴 스폰엔 model=opus(4.8)·effort max를 지정.

- **PM은 통합 소유 유지**: 모든 산출 = 브랜치 + 산출물. 게이트 ⓒ(충실도)/ⓓ(머지)로 머지 래더(§5)에 합류. 디자인 토큰은 Figma 추출 → `src/app/styles` + Command Center §5.
