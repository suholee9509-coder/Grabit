# .claude/agents/

8개 AI 에이전트의 **페르소나 정의 (Single Source of Truth)**.

각 파일은 그 에이전트의 정체성, DO/DON'T, 워크플로우, 출력 양식, Self-Review Checklist, Examples, Failure Modes, Tone을 명시합니다. `scripts/new-agent.sh`가 새 워크트리를 만들 때 여기 정의를 참조합니다.

---

## 에이전트 인덱스

| 파일 | 역할 한줄 | 트리거 | 다음 핸드오프 |
|------|----------|--------|--------------|
| [solution-planner.md](solution-planner.md) | 비판적 검증 + 스펙 도출 | 사용자가 새 목표 입력 | PM Agent |
| [pm-agent.md](pm-agent.md) | 스펙 → 티켓 분해 | Solution Planner 컨펌 후 | (해당 agent label) |
| [dev.md](dev.md) | 티켓 → 코드 → PR | 사용자가 티켓 시작 | Reviewer |
| [reviewer.md](reviewer.md) | PR 사전 리뷰 | Dev가 PR 생성 후 | QA / Dev |
| [qa.md](qa.md) | 기능 테스트 | Reviewer APPROVE 후 | merge / Dev |
| [ui-ux-designer.md](ui-ux-designer.md) | 제품 UI 설계 | UI 라벨 티켓 | Dev / Brand Designer |
| [brand-designer.md](brand-designer.md) | 브랜드 (비주얼+보이스+카피) | on-demand + `[copy:N]` 발생 시 | UI/UX Designer / Dev |
| [security.md](security.md) | 스프린트 단위 보안 감사 | 스프린트 종료 시 1회 | PM (다음 스프린트) |

---

## 핸드오프 다이어그램

```
[목표 입력]
    ↓
Solution Planner ──→ PM Agent
                        ↓
                ┌───────┼─────────────────┐
                ↓       ↓                 ↓
        UI/UX Designer  Dev          Brand Designer
                ↓       ↓             (on-demand)
            (Dev로 →) Reviewer
                        ↓
                       QA
                        ↓
                     [merge]
                        ↓
                  (스프린트 끝)
                        ↓
                    Security
                        ↓
                       PM (다음 스프린트)
```

---

## 페르소나 작성 표준

모든 페르소나는 [/Users/suho/.claude/plans/optimized-hugging-bengio.md](../../docs/) 의 **프롬프트 품질 원칙 표준 템플릿**을 따릅니다. 핵심:

1. frontmatter (`name`, `role`, `trigger`, `gstack-skills`, `reads`, `writes`, `handoff-targets`)
2. **정체성** + **DO/DON'T**
3. **작업 시작 전 체크리스트**
4. **워크플로우** (Step by Step)
5. **출력 양식** (고정 템플릿)
6. **Self-Review Checklist**
7. **Examples** (좋은 예시 2+ 나쁜 예시 1)
8. **Failure Modes**
9. **Tone**

---

## 검증 통과 일자

| 에이전트 | 1차 작성 | 적대적 검증 (5/5) | 일관성 검증 |
|---------|---------|------------------|------------|
| solution-planner | 2026-05-05 | 2026-05-06 ✓ (5/5) | 2026-05-05 ✓ |
| pm-agent | 2026-05-05 | 2026-05-06 ✓ (5/5) | 2026-05-05 ✓ |
| dev | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |
| reviewer | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |
| qa | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |
| ui-ux-designer | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |
| brand-designer | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |
| security | 2026-05-05 | TBD (Day 2) | 2026-05-05 ✓ |

production-ready 마크: 모든 컬럼이 채워진 에이전트.

**적대적 검증(Day 2)**은 사용자가 실제 워크트리에서 5가지 테스트 (정체성/경계/도구/출력양식/실패모드)를 시연합니다.

### 검증 노트

**Solution Planner (2026-05-06, 5/5 PASS)**: 첫 시도 시 Test 5가 부분 통과 (Test 4의 Pomodoro 컨텍스트 영향). Fresh 세션에서 단독 실행 시 5번도 완벽 통과 — `/load-context`로 reads 일괄 로드, "0/6 통과 — 진행 불가" 명시 거절, Question #1만 던짐. 페르소나 결함 없음 확인. **시사점: 페르소나 적대적 검증은 이전 컨텍스트 없는 fresh 세션에서 진행 권장.**

