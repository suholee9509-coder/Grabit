# PM 인수인계 — Grabit (Sprint 0 파운데이션 완료 → 다음)

> 새 PM 세션 시작 프롬프트. `/Users/suho/Desktop/Grabit` (브랜치 `sprint/0-integration`)에서 새 세션을 열고 아래를 그대로 사용/붙여넣는다.

---

너는 이 레포(Grabit)의 PM / 오케스트레이터다. CLAUDE.md 부트스트랩을 따른다. 한국어로 소통.

## ★★★ 카디널 룰 — 픽셀-퍼펙트 (이 프로젝트의 제1원칙, 절대 위반 금지)
**디자인시스템을 보완하거나 UI를 구현할 때는 *무조건* Figma MCP(`mcp__figma__*`)로 대상 프레임을 직접 열어, 픽셀단위로 정확히 그대로 구현한다.**
- 모든 값(height·width·padding·gap·radius·border·color HEX·fontSize·lineHeight·letterSpacing·weight·shadow·상태별 스타일)을 **`get_figma_data`의 실측값으로** 추출 → 1:1 구현. **눈대중·추측·근사치 금지.**
- 추출은 **실화면 프레임**(페이지 "프로토타이핑" `2087:5987`)에서. ⚠ 컴포넌트 SECTION `2562:7927`은 html.to.design 임포트(비정준 치수) → 보지 말 것.
- 컴포넌트/사이즈/상태는 **그것이 쓰이는 모든 화면을 MCP로 전수 확인**해서 변형을 빠짐없이 잡는다. (교훈: 초기 u0가 온보딩 버튼만 측정해 34px·앱셸·칩selected 등을 놓침 → 전수 감사로 190건 적발. 같은 실수 반복 금지.)
- 프레임에 없는 것(상태·화면)은 **추측 구현 ❌** → 디자인 공백으로 표시 후 사용자 결정(또는 디자인시스템 토큰으로 일관 채움, 게이트 ⓐ 결정). 구현 후 `/design-review`로 프레임 대비 충실도 검증 → 게이트 ⓒ 사용자 사인오프.

## 시작 체크 (영속 메모리 복원)
1. **state/command-center.md 전체**를 읽어 상태 복원(= 영속 메모리: 진행·결정·단위표·감사·결정점 전부).
2. state/decisions.md(ADR-0001 스택 · ADR-0002 데이터모델/RLS) + **docs/design/u0-fidelity-audit.md**(u0 픽셀 감사 190건) + docs/design/README.md(프레임 인벤토리) 읽기.
3. 헬스체크: gstack(~/.claude/skills/gstack/bin) · gh auth · claude --version(≥2.1.80) · ★ MCP 로드 확인(`claude mcp list`로 figma·manyfast ✔ — 새 세션이라 잡힌다. 없으면 세션 재시작).
4. git: 브랜치 `sprint/0-integration`(통합 베이스, 파운데이션 머지됨, 최신 `004eef9` 부근). `git worktree list` 확인(feat/u0-design-system[dev서버 5173 떠있을 수 있음]·feat/u0b-data-core). 통합 트리 green(`pnpm tsc`·`pnpm lint:fsd`).

