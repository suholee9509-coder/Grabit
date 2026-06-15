# Feature 작업단위 계약 (정본)

> 이 시스템의 #1 설계 목표: **티켓 증식 차단**. 선형 핸드오프 + 모든 역할의 티켓 생성권 + ≤300 LOC 과소 사이징 + 작업 중 반응형 분해는 한 기능을 수십 개 파편 티켓으로 증식시킨다(기능 분할·QA 발견이 새 티켓·배선/hardening 파편 다수). 근본 원인: 과소 사이징 · 모든 역할의 티켓 생성권 · 단일 소유자 부재 · 작업 중 반응형 분해.
>
> 이 문서는 pm.md·frontend.md·backend.md·qa.md·security.md·CLAUDE.md가 참조하는 **정본**이다.

---

## 0. 작업 계층 (Story → Unit → Criteria) — top-down

목표는 코드가 아니라 **프로덕션 사용자 시나리오**에서 도출된다. 모든 작업은 3레벨로 추적된다:

```
L1  User Story (프로덕션 인수기준)  ← 최상위 정의 = 검증의 north star
      "As <user>, I can <do X> so that <value>"
      Production acceptance: <prod-like 환경에서 사용자가 X를 실제로 할 수 있다 — 관찰가능>
        │  (각 인수기준이 ↓ L3 기준을 도출하고, QA는 이 *스토리*를 e2e 검증)
L2  Feature 작업단위                — 1 story ≈ 1 unit (한 소유자 end-to-end)
        │                            FE+BE 필요 시: 한 유닛 · 두 소유자(분할 아님)
L3  /goal 5섹션 성공조건 (spec.md)  — L1에서 도출·추적 (각 기준 → 어느 인수기준을 지지)
```

- **1 story ≈ 1 작업단위**: 스토리가 커서 多유닛이 되면 옛 증식 재발 신호 → 사이징 게이트에서 재검토. FE+BE는 *한 유닛, 두 소유자*.
- **검증의 기준 = 스토리**: "테스트 통과"가 아니라 "사용자가 X를 프로덕션 수준에서 실제로 할 수 있나"가 최상위 DoD. → false-done을 강하게 차단(시나리오는 못 속임).
- **디자인 = 고정된 Figma SoT('무엇')**: 화면·상태·컴포넌트·토큰은 Figma가 정한다(생성 ❌, 픽셀-퍼펙트 구현). 의도·스코프·데이터규칙('왜')은 기획문서. *충실도*(프레임 1:1)는 검증이 비싼 인수기준 → 사용자 게이트 ⓒ(충실도 사인오프).

---

## A. 6원칙 (계약)

1. **작업단위 = 수직 Feature 슬라이스** = *한 User Story를 충족하는 슬라이스*. 크기 기준은 LOC가 아니라 **"한 에이전트가 한 worktree 세션에서 책임지고 끝낼 단위"**. BE+FE+상태(빈/로딩/에러)+배선+테스트를 *사전 열거*.
2. **단일 소유자 end-to-end**: 구현 + 셀프리뷰 + 배선 + hardening + *자기 기능의 QA 지적 수정*까지 한 사람.
3. **In-flight 흡수**: 기능 범위 내 발견(엣지케이스·배선·hardening·QA수정)은 *같은 소유자·같은 단위*가 흡수. **새 티켓 분기 금지.**
4. **PM 티켓 생성 독점**: 오직 PM이, *계획 시점에만* 작업단위/이슈를 만든다. dev/QA/Security는 발견을 PM에 *보고*; PM이 "현 단위 흡수 vs 다음 스프린트 새 단위" 판정. (유일 예외: 스프린트말 Security의 Critical/High — Security가 *제안*, PM이 생성)
5. **계획 단계 사이징 게이트 + WIP 상한 + 트립와이어**: PM이 각 단위를 "한 소유자·한 세션" 테스트로 검증. 실패 시 *스프린트 시작 전* 재분해. **작업 중 분할 절대 금지.** 단위가 하위단위를 낳아야 할 것 같으면 = 계획 실패, 사용자와 재검토.
6. **QA는 슬라이스(=스토리) 전체** 검증; 실패는 *같은 소유자·같은 단위 연장*으로. 보안 발견은 다음 스프린트로.

**측정** (retro): `계획외 하위단위 스폰 = 0` · `단위당 에스컬레이션 ≤ 1` · `false-done(QA verify-first에서 잡힌 허위완료) = 0`.

