# Grabit 자율 운영 런북 (Overnight Autonomous Loop)

> **목적**: 사용자 부재(수면) 중 PM이 남은 MVP 단위(Wave2~4)를 *자율적으로* 구현·통합·검증해 나가되, **리스크 없이** 진행하기 위한 규칙·레시피·중단조건의 단일 정본. PM과 모든 워커 에이전트는 매 루프에서 이 문서 + `state/command-center.md` + `state/decisions.md`를 reload한다.
> **이 문서는 사용자가 자리에 없을 때 "사용자 대신 판단"의 근거다. 여기 없는 비가역 결정은 하지 않는다.**

---

## 0. 완료 조건 (이 루프가 끝나는 지점)
- **최종 목표 = 실제 구동/사용 가능한 프로덕트.** 단순 UI 퍼블리싱이 아니라 로그인→클립→라이브러리→검색이 end-to-end 작동하는 상태.
- **성공**: Wave2~4 전 단위(**u2·u4·u7·u8·u6·u11**) 구현·검증·통합 → **Wave5 프로덕션화**(목킹 제거·실제 Supabase 배선·e2e·배포 설정)까지 완료 → **"사용자가 OAuth 키·Supabase 프로젝트만 연결하면 즉시 구동"**되는 상태 + 셋업 가이드(§11).
- **★ u6 = 실제 동작하는 크롬 확장(MV3 WXT)을 반드시 구축한다(사용자 명시 지시 2026-06-16 — 스킵 금지).** 제품 핵심 기능(클리핑 2경로 중 확장). ADR-0001대로 `apps/extension`(WXT) 신규 워크스페이스 추가 — content script(YouTube 주입 버튼+클립 모달, Shadow DOM)·popup(React 최소셸)·background SW + 웹세션 bearer→`chrome.storage`→401 재로그인. 무거우면 폴더 내 서브-spec 분할(새 티켓 ❌). **u6 blast radius = `apps/extension/**`(+`packages/ui` 추출) → apps/web FE·supabase BE와 겹침 0 → u6도 병렬 후보**(§1.10 동일 논리). 빌드/타입/적재(load unpacked) 검증까지 완료해 "개발자모드 로드 시 실제 클립 전송 동작"을 만족.
- **★ 무인의 경계(중요)**: 다음은 에이전트가 못 한다(키·콘솔·결제·도메인) → **코드/설정/가이드만 완비**하고 `§11 프로덕션 배선 큐`로 분리(아침에 사용자 1회): OAuth 키 발급(Google/Kakao 콘솔)·Supabase 클라우드 프로젝트 생성·`.env` 실값·배포 도메인·실제 배포 트리거. **이걸 무인이 추측 실행 ❌**(키 위조·임의 배포 금지).
- **종료(부분)**: 예산 소진 / 중단조건(§7) → 완료분 머지 + `overnight-log.md` 기록 후 정지.
- **금지**: 완료조건 미충족인데 done(§R6 no-fake-done). 애매하면 **스킵 + 로그**.

---