**PM Agent (2026-05-06, 5/5 Strong PASS)**: Test 4 (양식 테스트)의 결과가 페르소나 Examples보다 더 정교하게 도출됨 — 9개 티켓 분해 + 의존성 ASCII 다이어그램 + Critical path 직렬 깊이 분석 + Success Criteria → 티켓 매핑 검증 + Out of Scope 침범 자체 검증 + 가정 모드 vs 실제 모드 명시 분리. Test 5에서 "필요한 결정 1개" 정확 형식으로 정지. 페르소나가 *예시를 외우는 게 아니라 추론으로 적용*함을 증명. 보강 필요 없음.

---

## 일관성 검증 결과 (Day 3 — 2026-05-05)

### 1. handoff-targets 매트릭스 (사이클 검증)

```
solution-planner → pm-agent
pm-agent → dev / ui-ux-designer / brand-designer
ui-ux-designer → dev / brand-designer
brand-designer → ui-ux-designer / dev
dev → reviewer
reviewer → qa / dev (회귀)
qa → merge / dev (회귀)
security → pm-agent
```

**의도적 피드백 루프**: reviewer/qa → dev (변경 요청 시). 무한 루프 방지: BLOCK 판정 시 사용자 개입.
**의도적 협업 루프**: ui-ux-designer ↔ brand-designer (디자인 + 카피 핑퐁). 마찬가지로 사용자가 종료 가능.
**사이클 결론**: ✅ 모두 *의도적*이며 사용자 컨트롤 가능.

### 2. 책임 매트릭스 (중복 없음 확인)

| 책임 | 담당 에이전트 | 다른 에이전트 침범 X |
|------|------------|------------------|
| 스펙 검증 | Solution Planner | ✓ |
| 티켓 분해 | PM Agent | ✓ |
| 코드 작성 | Dev | ✓ |
| 코드 품질 리뷰 | Reviewer | ✓ |
| 동작 테스트 + 교차검증 | QA | ✓ |
| 제품 UI 설계 | UI/UX Designer | ✓ |
| 브랜드 시스템 + 카피 | Brand Designer | ✓ |
| 보안 감사 | Security | ✓ |

### 3. reads/writes 그래프 (사이클/누락 검증)

**산출물별 작성자/독자**:
| 산출물 | 작성자 | 독자 |
|--------|-------|------|
| `spec-{slug}.md` | solution-planner | pm-agent |
| GitHub Issues | pm-agent | dev, reviewer, qa, ui-ux-designer, brand-designer, security |
| `architecture.md` | dev (큰 결정), pm-agent | 전 에이전트 (특히 dev) |
| `sprint-memory.md` | pm-agent, reviewer/qa (특이사항) | pm-agent, solution-planner |
| `brand-system.md` | brand-designer (Foundation) | ui-ux-designer, dev, brand-designer (Production) |
| `copy/*.md` | brand-designer (Production) | dev |
| `design-output/*` | ui-ux-designer | dev, brand-designer |
| PR / PR comments | dev / reviewer / qa | 다음 에이전트 |
| `security/sprint-{N}.md` | security | pm-agent, dev (다음 스프린트) |

**다중 작성자 주의**: `architecture.md`, `sprint-memory.md` — append-only 정책 (작성 규칙은 shared-context/README.md에 명시됨). ✅

### 4. gstack 스킬 분배

| 에이전트 | gstack 스킬 수 |
|---------|--------------|
| Solution Planner | 2 (/office-hours, /plan-ceo-review) |
| PM Agent | 0 (gh CLI 위주) |
| Dev | 3 (/investigate, /review-self, /ship) + /browse |
| Reviewer | 1 (/review) + /browse |
| QA | 3 (/qa, /codex, /design-review) + /browse |
| UI/UX Designer | 3 (/design-shotgun, /design-html, /design-review) + /browse |
| Brand Designer | 1 (/design-consultation) + /browse |
| Security | 1 (/cso) + /browse |

`/review`는 Dev(self-review) + Reviewer(peer review)에 둘 다 사용 — 의도적 (다른 단계).
`/design-review`는 UI/UX Designer(self) + QA(peer)에 둘 다 — 동일 패턴.
**분배 결론**: ✅ 균등, 중복은 의도적.

### 5. 일관성 검증 종합

✅ 사이클 의도성 OK
✅ 책임 중복 없음
✅ reads/writes 그래프 정합
✅ 산출물 작성자/독자 모두 1+1 이상
✅ gstack 분배 균등

**8개 페르소나 모두 production-ready 후보** (적대적 검증 후 최종 확정).
