# docs/units/ — 작업단위 폴더 구조 & 관리 (정본)

각 Feature 작업단위 = `docs/units/<slug>/` 폴더 하나. **유저 스토리(L1)에서 출발해 status로 관리**되는 단일 추적 항목. (티켓 증식 방지 — `config/work-unit-contract.md`)

> **★ PM은 유닛을 쪼갤 때 아래 레퍼런스 커밋을 직접 읽고 동일 스타일로 작성한다:**
> - **[Oliver d88c638](https://github.com/suholee9509-coder/Oliver/commit/d88c638a83163336a47a09b3cde36c1e45de1dbd)** — 초기 유닛 spec 6종 (User Story·Acceptance·Validation·Boundaries 구조 표준).
> - **[Oliver bab64e4](https://github.com/suholee9509-coder/Oliver/commit/bab64e4c275cf2220744fdf6eb8dd992d1ab163e)** — *관리된* status.md 예시 (작업 진행에 따른 검증·변경파일·설계노트·ESCALATION 기록).
> - **[현재 Oliver docs/units/ 전체](https://github.com/suholee9509-coder/Oliver/tree/main/docs/units)** — 고도화 구조 (서브-spec 분할 `s2-board-render/{spec,hook-spec,integration-spec,apply-security-spec}.md`, design-locked 유닛 `s3-thinking-modes/design.md`).
> Grabit 적응: 디자인은 Figma 고정 SoT(역설계·픽셀-퍼펙트) → spec에 **대상 Figma 프레임 + `[fidelity]`** 추가, UI 유닛은 **인터랙티브 워크트리**(사용자 운전).

---

## 1. 파일 구성

| 파일 | 작성자 | 시점 | 내용 |
|---|---|---|---|
| `spec.md` | **PM** | 계획 시 (게이트 ⓑ 전) | `/goal` 정본 — L1 스토리·Acceptance·Validation·Boundaries (아래 §2) |
| `status.md` | **dev** | **매 턴 갱신** | 라이브 관리 — 상태·검증결과·변경파일·설계노트·리스크·ESCALATION (§3) |
| `plan.md` (선택) | dev | 착수 시 | 구현 순서 (PM 스텁 → dev 채움). 작은 유닛은 생략 가능 |
| `design.md` (선택) | PM/사용자 | 설계 확정 시 | **design-locked 유닛의 확정 설계 정본** — *스펙만으로 담기 힘든* 철학·아키텍처·프롬프트 양식·인터랙션·상태 매핑 + **사용자 정렬 결정 이력(날짜)**. UI 유닛은 Figma 프레임 인벤토리 포함. spec은 매 턴 **design.md + spec reload**. (예: Oliver `s3-thinking-modes/{spec,design}.md`) |

### 무거운 유닛 = 폴더 내 서브-spec 분할 (티켓 증식 ❌, 한 유닛 유지)
한 유닛이 단계가 명확히 갈리면(예: 디자인 퍼블리시 → BE 배선 → 보안), **새 티켓을 만들지 말고** 같은 폴더에 단계별 spec/status를 둔다:
```
docs/units/<slug>/
  spec.md            status.md            # 메인(보통 UI 퍼블리시·인터랙티브)
  integration-spec.md  integration-status.md   # 트렁크 실데이터 배선 (헤드리스 backend)
  <phase>-spec.md      <phase>-status.md       # 필요 시 추가 단계
  design.md                                 # (선택) 확정 설계 SoT
```
- 각 서브-spec은 **frozen 계약**(앞 단계가 잠근 것 — "미접촉")을 명시하고, **T1~T7식 태스크 분해**(파일 경로·동작·테스트)로 작성. (예: Oliver `s2-board-render/integration-spec.md`)
- 분할은 *계획 시점* PM 판단. 작업 중 즉흥 분할 ❌ (사이징 게이트에서 표면화).
- **design-locked 유닛**(설계가 스펙보다 무거운 것): `design.md`를 확정 정본으로 두고, spec.md 헤더에 **`★설계 정본 = design.md (매 턴 design.md + spec reload)`**를 선언. dev/`/goal`은 매 턴 둘 다 reload.

---

## 2. spec.md 템플릿 (= dev `/goal` 조건)

```
# <slug> — 성공조건 (/goal)

> Sprint <N> · Wave <X> · owner=<frontend|backend|both> · mode=<인터랙티브 워크트리 | 헤드리스 /goal>
> · Issue #<n> · dep=<선행 유닛 머지 후> · migration <유무>
> 매 턴 spec + plan + 대상 Figma 프레임 reload.

## L1 User Story  (검증의 north star — 각 인수기준이 여기로 추적된다)
- **L1-a** As a <user>, I can <do X> so that <value>.
- **L1-b** As a <user>, ...                       # 스토리가 여러 시나리오면 라벨로 쪼갠다
**Production acceptance (관찰가능):** <prod-like 환경에서 사용자가 실제로 X를 할 수 있다 — QA가 e2e 재현>

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- <프레임 식별자/링크> (+ 빈/로딩/에러 상태 프레임)   # UI 유닛만. docs/design/README

---
/goal --tokens <예산>  [위 스토리를 실현하는 목표 상태, 형용사 금지]

### Source of truth (매 턴 reload)
- read   docs/units/<slug>/spec.md   (이 파일) · follow plan.md · update status.md
- view   Figma 프레임 (Figma MCP)      # UI면 — 토큰·간격·상태 정확 값
- 참조: state/decisions.md ADR-<n> · config/quality_standards.md · <관련 types/계약>

### Acceptance criteria  (스토리에서 도출 · 관찰가능 · 각 항목 → L1-x 추적)
**BE** (owner=backend|both)
- [behavior]       <서버/AI 동작> → L1-a
- [negative]       <잘못된 입력/엣지/실패 처리>
**FE** (owner=frontend|both)
- [behavior]       <사용자가 X 할 수 있다> → L1-a/b
- [negative]       <빈/공백 차단·XSS 무해화·미인증 차단>
- [non-regression] <기존 Z 안 깨짐>
- [state]          빈/로딩/에러 각각 정의된 동작 (프레임대로)
- [fidelity]       지정 Figma 프레임과 1:1 (토큰·간격·정렬·타이포·상태) → L1-b   # UI만

### Validation  (증명 명령 — QA가 clean checkout에서 그대로 재실행)
- <명명된 test 파일> 통과 (예: `*.contract.test`) — **AI/외부는 목킹 → 결정론적**. 동어반복 ❌.
- `tsc -b` 0 · lint 0 · lint:fsd 0 · 콘솔 0
- (UI) `/design-review` 충실도(프레임 1:1) PASS · 스크린샷

### Boundaries
- only edit (BE): <경로> · only edit (FE): <경로>
- do not change: <인증·결제·마이그레이션·앞단계 frozen 계약> · preserve: <FSD·RLS·상속 계약>
- 정적 유지: <다음 스프린트로 미루는 것 — 지금 건드리지 않음>
- out of scope: <항목> → <S2/S3/다음 단위>
- main 직접 푸시 ❌ · blast radius = `feat/<slug>`

### Loop behavior
- 의미있는 변경마다 validation 실행 · status.md 갱신
- ⚠ **goal = 모든 L1-x의 production acceptance가 관찰가능하게 충족될 때까지 루프.** 미충족 기준에 done ❌ → ESCALATION (§C no-fake-done)
- in-flight 발견은 이 유닛이 흡수, 범위 밖은 PM 보고 (새 티켓 ❌) · 토큰/턴 예산 초과 시 차단 사유 기록 후 정지
```

---

## 3. status.md 템플릿 (dev가 매 턴 갱신 — 관리의 핵심)

```
# <slug> — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: <계획(미스폰) | 진행 | 검증 green | escalation | qa-fail>
- 검증:
  - <실제 명령 + 결과> (예: `deno test …` → 18/18 passed · `tsc -b` 0 · 골든 8/8 0% diff)
- 변경 파일 (boundary 준수): <경로 — additive/신규/seam 등 성격>
- 설계 노트: <비자명한 결정·계약·트레이드오프>
- 리스크: <남은 리스크 또는 (없음)>
- ESCALATION: <질문·시도·정지지점 또는 (없음)>

STATUS = "<한 줄 요약 — 예: green: tsc0 · test 18/18 · fidelity PASS>"
```

## 4. plan.md 스텁 (선택)
```
# <slug> — plan (구현 순서)
> dev가 spec.md Acceptance 충족 구현 순서를 기록·갱신. (PM 스텁)
1. (dev 작성)
```

---

## 5. 흐름 (UI 역설계)
**① PM이 Figma 구조를 *먼저* 파악**(화면 계층·내비게이션·플로우·컴포넌트) → **② *그 구조에서* 유닛 절단**(기능 목록 ❌) + 기획(`docs/source/`·manyfast)으로 스코프·규칙 검증 → ③ 위 레퍼런스 스타일로 `spec.md` 작성(게이트 ⓑ) → ④ dev가 `plan/status`로 관리하며 backend=헤드리스 `/goal`·**frontend(UI)=인터랙티브 워크트리(사용자 운전)** → ⑤ QA가 **각 L1-x**를 e2e 재현 → 게이트 ⓒ(충실도)/ⓓ(머지).
> **PM(구조파악·절단·spec)·frontend(픽셀-퍼펙트 구현)·qa(충실도)가 모두 Figma를 직접 본다.** goal은 모든 L1 스토리가 충족될 때까지 루프.