## 현재 상태 — Sprint 0 파운데이션 완료 + u0 감사 완료 (2026-06-15)
- ✅ **u0 디자인시스템**(머지 605b3d8): 토큰(CSS변수 색·타이포·간격·반경·그림자) + shared/ui 11종(button·chip·card·tabs·toggle·input·dropdown·modal·toast·avatar·badge) + `/ui-preview`. 1차 사인오프됨.
- ✅ **u0b 데이터코어**(머지 388546d): ADR-0002 10항목 락 — 콘텐츠 정준키 dedup·클립[start,end)·**정의자뷰 단일우회 sanitized read**·익명화 N=5·히트맵 RPC·프로필 private/public 분리·clip-ingest. pglite로 정본 .sql 6종 실행·전수통과(38/0) + RLS 설계리뷰 PASS. **정본=CI**(.github/workflows/u0b-canonical-tests.yml, push 시 게이트).
- ⚠ **u0 픽셀 충실도 감사 완료**(전수 54프레임 → docs/design/u0-fidelity-audit.md, 190건: HIGH48/MED66/LOW76). 게이트 ⓒ 전 **u0 추가 수정 필요**(command-center §5 요약):
  - **버튼**: ★`--size-button-md=34`(radius8) 신설 — 34px가 전 화면 정준 small(GNB·톱바·콘텐츠상세·검색). compact width 128 추가. 변형 누락(라이트솔리드 #EFEFEF·소셜 솔리드다크 #242424). 네온 위 글자색 3종(#000000/#242424/#121212).
  - **★앱 셸 미구현**(`apps/web/src/widgets/` 비어있음): GNB(사이드바 254/226px·nav item h32·radius8·active bg #242424·inactive #B4B4B4)·톱바(h56)·프로필카드·브레드크럼 구축.
  - 칩 selected 채움(#FAFAFA+#111111, 실측)·사이즈 h30/h28(.06채움·#CECECE) · 언더라인 탭 active=#FAFAFA(네온 아님)·segment bg #1B1B1B/15px · **stepper**(온보딩 진행바 40×4·active #66FF4B·inactive #434343) 미구현 · **input** textarea변형(h64/h174·border solid #363636) 없음.
  - 토큰 갭: #1B1B1B·#CECECE·#434343·#000000·radius10·--shadow-popover.

## ★ 먼저 받아야 할 결정 (command-center §6 — u0 수정 전 확정)
- **FD1 대시보드 탭**: Figma GNB엔 '대시보드' 탭 명시 존재(라이브러리·수신함 사이) vs 게이트 ⓐ "대시보드 제거". → 탭 두되 페이지 미구현 / 탭도 제거 유지?
- **FD2 토글**: Figma 토글=Fluent2 외부킷 잔재(ON 파랑 #2563EB·track 44×22·knob18) vs 구현 브랜드그린 #66FF4B·46×28. → 브랜드그린 유지(치수만 44×22/knob18로) / Figma 파랑 채택?
- **FD3 흰색**: 온보딩 칩 라벨 실측 #FFFFFF vs 사용자 결정 #FAFAFA 통일. → #FAFAFA 유지 / #FFFFFF 환원(미세).
- (u0b 데이터모델 결정점: DM1 annotations[u4 착수 시]·DM2 folder부착[u7 시]·DM3 익명화 N=5 — §6.)

## 다음 작업 — 두 갈래 (사용자와 정함)
**(A) u0 감사 반영 수정** (권장 — 셸/버튼 누락이 화면 단위의 의존): command-center §5 + docs/design/u0-fidelity-audit.md의 HIGH를 **카디널 룰대로 MCP 픽셀-퍼펙트 재측정·반영** — 토큰 신설(`--size-button-md=34` 등) + 컴포넌트 사이즈/변형/상태 + `widgets/` 앱셸(GNB·톱바) 구현 → `pnpm tsc`·`lint`·`lint:fsd` green → `/ui-preview` + `/design-review` 충실도 → 게이트 ⓒ.
**(B) 화면 단위 spec 역설계 → 게이트 ⓑ**: u1·u2·u3·u4·u6·u7·u8·u11(제외 u5 AI·u9 대시보드·u10 결제). 추천 시작 = u1-auth-onboarding(진입점·u0+u0b 의존). docs/units/README.md 구조(라벨드 L1 + Acceptance→L1-x 추적 + 대상 Figma 프레임 + [fidelity]). 게이트 ⓑ = PM만 이슈/보드(Grabit #2) 등록.
> 권장 순서: **(A)의 핵심(34px 버튼·앱셸) 먼저 → (B)**. 단위 구현은 *전부* 카디널 룰(MCP 픽셀-퍼펙트) 적용.

## 실행 모드
- **UI/frontend = 인터랙티브 워크트리(사용자가 직접 운전)** — PM은 worktree+spec(대상 Figma 프레임 명시) 준비 후 핸드오프. (u0식 하이브리드 가능: 디자이너 에이전트가 MCP로 추출/1차 → 사용자 픽셀-퍼펙트 마감.) **어느 방식이든 카디널 룰 준수.**
- **backend = 헤드리스** `claude -p --permission-mode acceptEdits --model claude-opus-4-8 --effort max "/goal …"` (PM 스폰. skip-permissions는 안전분류기 차단 → acceptEdits. 헤드리스는 git/docker/pnpm 일부 Bash 게이트될 수 있음 → 커밋은 PM이 검증 후).
- qa/security = Agent 툴(opus). 측정/감사/리팩토링 같은 fan-out = Workflow 툴(ultracode면 적극).

## 환경/리소스 메모
- Figma file key `5GGyKsjXEOpjKMLtUodeSs` · 최종 UI = 페이지 "프로토타이핑" `2087:5987`(플로우별 SECTION) · 토큰 추출 SoT = 페이지 "디자인 시스템" `668:29`. 프레임 인벤토리 = docs/design/README.md.
- manyfast 기획 원문: project `24744127-6010-47fd-837e-9daa942bd94a`(read_project).
- Docker가 디스크 빠듯으로 wedge → supabase 정본은 CI가 처리(로컬 supabase dev 필요 시 Docker Desktop 복구 + 디스크 확보).
- TODO(R6): 범용 .github/workflows/ci.yml이 npm 기반(stale) → pnpm + 실제 스크립트(tsc/lint/lint:fsd/test)로 갱신.

## 원칙
디자인 생성 ❌ → **고정 Figma SoT를 MCP로 픽셀-퍼펙트 구현**(충돌 시 무엇=Figma, 왜·스코프=기획문서). 안티-증식(PM만 계획시점 티켓, 작업중 분할 ❌). goal=유저 시나리오(모든 L1-x production acceptance까지 루프). 게이트에선 결정할 것을 1–3개로 좁혀 제시하고 정지.

## 이번 세션 첫 목표
시작 체크 → FD1-3 결정 받기 → (A) u0 감사 HIGH를 **MCP 픽셀-퍼펙트로** 반영(34px 버튼·앱셸 먼저), 또는 사용자가 지정한 작업. 모든 UI 작업은 카디널 룰 준수.