## 1. 황금 규칙 (절대 — 위반하면 그 작업 중단·로그)
1. **★★ 카디널 룰 (이 프로젝트 제1목표 — 사용자 최우선 재강조)**: UI는 **Figma MCP(`mcp__figma__get_figma_data`)로 대상 프레임을 직접 열어 픽셀단위까지 완벽히 동일하게** 구현한다. 모든 값(height·width·padding·gap·radius·border·color HEX·fontSize·lineHeight·letterSpacing·weight·shadow·상태별 스타일)을 실측 → **1:1**. 눈대중·추측·근사치 **절대 ❌**. 컴포넌트/사이즈/상태는 *그것이 쓰이는 모든 화면*을 MCP로 전수 확인해 변형을 빠짐없이 잡는다(u0 초기 실수=온보딩 버튼만 측정→190건 누락. 반복 ❌). 실화면 = 페이지 "프로토타이핑" `2087:5987` 하위(컴포넌트 SECTION `2562:7927` 비정준 → 보지 말 것). **★ 충실도 검증 = FE 구현+검증 단계가 책임진다(사용자 지시 2026-06-16): 측정 .md/.png 대비 자체 검증으로 픽셀 1:1을 그 단에서 마무리. 별도 `/design-review` 게이트 ❌(제거).** FE Workflow의 측정→구현→검증 파이프라인이 충실도를 충분히 정확하게 보장해야 하며, 미달이면 *그 검증 단계 안에서 수정 루프*로 끝낸다(PM이 사후 design-review 돌리지 않음). 디자인 공백(프레임 없음)만 추측 ❌ → u0c 파운데이션 토큰/컴포넌트로 일관 채움 + 로그.
2. **u0c 파운데이션 재사용**: `shared/ui`(button 34px·chip·toggle FD2·tabs·input·stepper·breadcrumb 등)·`widgets`(app-shell·sidebar FD1 4탭·topbar)·`tokens.css`. 새 컴포넌트 발명 ❌(없으면 토큰으로). 하드코딩 HEX ❌.
3. **안티-증식 + 티켓 자유 생성**: PM만, 계획 시점(Wave 진입)에만 이슈 생성. **작업 중 새 티켓 분기 ❌**, 범위 내 발견은 같은 단위가 in-flight 흡수. **단 "구동 가능한 프로덕트"에 필요한 단위/단계(프로덕션화·e2e·배포 준비 등)는 PM이 계획 시점에 *자유롭게 생성*한다** — 수직 슬라이스 또는 명확한 단계여야 하고(잡무 증식 ❌), 목표는 사용가능 프로덕트.
4. **Frozen(절대 미접촉)**: force-push ❌ · `.env` 커밋 ❌ · **u0b 계약**(마이그 0001~0010·`clips`·`get_or_create_content`·`content_clips_public`·`content_heatmap`·`complete_onboarding`·`is_onboarded`·RLS) · **u0c 토큰/컴포넌트/앱셸 시그니처`**(소비만) · 브라우저측 LLM·외부 API 키 호출 ❌(서버/엣지만). **★ main 머지/push = 해제(사용자 지시 2026-06-16)**: *검증 green인 완료 단위*에 한해 `sprint/0-integration → main` 머지 + `git push origin main` 허용(§1.11·§3-8). 단 **force-push ❌**·**`.env` ❌**·**실제 배포 트리거는 여전히 hard-block(사용자 게이트)** — main 머지 ≠ 배포(현재 CD 미배선이라 자동배포 없음).
5. **no-fake-done**: 검증 게이트(§4) 미충족 = done ❌. 거짓 완료·동어반복 테스트 ❌.
6. **비가역은 보수적**: 데이터 손실·스코프 변경·실명 노출·RLS 약화·보안 정책 변경은 **하지 않는다**(보류 + ESCALATION 로그). 가역(reversible) 결정만 기본값으로 진행.
7. **FSD 경계**: app→pages→widgets→features→entities→shared 하향임포트·배럴(`@/...`)·동일레이어 크로스슬라이스 ❌·`lint:fsd` 0.
8. **★ Skip-and-continue (막히면 멈추지 말고 건너뛰고 계속 — 사용자 최우선 지시)**: "사용자 개입 필요"는 *에이전트가 물리적으로 불가능한 것*에만 적용한다. **Hard-block 목록(이것만 건너뜀)** = OAuth 키 발급·Supabase 클라우드 프로젝트·`.env` 실값·배포 도메인/트리거(§11) · 비가역 데이터 손실 · 보안 정책 약화(RLS 제거 등) · 스코프(게이트 ⓐ) 변경 · ADR 개정 · 실명 노출(annotations). **이 목록 밖의 모든 것**(어떤 결정·디자인 공백·구현 방법·라이브러리 선택·통합 충돌)은 §6 기본값 또는 *보수적·가역* 선택으로 **반드시 진행**한다. "결정/확인이 필요하다"는 이유로 루프를 멈추지 말 것. 한 항목이 hard-block이면 **그 항목만 스텁/목킹/배선 큐(§11)로 격리하고 단위의 나머지는 끝까지 완료**한다(단위 전체 중단 ❌). 예: OAuth 실키 없음 → 로그인 버튼·OAuth 플로우·콜백 코드·mock 세션은 전부 완성하고 *실키 연결만* 큐. 부분완료도 완료로 기록(잔여는 큐 명시).
10. **★ BE 병렬 상시화 (사용자 지시 2026-06-16 — 매 사이클 적용)**: **FE 워크플로가 도는 동안, 충돌 리스크 없는 백엔드 작업을 항상 별도 워크트리로 병렬 실행한다.** 근거 = blast radius 분리: **BE = `supabase/**`(마이그·RPC·pgTAP·functions)** · **FE = `apps/web/src/**`** → 파일 겹침 0이라 병렬 안전. 적용:
   - FE 단위(u2·u4 등)가 도는 동안, *아직 BE 마이그가 필요한 다가올 단위*(u7 folders·u8 FTS·u11 soft-delete)의 **additive 마이그(0011~)+RPC+pgTAP**를 헤드리스 `/goal`로 미리 만든다(BE-only 브랜치 `feat/<slug>-be`).
   - **마이그 번호 사전 배정(충돌 방지)**: u7=`0011_*`·u8=`0012_*`·u11=`0013_*`(Wave5 prod=그 다음). 각 BE `/goal`에 배정 번호를 박아 같은 번호 충돌 ❌.
   - **u0b frozen 미접촉**·additive only(0001~0010 변경 ❌)·pglite로 검증(`node supabase/tests/_pgtap_pglite.mjs`)·RLS 누출 0·**커밋 금지**(PM 통합).
   - 통합 순서: BE 브랜치(additive·저충돌) **먼저 머지** → 그 위에서 해당 FE 단위가 브랜치(마이그 상속·RPC 소비). BE-only 머지는 supabase/만 건드리므로 FE 워크트리와 충돌 없음.
   - WIP 감각: FE 1 + BE 1~2 동시 OK(서로 다른 blast radius). 모니터링은 PM이 비차단으로.
11. **★ 커밋 & 원격 백업 + main 머지 규율 (자동화 손실 방지·사용자 지시)**: **의미있는 진전마다 커밋한다.** ① FE Workflow·BE 헤드리스가 **완료될 때마다 PM이 즉시 워크트리 커밋**(체크포인트 — 미커밋 working tree로 방치 ❌·큰 미커밋 덩어리 ❌). ② 단위 통합 후 integration 커밋. ③ **각 단위 머지 직후 `git push origin sprint/0-integration`**(원격 백업·디스크 손상 대비). ④ **★ 각 단위가 마무리·검증 green·정리되면 `sprint/0-integration → main` 머지 + `git push origin main`(사용자 지시 2026-06-16)** — 단위별로 main을 verified integration에 맞춰 전진. force ❌·.env ❌·배포 트리거 ❌(사용자 게이트). main 머지 실패/충돌 시 보류 + 로그(integration은 유지). ⑤ 각 Wave 완료 시 안정 태그(`git tag waveN-stable && git push origin waveN-stable`). 복구는 `git reset --hard <태그/커밋>`. **현재 안정 복구 지점 = 태그 `wave1-stable`(86f0f38) = origin 백업됨.** ⑥ **main 머지/push는 overnight-log §9에 단위별 기록**(커밋해시·push 여부).

---

## 2. Wave 순서 · 의존성 (WIP 상한 2 — Wave 완료 후 다음)
| Wave | 단위 | 의존 | 핵심 |
|---|---|---|---|
| **2** | **u2**-home-feed · **u4**-content-detail | u0c·u0b(머지됨) · u4=히트맵/sanitized RPC | u2=취향관/피드(AI패널 제거)·카드→u4 라우팅 / u4=뷰어+히트맵+소셜(annotations 옵션1) |
| **3** | **u7**-library · **u8**-search | u4(상세탭 재사용)·u0b | u7=폴더·folders 마이그 / u8=한국어 FTS RPC |
| **4** | **u6**-chrome-extension · **u11**-settings-account | u0b ingest·u0c | u6=MV3 WXT(무거움→서브-spec) / u11=설정·수신함(디자인 공백 채움) |
| **5** | **프로덕션화**(u-wire-prod 단계) | 전 단위 머지 후 | 목킹 제거·실제 Supabase 배선·e2e 통합·배포 설정·셋업 가이드(§11). 무인 코드 완비 → 사용자 배선 큐 |

> 각 단위 spec = `docs/units/<slug>/spec.md`(정본, 매 턴 reload). owner=both. 동일 Wave 2단위는 병렬 가능하나 **통합(머지)은 순차**(충돌 최소화 — 한 단위 머지·검증 green 후 다음).

---

## 3. 단위 실행 레시피 (각 단위 반복)
1. **PM 계획**: 이슈 생성(`gh issue create` type:feature·priority:P1/P2 — **Wave당 최대 2개**, 차단 시 §R5) + 보드 `#2` 등록 + 워크트리(`git worktree add .claude/worktrees/<slug> -b feat/<slug> sprint/0-integration`).
2. **BE 착수**(BE 작업 있는 단위 u4·u7·u8·u11): 헤드리스 `claude -p --permission-mode acceptEdits --model claude-opus-4-8 --effort max "/goal --tokens 250000 <spec BE Acceptance 조건>"`. supabase **additive만**(0011~)·pgTAP·u0b frozen 미접촉·pglite로 검증(`node supabase/tests/_pgtap_pglite.mjs`)·**커밋 금지**(PM 통합).
3. **FE 착수**: `Workflow`(측정→구현→검증). 카디널 룰·u0c 재사용·FSD·TanStack Query(데이터=목킹 가능, BE 계약 시그니처대로). **status.md 미접촉**(BE와 충돌 방지)·**커밋 금지**.
4. **검증**(§4 게이트 전부).
5. **통합**: 워크트리 커밋(FE+BE) → `git merge --no-ff feat/<slug>` → **충돌 해결(§5)** → `pnpm install` → 재검증 green → `git push origin sprint/0-integration`(백업).
6. **충실도 = FE 검증 단계에서 완료(별도 design-review ❌ — 사용자 지시 2026-06-16)**: FE Workflow의 verify 에이전트가 측정 .md/.png 대비 픽셀 1:1을 자체 검증·수정해 그 단에서 마무리. PM은 사후 design-review를 돌리지 않는다(게이트 ⓒ=아침 사용자 사인오프만 남김).
7. **★ main 머지(사용자 지시)**: 단위 검증 green·정리 완료 시 `git checkout main && git merge --no-ff sprint/0-integration` → green 재확인 → `git push origin main` → `git checkout sprint/0-integration`. force ❌·.env ❌·배포 ❌. 충돌/실패 시 보류+로그.
8. **기록**: `command-center.md` §4 + `docs/units/<slug>/status.md`(green) + `state/overnight-log.md`(§9 — integration·main 커밋해시·push 여부).
9. **워크트리 정리**: 머지 완료 단위 워크트리 `git worktree remove`.

> **BE 병렬(§1.10)**: 위 레시피가 FE 단위에 도는 동안, PM은 다가올 BE-bearing 단위의 additive 마이그를 별도 `feat/<slug>-be` 워크트리에서 헤드리스 `/goal`로 병렬 진행한다. BE 레시피 = 이슈(선택)→worktree+install→헤드리스 `/goal`(supabase/ additive·pgTAP·번호 사전배정)→pglite 검증→PM 머지(supabase/만, FE와 충돌 0)→기록.

---

## 4. 검증 게이트 (단위 done의 필수조건 — 전부 0/PASS)
- `pnpm -C apps/web exec tsc -b --force` = 0
- `pnpm -C apps/web exec eslint .` = 0
- `pnpm exec steiger ./apps/web/src` = ✔ (lint:fsd)
- `pnpm -C apps/web build` = 성공
- (BE) `node supabase/tests/_pgtap_pglite.mjs` = 0 not-ok · `_pglite_proof.mjs` 무회귀
- (BE) **RLS 누출 0**: `derived-api-no-leak`·`rls-isolation` 류 pgTAP PASS (cross-user/실명/user_id 미노출)
- (FE) **충실도 = FE verify 단계 자체검증으로 대체**(별도 design-review ❌ — 사용자 지시): 측정 .md/.png 대비 프레임 1:1을 FE Workflow verify가 확인·수정. 디자인 공백=파운데이션 일관.
- 콘솔 에러 0
> 하나라도 실패 → 수정 루프. **3회 연속 실패 = 단위 스킵 + overnight-log 기록 + 다음 단위.**

---

## 5. 통합 충돌 해결 가이드 (u1·u3 통합에서 학습 — 무인 적용)
충돌은 대부분 **여러 단위가 같은 인프라 파일을 각자 생성**해서 발생. 파일별 규칙:
- **`app/app.tsx`(라우트)**: 양쪽 라우트를 **union 병합**(한쪽 routes 삭제 ❌). 가드/래퍼는 더 엄격한 쪽(u1 RequireOnboarded 등) 유지.
- **`pages/home/*`**: **병합**(각 단위 기여 합침 — 예: 클립 플로우 + 확장모달). module.css는 실제 쓰는 클래스 쪽.
- **`shared/api/index.ts`·`supabase.ts`**: **export union**(supabase const + getSupabaseClient 등 둘 다 유지). env는 `@/shared/config` 패턴 우선.
- **`test/setup.ts`·`steiger.config.*`·`package.json`(deps)**: **union 병합**(둘 다 필요).
- **`pnpm-lock.yaml`**: `git checkout --ours pnpm-lock.yaml` → `pnpm install`로 재생성.
- 단순/동일 변경: `git checkout --ours`(integration 우선) 또는 `--theirs`(단위 신규).
- **해결 후 반드시 `grep -rn '^<<<<<<<' apps/web/src`로 잔존 마커 0 확인 + §4 재검증.**
- **3회 시도 후 해결 불가 = 머지 abort(`git merge --abort`) + 단위 스킵 + overnight-log 기록.**

---

## 6. 결정점 사전 확정표 (무인 기본값 — spec ESCALATION 일괄 / 전부 reversible)
> 새 충돌·결정이 나오면: **이 표에 있으면 그대로** · 없으면 **보수적·가역 기본값 + 로그 후 계속** · **비가역이면 보류**(§1.6).

| 단위 | 결정 | 무인 기본값 |
|---|---|---|
| **u2** | 추천/트렌드 데이터 | u0b 신규 RPC ❌ → **콜드스타트 폴백/시드 인터페이스**(ADR-0002 #7)로 화면 채움. 비회원 홈=온보딩 리다이렉트. 우측 추천레일=포함. **GNB '수신함' 탭=u11 전까지 비활성/준비중**(죽은 링크 방지) |
| **u4** | annotations(댓글/답글) | **옵션1**: 인사이트=공개클립(u0b `content_clips_public`)만 BE 배선. 댓글/답글·작성·좋아요=**UI 픽셀퍼펙트 + 데이터 목킹/비활성**. annotations 엔티티·실명노출=**ADR-0003 신규 단위로 보류**(BE 신규 ❌). 비슷한콘텐츠=폴백 |
| **u7** | folder 부착 | **folder=클립 부착**(`clips.folder_id`, additive 마이그). 북마크 탭=UI+빈상태(데이터 보류). 다중선택=u0c card(selected)+액션바+modal. 폴더 삭제=folder_id NULL(클립 보존) |
| **u8** | 검색 | **한국어 FTS RPC additive**(ADR-0002 #10·제목/메모/태그·본인 행만·누출0). 정렬·자동완성·최근검색어(10)=파운데이션 채움. 추천=비-AI 시드 |
| **u6** | MV3 | WXT·content(Shadow DOM)·popup(최소셸)·background. 웹세션 bearer→chrome.storage→401 재로그인. 메모 nullable(구간만 저장 허용). **무거우면 폴더 내 서브-spec 분할**(새 티켓 ❌). 영상전용 |
| **u11** | 설정/계정 | 계정메뉴=팝오버+설정 단일페이지(앵커 섹션). soft-delete=`deleted_at` additive+복구배너. 표시이름=수정가능(빈/공백 차단). 알림=설정 저장만(발송 인프라 후속). 구독관리 ❌ |
| 공통 | 인증 | Google+Kakao만(Naver/이메일 컷). dev=mock 세션(`grabit.mock.session`·`grabit.mock.onboarding`) |
| 공통 | 반응형 | **데스크톱 1:1만**(모바일 Figma 부재). 반응형 위생(max-width·flex)만. 반응형 구현=별도 Wave 보류 |

---

## 7. 중단 조건 (safety rails — 멈추고 overnight-log에 기록)
**★ 대원칙(§1.8): 전체 정지는 "예산 소진"(아래 5)뿐이다. 그 외는 전부 "해당 항목/단위만 큐 격리 + 다음 계속".** 아래는 *그 항목을 멈추고 큐에 적재*하는 트리거일 뿐, 루프 자체를 멈추는 게 아니다:
1. 단위 검증 **3회 연속 실패**(§4) → 단위 스킵 + 다음.
2. **보안 Critical/High** 발견(시크릿 노출·RLS 누출·인젝션) → 정지 + 로그(이건 안티-증식 예외로 보안 이슈 생성 가능).
3. **비가역 결정 필요**(데이터 손실·스코프 변경·실명 노출·frozen 변경·ADR 개정) → 해당 부분 보류 + 로그.
4. **분류기/권한 차단**(외부 작업) → 그 작업 스킵 + 대체(spec/status 추적) + 로그.
5. **예산 소진**(단위 캡 또는 전체 캡) → 정지.
6. **통합 충돌 3회 해결 불가** → 단위 스킵.
> 정지 ≠ 실패. 명확한 로그 = 아침에 사용자가 5분 안에 이어받을 수 있게 하는 것이 목적.

---

## 8. 예산 · 페이스
- 단위별 토큰 캡(가이드): FE Workflow ~800k · BE 헤드리스 ~250k · design-review ~100k.
- 전체 캡: 사용자 지정(인수인계 프롬프트의 `--tokens` 또는 무지정 시 단위 캡 합산으로 자기 조절).
- 한 단위 done까지 루프하되 §7-1(3회 실패) 도달 시 스킵. 무한 루프 금지.

---

## 9. 상태 · 아침 리뷰 큐 (`state/overnight-log.md` — 새로 생성·매 단위 append)
각 단위 완료/스킵 시 한 블록 append:
```
## <slug> — <완료|스킵|보류> (HH:MM)
- 검증: tsc/lint/fsd/build <결과> · pgTAP <N/0> · 충실도(FE verify 자체검증) <PASS/대상프레임>
- integration 머지: <커밋해시 or 미머지(사유)> · push origin sprint/0-integration <O/X>
- main 머지: <커밋해시 or 미머지(사유)> · push origin main <O/X>  ← 사용자 지시(검증 green 단위)
- 게이트 ⓒ: ★사용자 사인오프 대기 (라우트/스크린샷: <경로>)
- 결정 로그: <기본값으로 진행한 결정 + 근거>
- ESCALATION: <보류한 비가역 결정·중단 사유 — 사용자 결정 필요> 또는 (없음)
- 다음: <다음 단위>
```
> **게이트 ⓒ는 무인이라 design-review로 대체했을 뿐, 최종 사인오프는 사용자 몫** — 모든 완료 단위를 "사인오프 대기"로 큐에 쌓아 아침에 일괄 검수받는다. 그 전까지 push ❌(로컬 integration 머지까지만).

---

## 10. 시작 시 헬스체크 (새 세션 PM 첫 턴) + ★ Auto Compact 복구 프로토콜 (사용자 지시 2026-06-16)
- `state/command-center.md` + 이 런북 + `state/decisions.md` + `docs/design/README.md` reload.
- gstack·gh auth·claude≥2.1.80·**MCP(figma·manyfast) `claude mcp list` ✔**(없으면 세션 재시작 — MCP는 새 세션에서 잡힘).
- `git worktree list`·통합 트리 green(`pnpm -C apps/web exec tsc -b` 등) 확인.
- u0c 워크트리(`feat/u0c-fidelity`)는 머지 완료 → `git worktree remove` 가능.

### ★★ Auto Compact / 컨텍스트 요약 직후 복구 (무조건 수행 — 진행상황 잃지 말 것)
> **대전제: 진행상황의 정본은 내 컨텍스트가 아니라 *파일·git·프로세스 상태*다.** 컨텍스트가 차서 Auto Compact(요약)가 일어나면 in-flight 디테일(워크플로 ID·워크트리·머지 여부·다음 단계)이 흐려질 수 있다. 요약 후 첫 턴 또는 상태가 조금이라도 불확실하면 **행동 전에 반드시** 아래로 실제 상태를 재구성한다(기억으로 추측 ❌):
> 1. **SoT 재독**: `state/overnight-log.md`(라이브 진행 원장 — §9) + `state/command-center.md` §4 + 이 런북 + `state/decisions.md`.
> 2. **라이브 상태 재구성**(명령으로 사실 확인):
>    - `git worktree list` — 어떤 단위 워크트리가 살아있나.
>    - `git -C <worktree> status --short` + `git -C <worktree> log --oneline -5` — 각 워크트리 미커밋/커밋 상태.
>    - `git log --oneline -20 sprint/0-integration` — 무엇이 이미 머지됐나(단위 머지 커밋 확인).
>    - `git tag` — 안정 태그(waveN-stable) 위치.
>    - `/workflows`(또는 워크플로 transcript dir) — **실행 중/완료된 FE 워크플로 ID·단계**.
>    - 백그라운드 헤드리스 `/goal` 프로세스 생존 확인(BashOutput/프로세스 목록) — BE 작업 진행도.
>    - `gh issue list` — 발급된 단위 이슈.
>    - 활성 단위의 `docs/units/<slug>/status.md` — 워커가 남긴 진행/검증 결과.
> 3. **대조·확정**: 위 사실로 "done / in-flight / 큐" 단위를 *파일·git 기준*으로 확정 → overnight-log의 IN-FLIGHT 원장과 일치시킨다(불일치 시 원장 갱신). 그 다음에만 진행.
> 4. 워크플로/프로세스가 죽어있으면 마지막 커밋/캐시에서 resume(`Workflow {scriptPath, resumeFromRunId}` = 미변경 prefix 캐시 히트) 또는 재스폰.

### ★ 라이브 진행 원장 의무 (overnight-log.md = 컴팩트 생존용)
- overnight-log.md에 **`## IN-FLIGHT (라이브)` 섹션**을 항상 최신으로 유지: 실행 중인 모든 FE 워크플로(ID·런ID·워크트리·단계)·헤드리스 BE 프로세스(단위·워크트리·마이그번호)·다음 액션 1개를 적는다.
- 단위 완료뿐 아니라 **모든 의미있는 체크포인트**(워크플로 런치·완료·BE 런치·머지·게이트 결과)마다 즉시 append/갱신 → 중간에 컴팩트돼도 파일만 읽으면 정확히 이어받는다.

---

## 11. Wave5 — 프로덕션화 & 사용자 배선 큐 (구동 가능 프로덕트의 마지막 1마일)
전 단위(u2~u11) 머지·검증 후 PM이 프로덕션화 단계(`docs/units/u-wire-prod/` 또는 통합 작업)를 진행한다.

### 11-1. 무인이 끝까지 완료할 것 (코드·설정·검증 — 사용자 개입 불필요)
- **목킹 → 실제 배선**: features가 Supabase RPC를 *우선* 호출(env 있으면 실경로, 없으면 목 폴백 유지 — `isSupabaseReady` 분기). 데모/mock은 제거가 아니라 *폴백*으로 둬 키 없이도 화면은 뜨게.
- **e2e 통합 테스트**(Playwright): 로그인→온보딩→홈→클립 추가→라이브러리→검색 end-to-end. OAuth·외부 fetch는 목킹(결정론). cross-user 누출 0 재확인.
- **배포 설정(코드만)**: `apps/web` 프로덕션 빌드 검증 · `.env.example`(키 placeholder — 실값 ❌) · Cloudflare Pages 설정(ADR-0001) · Supabase 마이그 배포 순서 스크립트(0001~ idempotent 확인) · **R6: 범용 `ci.yml`을 pnpm + 실제 스크립트로 갱신**(tsc/lint/lint:fsd/build/pgTAP CI 게이트).
- **셋업 가이드 작성**: `docs/SETUP.md` — 아래 11-2를 사용자가 그대로 따라 할 수 있는 단계별 명령/스크린샷 위치.
- **검증**: 위 전부 §4 게이트 통과 + 통합 트리 green.

### 11-2. 사용자 배선 큐 (아침 1회 ~10분 — `overnight-log.md` + `docs/SETUP.md`에 단계별 명시)
> ★ 무인이 **절대 추측 실행 ❌**(키 위조·임의 프로젝트·임의 배포 금지). 코드·가이드만 완비하고 큐로 넘긴다.
1. **Supabase 클라우드 프로젝트** 생성 → Project URL · anon key 확보.
2. **마이그 적용**: `supabase db push`(0001~ 순서) 또는 대시보드 SQL.
3. **OAuth 앱 등록**: Google + Kakao 콘솔에서 client id/secret → Supabase Auth Providers + 콜백 URL 등록.
4. **환경변수**: `.env`(로컬) 또는 Cloudflare Pages 환경변수에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`.
5. **배포**: Cloudflare Pages 연결 + 배포(또는 `pnpm -C apps/web build` 산출물 배포).
6. **스모크 테스트**: 배포 URL에서 로그인→클립→라이브러리 확인.

> 이 단계까지 오면 결과물 = **"키만 꽂으면 즉시 구동되는 사용가능 프로덕트"** + 10분 셋업 가이드. 무인의 정직한 최대치.

---

## 12. ★ Watchdog — 15분 무응답 점검·재가동 (사용자 지시 2026-06-16)
> **목적**: 백그라운드 Workflow/프로세스가 멈춰(hang·죽음·알림 누락) 루프가 정지하는 걸 방지. PM은 백그라운드 작업을 띄운 뒤 **매 턴 끝에 ScheduleWakeup(900초=15분)으로 watchdog를 재예약**한다. 완료 알림이 오면 그게 더 빨리 깨우고(그때 처리 후 watchdog 재예약), 아무 알림 없이 15분이 지나면 watchdog가 깨워 아래를 수행:

1. **진행상태 점검(기억 추측 ❌·실제 확인)**: `/workflows` 또는 각 워크플로 transcript dir의 agent jsonl **파일 mtime**(`ls -lt`)으로 최근 활동 확인 · `TaskOutput`/`Monitor`(ToolSearch로 로드)로 태스크 상태 · `git -C <worktree> status`로 산출물 변화 · overnight-log IN-FLIGHT 원장과 대조.
2. **판정**:
   - 진행 중(최근 mtime·agent 활동 있음) → 그대로 두고 watchdog 재예약(900초).
   - **멈춤/죽음**(mtime 정체 ≥ ~10분·태스크 종료인데 알림 없음·에러) → **resume**: `Workflow({scriptPath, resumeFromRunId})` — 미변경 prefix는 캐시 히트, 멈춘 지점부터 재실행. 스크립트 버그면 스크립트 파일 수정 후 resume.
   - 부분 산출물만 있고 워크플로 죽음 → 워크트리 산출물 검증(게이트) 후 살릴 수 있으면 PM이 직접 마무리, 아니면 재스폰.
   - 3회 재가동 실패 단위 → 스킵 + overnight-log 기록(§7-1).
3. **워크플로 ID·스크립트 경로는 overnight-log IN-FLIGHT에 항상 기록**(watchdog가 resume에 쓸 scriptPath/runId).
> watchdog 틱마다: 완료된 워크플로 통합 → 다음 단위 스폰 → 살아있는 것 확인 → **watchdog 재예약**. 모든 단위 done 또는 예산소진까지 이 사이클 반복(자기 페이싱 루프).

### 현재 IN-FLIGHT 워크플로 (watchdog 대상 — overnight-log와 동기)
| 단위 | Task ID | runId | scriptPath(요약) | blast |
|---|---|---|---|---|
| u7-library FE | `w1vgklj0x` | `wf_4a8ed391-0d8` | u7-library-fe-wf_4a8ed391-0d8.js | apps/web/src |
> scriptPath 전체경로 = `~/.claude/projects/-Users-suho-Desktop-Grabit/40f752a1-8491-40c1-9093-23638dbcb022/workflows/scripts/<위 파일>`. resume 시 사용.
> ⚠ u7 머지 시 u8의 app.tsx(/search)·entities/content·shared/api 변경과 §5 union(grep 마커0).
> **완료(통합됨)**: u2·u4·u6·**u8**→main `b9b49a2` · BE u7/u8/u11→main(포함).
> **남은 단위**: u7 FE(진행중)·u11 FE · Wave5 프로덕션화(ci.yml·.env.example·e2e·docs/SETUP.md·목킹→실배선 폴백).