---

## B. 성공조건 작성 — `/goal` 성공·코드 퀄리티의 핵심 레버 (§5.5)

> `/goal`의 평가자(기본 Haiku)는 *대화에 드러난 것만* 판정한다. **성공조건 품질이 곧 개발 성공률·코드 퀄리티를 결정한다.** 약한 기준("동작하면 됨")은 40턴 동안 잘못된 것을 고착시키고, 강한 기준은 자율 고품질 수렴을 만든다. PM의 **최우선 산출물 규격**이다.

### 9원칙
1. **관찰가능한 검증에 매핑**: 각 기준 = dev가 실제 실행·표출하는 명령/출력 (`npm test` exit 0, `tsc --noEmit`, `/qa` PASS, DOM/스크린샷). 주관어("잘 동작") 금지.
2. **행위/인수 레벨, 구현 레벨 아님**: 최종 상태(사용자가 무엇을 할 수 있나) — *L1 User Story의 인수기준에서 도출*. "stop 시 즉시 멈추고 입력 잠금해제 — `*.spec.ts` 통과로 증명"(O) vs "useX에 abort 추가"(X).
3. **수직 슬라이스 완전 커버**: BE+FE+상태+배선+테스트 *사전 열거*. → **이 목록이 곧 안티-증식 장치**(기준에 없는 상태가 나중에 followup 티켓을 낳음). 포괄적 기준 = followup 0.
4. **품질 게이트를 명시적 기준으로**: 테스트 작성+통과 · 타입 clean · lint clean · 콘솔 에러 0 · 셀프 `/review` 무이슈 · (UI) `/design-review` **충실도(Figma 프레임 1:1) PASS**. "검증까지 루프"가 품질을 *올리려면* 품질 체크가 곧 검증 항목이어야 한다.
5. **경계 설정(stop)**: `--tokens` 예산 + `or stop after N turns` + 에스컬레이션 절. 무한·퇴행 루프 방지("무한 루프는 비용").
6. **반증가능·구체적**: 측정 임계값, 명명된 파일/테스트, 구체 사용자 행동.
7. **게이밍 방지**: "테스트 약화로 통과" 방어 — 테스트의 *의도* + "실제 시나리오 재현(동어반복 금지)" 명시 + **QA가 슬라이스 독립 재검증**(self-eval 외부 체크 = 심층 방어, §C).
8. **진실의 원천 분리 + 매 턴 reload**: 성공조건은 `docs/units/<slug>/spec.md`에 두고 `/goal`이 *매 턴 reload*; dev는 `status.md`를 매 턴 갱신. 채팅 메모리 의존 ❌ (**context rot** 방지).
9. **범위 경계(Boundaries) 명시**: "수정 가능 경로 / 변경 금지 시스템(인증·결제·마이그레이션) / 보존 계약". 스프롤·사고 차단 = 안티-증식.

### spec.md 템플릿 (= dev `/goal` 조건). 최상단에 User Story.
```
# Unit: <slug>

## User Story (L1 — 검증의 north star)
As <user>, I can <do X> so that <value>.
Production acceptance (관찰가능): <prod-like 환경에서 사용자가 X를 실제로 할 수 있다>

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
  - <프레임 식별자/링크> (+ 빈/로딩/에러 상태 프레임)

---
/goal --tokens <예산>  [위 스토리를 실현하는 목표 상태, 형용사 금지]

Source of truth (매 턴 reload):
  - read   docs/units/<slug>/spec.md     # 스토리·Acceptance·Figma 프레임(이 파일)
  - view   Figma 프레임 (Figma MCP)        # 디자인 '무엇' — 토큰·간격·상태 정확 값
  - follow docs/units/<slug>/plan.md      # 구현 순서
  - update docs/units/<slug>/status.md    # 변경·검증결과·충실도 gap·리스크

Acceptance criteria (스토리에서 도출, 관찰 가능한 동작):
  - [behavior]        <사용자가 X 할 수 있다>            → story 인수기준 #
  - [negative]        <잘못된 입력/엣지에서 Y>
  - [non-regression]  <기존 Z 안 깨짐>
  - [state]           빈/로딩/에러 각각 정의된 동작 (프레임에 정의된 대로)
  - [fidelity]        지정 Figma 프레임과 1:1 (토큰·간격·정렬·타이포·상태)

Validation (증명 명령 — QA가 clean checkout에서 재실행할 바로 그 명령):
  - <test cmd> 종료코드 0  ·  tsc --noEmit 0  ·  lint 0
  - (UI) /design-review 충실도(프레임 1:1) PASS · 콘솔 에러 0
  - 의미있는 테스트 — 동어반복 금지

Boundaries:
  - only edit <허용 경로> · do not change <인증·결제·마이그레이션 등> · preserve <계약/동작>

Loop behavior:
  - 의미있는 변경마다 validation 실행 · status.md 기록
  - <N턴 / M분 / 토큰예산> 초과 시 차단 사유 기록 후 정지
  - ⚠ 기준 미충족 시 done 선언 금지 → ESCALATION 기록 후 정지 (§C no-fake-done)
```

