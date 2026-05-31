# Workflows

Grabit의 스프린트/티켓 라이프사이클 표준. **PM Agent**, **Solution Planner**의 핵심 참조.

---

## §1. 스프린트

### §1.1 정의
- 1 스프린트 = 1-2주 (디폴트 2주)
- 1 스프린트 = 1 spec 또는 그 일부
- 1 스프린트 = 1 GitHub Milestone

### §1.2 라이프사이클

```
[Solution Planner spec 컨펌]
        ↓
[PM Agent: sprint-kickoff]
        ↓
[티켓 생성 + 사용자 시작]
        ↓
(2주 진행: Dev → Reviewer → QA → Merge 반복)
        ↓
[모든 티켓 머지]
        ↓
[Security Agent 호출]
        ↓
[PM Agent: sprint-close (회고 + 보안 통합)]
        ↓
[다음 스프린트 또는 새 목표]
```

### §1.3 첫 스프린트 (Sprint 0 또는 1)
- Brand Designer Foundation 포함 권장 (UI 작업 시작 전 필요)
- 기본 인프라 (인증, DB, 라우팅) 포함 가능

### §1.4 종료 조건
- Milestone의 모든 이슈 closed
- 모든 PR merged (또는 의도적으로 다음 스프린트로 이동된 것은 milestone 변경)
- Security 감사 완료

---

## §2. 티켓 라이프사이클

### §2.1 상태 (라벨로 표현)

```
agent:pm-agent → agent:dev → agent:reviewer → agent:qa → ready-to-merge → (closed)
                  ↑              ↓
                  └──── (REQUEST_CHANGES 시 회귀)
```

UI 티켓:
```
agent:pm-agent → agent:ui-ux-designer → agent:brand-designer → agent:dev → ... 
                                              ↘ (또는) agent:dev (카피 필요 시 후속 호출)
```

### §2.2 라벨 매트릭스

각 티켓은 다음 3종류 라벨 정확히 1개씩:
- **agent**: `agent:dev`, `agent:reviewer`, `agent:qa`, `agent:ui-ux-designer`, `agent:brand-designer`, `agent:security`, `agent:pm-agent`, `agent:solution-planner`
- **type**: `type:feature`, `type:bug`, `type:security`, `type:ui`, `type:planning`, `type:docs`
- **priority**: `priority:P0`, `priority:P1`, `priority:P2`, `priority:P3`

추가 가능:
- `ready-to-merge` — QA 통과 후
- `blocked` — 외부 의존성 대기

### §2.3 우선순위 정의

| Priority | 의미 |
|----------|------|
| **P0** | 즉시 처리. 다른 작업 중단해도 됨 (보안 핫픽스, 데이터 손실 등) |
| **P1** | 이번 스프린트 안에 처리 |
| **P2** | 다음 스프린트 후보 |
| **P3** | 백로그. 시간 남으면 처리 |

### §2.4 티켓 크기

- 권장: ≤ 300 LOC (PR 기준)
- 큰 티켓 발견 시 PM이 분해
- 너무 작은 티켓 (< 30 LOC) → 합칠 수 있는지 검토

---

## §3. PR 라이프사이클

### §3.1 단계

```
[Dev 작성]
   ↓ /ship
[PR open + agent:reviewer 라벨]
   ↓ Reviewer
[APPROVE / REQUEST_CHANGES / BLOCK]
   ↓ APPROVE
[agent:qa 라벨]
   ↓ QA (/qa + /codex)
[PASS / FAIL]
   ↓ PASS
[ready-to-merge 라벨]
   ↓ 사용자 머지
[closed + 자동으로 ticket close]
```

### §3.2 PR 본문 양식
Dev Agent 페르소나의 "출력 양식" 따름:
- What / Why / AC 매핑 / How / Testing / Out of Scope / Brand 미해결

### §3.3 머지 정책
- **사용자만 머지** (자동 머지 X)
- **squash merge** 권장 (커밋 히스토리 깔끔하게)
- 머지 메시지: PR title 사용

---

## §4. 핸드오프 흐름

자세한 규칙: [handoff_rules.md](handoff_rules.md)

핵심:
- 1 티켓은 항상 *정확히 1개* `agent:*` 라벨
- 핸드오프 = 라벨 변경 + 코멘트 (= `./scripts/handoff.sh` 한 번)
- 회귀 (Reviewer/QA → Dev)는 정상 — *blocked* 라벨 X

---

## §5. 의존성

### §5.1 표현
티켓 본문에 `Depends on: #N` 명시. 여러 개면 나열.

### §5.2 처리
- Depends-on이 머지되지 않으면 작업 시작 X
- 사용자가 의존성 위반해서 시작하려 하면 → 에이전트가 정지 + 사용자 알림
- 사이클 (A→B→A) 금지 — PM 분해 시 검증

---

## §6. 시급한 변경 (핫픽스)

### §6.1 트리거
- Critical 보안 이슈
- 프로덕션 다운
- 데이터 손실 위험

### §6.2 절차
- 정상 스프린트 흐름 X
- Solution Planner 우회, PM이 직접 P0 티켓 생성
- Dev → Reviewer (긴급 모드) → QA → 즉시 머지
- 다음 스프린트 회고에서 분석

---

## §7. 새 목표 / 재기획

### §7.1 트리거
- 사용자가 새 기능/방향 요구
- 시장/검증 결과 큰 피벗 필요

### §7.2 절차
1. 진행 중 스프린트 끝까지 (또는 명시적 abort)
2. Solution Planner 호출 (`./scripts/new-agent.sh solution-planner`)
3. 새 spec 작성
4. PM이 스프린트 계획

---

## §8. 표준 변경 (config/ 자체)

이 문서나 다른 `config/*.md` 변경 시:
1. PM이 별도 티켓 생성 (`type:docs` 또는 `type:planning`)
2. PR로 변경
3. 머지되면 다음 스프린트부터 적용

에이전트가 작업 중 표준 위반 발견 시:
- 그 PR scope 내 처리 X
- 별도 이슈 생성 후 PM 결정
