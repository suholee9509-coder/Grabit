# 에이전트 로스터 (5)

Grabit 팀은 **PM 중심 오케스트레이션**입니다. PM이 메인루프(당신이 대화하는 세션)이고, dev/QA/Security를 스폰·통합·결정합니다. 선형 체인(dev→reviewer→qa)을 **셀프리뷰로 흡수**해 5개로 줄였습니다.

| 에이전트 | 역할 | 실행 방식 | gstack | 흡수한 역할 |
|---|---|---|---|---|
| **pm** | 팀리드·오케스트레이터·서비스범위 결정 | 메인루프 (사용자 세션) | office-hours, plan-ceo/eng-review, autoplan, spec, retro | solution-planner + pm + (오케스트레이터) |
| **frontend** | 고정 Figma 디자인 픽셀-퍼펙트 퍼블리싱 + FE | **인터랙티브 워크트리 (사용자 직접 운전)** | **Figma MCP**, design-review(충실도), review, ship, qa | ui-ux-designer + brand-designer + dev(FE) |
| **backend** | 알고리즘·AI·백엔드 | headless `/goal` 백그라운드 (worktree) · **opus-4-8·effort max** | investigate, review, codex, ship, health | dev(BE) |
| **qa** | 기능완료마다 슬라이스 e2e | Agent 툴 백그라운드 · **opus-4-8·effort max** | qa, qa-only, codex, design-review | qa (범위 = PR→기능단위) |
| **security** | 스프린트말 전수 보안감사 | Agent 툴 백그라운드 · **opus-4-8·effort max** | cso | security |

## 오케스트레이션 (선형 체인 ❌ → PM 중심 star)

```
                    ┌──────────────┐
        ┌──────────►│      PM       │◄───────── 사용자 (게이트 ⓐⓑⓒⓓ)
        │           │  (메인루프)    │
        │  반환      │  SoT: state/  │
        │           │  command-     │
        │           │  center.md    │
        │           └──┬───┬───┬────┘
        │   spawn      │   │   │   spawn (Agent 툴)
        │  (claude -p) │   │   │
   ┌────┴────┐  ┌──────┴┐  │  ┌┴─────────┐ ┌──────────┐
   │ frontend│  │backend│  │  │   qa     │ │ security │
   │ /goal   │  │ /goal │  │  │(기능완료) │ │(스프린트말)│
   └─────────┘  └───────┘  │  └──────────┘ └──────────┘
        │  PR(/ship)        │
        └──► feat/<unit> ───┴─► sprint/<n>-integration ──(ⓓ)─► main
```

## 핵심 규칙
- **티켓 생성은 PM만**, 계획 시점에만. dev/QA/Security는 발견을 *반환에 보고* (→ PM 트리아지). 보안 Critical/High만 신규 티켓 제안.
- **dev = headless `/goal`** (성공조건 충족까지 자율 루프). spec.md 매 턴 reload, status.md 매 턴 갱신.
- **작업단위 = 수직 Feature 슬라이스**(화면/플로우), 한 소유자가 end-to-end. 작업 중 분할/파편 티켓 ❌. → `config/work-unit-contract.md`
- **디자인 = 고정 Figma SoT(역설계)**: frontend는 디자인 생성 ❌ → Figma MCP로 픽셀-퍼펙트 퍼블리싱. PM이 Figma('무엇')+기획문서('왜·스코프')에서 스펙 역설계. 게이트 ⓒ = 충실도 사인오프. → `.claude/skills/figma-reverse-engineering.md`
- **3-레벨**: User Story(L1·프로덕션 인수기준) → 작업단위(1 story≈1 unit) → /goal 5섹션 기준. QA가 *스토리*를 검증.
- **false-done 차단**: dev는 미충족 시 escalation(done ❌); QA **verify-first**(Validation 명령 재실행, fail-fast) + Sprint 0+ CI.
- **사용자 게이트**: ⓐ스코프 ⓑ스프린트계획(분해 승인) ⓒ디자인 ⓓ최종머지.

각 페르소나는 이 폴더의 `<name>.md` (Single Source of Truth).