**PM 작성 보조**: 약한 기준은 작성 *전에* `/plan-eng-review`(엣지·테스트플랜)/`/spec`으로 강화. 그래도 약하면 사이징 게이트에서 반려.

---

## C. 완료 검증 (false-done 차단) — 2층 방어

`/goal` 평가자는 *대화에 드러난 것만* 판정한다. 루프가 길어지면 dev가 "됐다 치고" 종료하는 false-done이 발생할 수 있다. 2층으로 막는다:

**① 예방 (dev가 못 속이게)** — dev 페르소나 명문화
- **기준 미충족 시 절대 `done` 선언 금지** → `STATUS: escalation`으로 정지 (status.md에 사유).
- 검증은 *주장*이 아니라 **실제 명령 출력**을 대화에 표출해야만 인정. (예: "tests pass" 텍스트 ❌ → `npm test` 실제 실행 로그 ✓)

**② 탐지 (done 경계에서 독립 재검증)** — PM은 *결정*만, *실행*은 위임 (PM 과중 방지)
- dev `done` 반환 → **QA의 verify-first(Phase 0)**: spec의 `Validation` 명령을 **clean checkout에서 직접 재실행** → exit code로 판정. 통과 못 하면 *e2e 안 돌리고 즉시 FAIL*(fail-fast) → 같은 소유자 continuation. 통과해야 QA e2e(스토리 검증)+codex 진행. → dev 자기보고를 안 믿고 *명령을 다시 돌려* 판정하므로 LLM이 못 속임.
- **+ CI 게이트 (Sprint 0 이후)**: dev `/ship` PR에 GitHub Actions가 같은 Validation 명령 실행 → *비-LLM·외부·완전 un-gameable*. PR이 red면 false-done이 객관적으로 드러남.
- 최상위 기준은 **스토리(L1)**: QA는 "사용자가 X를 실제로 할 수 있나"를 e2e 재현 — 가장 못 속이는 완료 기준.

---

## D. dev 배정 (역할별 실행모드 — `config/orchestration-rules.md` §8)
- **backend = 헤드리스 `/goal` (백그라운드, 모델 `claude-opus-4-8`·`--effort max`)**:
```bash
cd <worktree> && claude -p --permission-mode acceptEdits \
  --model claude-opus-4-8 --effort max \
  "/goal --tokens <예산>
   $(cat docs/units/<slug>/spec.md)
   매 턴 docs/units/<slug>/status.md 갱신. or stop after <N> turns.
   기준 미충족 시 done 금지 — status.md에 ESCALATION 기록 후 정지." &
```
- **frontend(UI) = 인터랙티브 워크트리 (사용자 직접 운전)**: PM이 headless 스폰하지 않는다. worktree·spec(대상 Figma 프레임)을 준비해 사용자에게 핸드오프 → 사용자가 frontend.md 페르소나로 Figma MCP 퍼블리싱.
- **백그라운드 캘리브레이션**(backend): `status.md` 첫 ~5턴 관찰 → spec 오류·나쁜 테스트·무관 파일 수정 조기 차단. 고위험 단위(인증·결제·마이그레이션)는 사용자가 관찰, 완전 unattended ❌.
- **에스컬레이션 = continuation**: dev가 정지·보고 → PM이 답 주입해 *같은 worktree* 재스폰(코드·plan·status 디스크 보존).
- **폴백 γ**: 헤드리스 `/goal` 불안정 시 Agent 툴 서브에이전트 + 프롬프트 goal-loop + Stop-hook.
