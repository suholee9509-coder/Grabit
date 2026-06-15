# Grabit Sprint Command Center

> PM의 **단일 SoT(영속 메모리)**. PM이 매 오케스트레이션 루프에서 읽고 갱신한다.
> (정적 규칙은 `config/`, 누적 아키텍처 결정은 `state/decisions.md`.)

## 0. Product North Star
**크롬 확장 기반 성장 콘텐츠(영상·아티클) 클리핑·큐레이션 서비스.** 외부 성장 콘텐츠를 *구간/영역 단위*로 즉시 클리핑하고, **AI 요약·태그·통계·소셜 애노테이션(집단지성)·또래 트렌드**로 '무엇을 봐야 하나'의 막막함과 FOMO를 줄여 *콘텐츠 소비 → 기록 → 복습 → 성장 체감*으로 연결한다. 타겟: 성장/커리어 콘텐츠를 소비하지만 정리·복습이 어려운 취준생~10년차(PM·디자이너·개발자·마케터).
> 기획 SoT: `docs/source/`(기능명세서·유저플로우 + manyfast) · 디자인 SoT: Figma(`docs/design/`).

## 1. Active Sprint
- Sprint: **0 — 파운데이션 완료.** ✅ 게이트 ⓐ + ADR-0001/0002 + 스캐폴드 + ✅ **u0 디자인시스템**(`9924300` — 실화면 픽셀측정·#66FF4B·흰색#FAFAFA·토글28, tsc/lint green, `/ui-preview` 사인오프) + ✅ **u0b 데이터코어**(`3225bc0` — 마이그9·pgTAP6·ingest, ADR-0002 10항목 락, pglite 38/0 + RLS 설계리뷰 PASS, **정본=CI** `u0b-canonical-tests.yml` push시 게이트). **▶ 다음 = 화면 단위(u1·u2·u3·u4·u6·u7·u8·u11) spec 역설계 → 게이트 ⓑ(sprint-kickoff).** u0b 결정점 3개(§6) 확인.
- 워크트리: `.claude/worktrees/u0-design-system`(feat/u0-design-system) · `.claude/worktrees/u0b-data-core`(feat/u0b-data-core) ← sprint/0-integration(`313c9b4`).
- 목표(S0): Figma 프레임 인벤토리(`docs/design/`) · 제품 스펙 역설계 · 스택/데이터 ADR · FSD 스캐폴딩 · 디자인 토큰 추출(§5). (코드 기능 단위 없음)
- Milestone: _(미생성 — sprint-kickoff 시)_
- 통합브랜치: `sprint/0-integration` _(미생성)_
- 모드: Sprint 1 = 모드 2(트레이닝휠 — 각 dev 스폰 전 사용자 승인) → 이후 모드 1

## 2. Validated Spec / PRD (역설계 — ✅ Figma 40프레임/10플로우 판독 완료 2026-06-15)
> 상태: **역설계 완료·게이트 ⓐ 대기.** Figma "프로토타이핑"(`2087:5987`) 10개 플로우 SECTION을 병렬 렌더 판독 → 프레임 인벤토리 작성(`docs/design/README.md`) + manyfast 기획 원문 흡수. 다음 = **게이트 ⓐ(wedge·디자인공백 결정)** → 확정 후 유닛별 spec 역설계 → ADR → 스캐폴딩.
- **디자인 SoT('무엇')**: Figma `5GGyKsjXEOpjKMLtUodeSs` · 페이지 "프로토타이핑" `2087:5987`(proto start `2074:86591`) · 토큰 SoT "디자인 시스템" `668:29` · **인벤토리: `docs/design/README.md`**
- **기획 SoT('왜·스코프·데이터규칙')**: `docs/source/{기능명세서,유저플로우}.md` + manyfast(project `24744127-…`, 5 Req/15 Feat/27 Spec, Key Function 1~6) · 포트폴리오(Notion)

### ★ Figma 역설계 핵심 발견 (PRD와 차이 — 충돌 시 무엇=Figma)
1. **AI = 멀티모델 대화형 "Grabit Assistant" 패널**(홈+콘텐츠상세 공용, GPT/Claude, Pro 게이팅) — PRD의 "3단계 요약"보다 훨씬 큼. 3단계요약은 라이브러리 'AI 노트'로 흡수.
2. **클리핑 2경로**: ① 인앱 URL 모달(콘텐츠 추가) ② 크롬 확장(MV3). PRD는 확장 중심.
3. **영상만 디자인됨** — 아티클(DOM 영역/1000자/하이라이트 오버레이)은 전 섹션 디자인 공백.
4. **빈/로딩/에러 상태 거의 전무** + 설정/계정·구독관리·알림·연간플랜·페이월모달·아티클 = **디자인 공백**(레지스터 §6 / `docs/design/README.md`).

### In scope (Figma 프레임으로 확정된 것)
온보딩(소셜로그인+프로필4단계+요금제/확장 모달) · 홈(취향관/피드 + Assistant) · 인앱 클립 모달 · 콘텐츠 상세(뷰어+히트맵+소셜애노테이션+탭) · AI 어시스턴트(멀티모델·페이월) · 크롬확장(설치~클립) · 라이브러리(리스트+폴더+상세탭) · 검색(디폴트/결과/빈) · 대시보드(통계+또래+Pro팝업) · 결제(카드폼+완료).

### Out of scope / 디자인 공백 (게이트 ⓐ 결정 대상 — §6)
빈/로딩/에러 상태 · 설정·프로필수정·탈퇴(30일) · 구독관리/취소/영수증목록/연간플랜 · 알림/수신함 · 아티클 클리핑·하이라이트 · Pro 업그레이드 모달 · 주간리포트(Pro) · Naver/Kakao/이메일 인증화면 · MV3 popup UI.

## 3. Feature Work-Units (Figma 구조에서 절단 — 11 단위. spec 작성 = wedge 확정 후)
> 안티-증식: 1 story ≈ 1 unit, 수직 슬라이스, 한 소유자 end-to-end(FE+BE=한 유닛·두 소유자), 한 워크트리 세션. 무거운 유닛(u5·u6)=폴더 내 서브-spec(새 티켓 ❌). 절단 기준 = Figma 화면/플로우(기능 목록 ❌).

> ★ **게이트 ⓐ 확정 스코프(2026-06-15)**: AI 전면 제외 · 대시보드 제외(+GNB 대시보드 탭 제거) · 구독/결제·아티클클리핑·연간플랜 제외. **디자인시스템(u0) 풀 추출 먼저** → 그 파운데이션으로 *없는 UI/페이지(빈·로딩·에러·설정·계정·알림)를 채워* 구현. 영상 콘텐츠만.

| slug | story(L1 요지) | owner | 대상 프레임 | MVP | 비고 (게이트 ⓐ 반영) |
|---|---|---|---|---|---|
| **u0**-design-system | 토큰·모든 스타일(그림자 등)·컴포넌트를 Figma에서 추출·시스템화 + 앱 셸(좌 GNB[대시보드 탭 ❌]·톱바) | frontend | `668:29`+컴포넌트 `2562:7927` | ✅ **선행(Lane A)** | **하이브리드**: ① 디자이너 에이전트 추출+1차(BG) → ② 사용자 워크트리 충실도 마감+게이트 ⓒ. (화면 단위는 기본=사용자 운전) |
| **u0b**-data-core | URL 정준화→content dedup→클립 구간 insert→**RLS-safe 익명 히트맵(view/RPC)**→확장 ingest contract 증명 | backend | (Supabase 스키마/RLS) | ✅ **선행(Lane B)** | **ADR-0002 락**. 헤드리스 `/goal` opus4.8 max. u3·u4·u7·u8·u6의 데이터 의존. u0와 **병렬** |
| **u1**-auth-onboarding | 소셜 로그인 → 프로필4단계 → 홈 진입(+확장설치 모달) | both | 온보딩 8프레임(요금제 모달 ❌) | ✅ | 고위험(인증). **요금제 모달 제외**. Naver/Kakao/이메일·에러=공백→파운데이션으로 채움 |
| **u2**-home-feed | 취향관/피드 탭으로 또래 트렌드·추천 콘텐츠를 발견 | both | 홈 5프레임(AI 패널 ❌) | ✅ | **AI 어시스턴트 패널 제거**. 빈/로딩/에러=채움. 중복 사본 정리 |
| **u3**-clip-webapp | 인앱에서 URL 붙여 영상 구간 트림+메모+폴더+태그로 클립 저장 | both | 콘텐츠추가 5프레임 | ✅ | 영상만. **AI 요약 자리 제거**. URL검증/완료=채움 |
| **u4**-content-detail | 콘텐츠를 뷰어+히트맵+소셜애노테이션+탭으로 깊게 소비 | both | 상세 3프레임(+라이브러리 상세탭) | ✅ | **AI 패널 제거**. 영상만(아티클 ❌). 빈상태=채움 |
| ~~u5~~-ai-assistant | (멀티모델 AI 대화) | — | — | ❌ **제외** | 게이트 ⓐ — AI 전면 제외 |
| **u6**-chrome-extension | 크롬 확장으로 영상 시청 중 즉시 구간 클립+메모를 서버 전송 | both | 확장 7프레임 | ✅ | **무거움(MV3)→서브-spec**. 영상만. popup UI=채움 |
| **u7**-library | 클립한 콘텐츠를 폴더·검색·정렬로 관리하고 상세(컨텐츠/인사이트)로 재소비 | both | 라이브러리 9프레임 | ✅ | 상세탭=u4 재사용. **AI 노트 탭 제거**. 빈/폴더CRUD모달=채움 |
| **u8**-search | 제목/메모/태그로 통합 검색(디폴트 발견/결과/빈) | both | 검색 3프레임 | ✅ | 최근검색어/자동완성/날짜·태그필터=채움 |
| ~~u9~~-dashboard | (통계+또래비교) | — | — | ❌ **제외** | 게이트 ⓐ — 대시보드+차트+GNB 탭 제외 |
| ~~u10~~-payment-subscription | (Pro 결제·구독) | — | — | ❌ **제외** | 게이트 ⓐ — 구독/결제·연간 제외(Pro 가치 부재) |
| **u11**-settings-account | 프로필 조회·수정, 로그아웃, 탈퇴(30일), 알림/수신함 설정 | both | (프레임 없음 — 파운데이션으로 채움) | ✅ | **디자인 공백 채움 단위**. 구독관리 ❌. 토큰·컴포넌트 일관 |

> **MVP = u0·u0b·u1·u2·u3·u4·u6·u7·u8·u11** · 제외 = u5(AI)·u9(대시보드)·u10(결제/구독). 선행 파운데이션 = **u0(FE 디자인시스템)+u0b(BE 데이터코어) 병렬**(Lane A·B). 이슈/보드 = sprint-kickoff(게이트 ⓑ). 보드 = Grabit(#2). 스택 = **ADR-0001 락**(`state/decisions.md`), 데이터모델/RLS = ADR-0002(u0b가 락).

## 4. Decisions This Sprint
> 스프린트 중 라이브 추가 (date · who · what · why). 아키텍처 결정은 `state/decisions.md`(ADR)에도.
- 2026-06-15 · 사용자/PM · **에이전트 오케스트레이션 시스템 이식 완료** (PM 중심 5-에이전트 + `/goal` + 안티-증식 작업단위 계약).
- 2026-06-15 · 사용자 · **워크플로우 = UI 역설계(디자인-퍼스트)**. UI가 Figma에 픽스(90%+). frontend는 디자인 생성 ❌ → Figma MCP로 프레임 연동해 **픽셀-퍼펙트 퍼블리싱**. PM은 Figma에서 스펙 역설계. SoT: *무엇=Figma, 왜·스코프=기획문서*. 게이트 ⓒ = 충실도 사인오프.
- 2026-06-15 · 사용자 · **실행모드 = 역할 고정**: UI/frontend = **인터랙티브 워크트리(사용자 직접 운전)**, backend/qa/security = **백그라운드**. ★ 백그라운드 에이전트 모델 = `claude-opus-4-8` + `--effort max`(Ultra Code 제외 최상위).
- 2026-06-15 · 사용자 · **리소스 수령**: 기획문서 2개(`docs/source/{기능명세서,유저플로우}.md`) · Figma 링크(프로토타입+페이지, key `5GGyKsjXEOpjKMLtUodeSs`) · 포트폴리오(Notion).
- 2026-06-15 · PM · **✅ MCP 연결 완료(user 스코프)**: `figma`(Framelink `figma-developer-mcp` + PAT, `~/.claude.json`·레포 커밋 ❌) · `manyfast`(HTTP `https://api.manyfast.io/mcp`). `claude mcp list` ✔✔.
- 2026-06-15 · PM · **✅ Figma 역설계 완료**: "프로토타이핑" `2087:5987` 10플로우/40프레임을 병렬 워크플로(10 에이전트·렌더 판독) → 프레임 인벤토리(`docs/design/README.md`) + 유닛 11개 절단(§3) + 디자인공백 레지스터(§6).
- 2026-06-15 · **사용자(게이트 ⓐ)** · **MVP 스코프 확정**: ❌AI 전면 · ❌대시보드(+GNB 탭) · ❌구독/결제·아티클클리핑·연간플랜. ✅u0 디자인시스템 풀 추출(토큰·effect·컴포넌트) 먼저 → 파운데이션으로 없는 UI/페이지(빈·로딩·에러·설정·계정·알림) 채움.
- 2026-06-15 · PM(`/plan-eng-review` + Codex) · **✅ ADR-0001 스택 락**: pnpm 모노레포·**웹 우선 린 스타트**·React+Vite+TS+FSD(경량)·CSS변수+Modules·**WXT**(MV3)·**Supabase**(Postgres+RLS+Edge,view/RPC 우선)·OAuth **Google+Kakao**(Naver 후순위)·TanStack Query(+zustand 보류)·oEmbed 우선. 호스팅 = 인증 전 택1(Cloudflare/Vercel).
- 2026-06-15 · **사용자(텐션 T1)** · **시퀀싱 = 병렬(A안)**: Codex가 짚은 코어 리스크(소셜애노테이션 vs RLS·dedup·히트맵·콜드스타트)를 **u0b 데이터-코어 스파이크(헤드리스)** 로 조기 락 + **u0 디자인시스템(인터랙티브)** 병렬. ADR-0002(데이터모델/RLS)는 u0b가 락.
- 2026-06-15 · **사용자(u0 모드)** · **u0 = 하이브리드**: 백그라운드 디자이너 에이전트가 Figma 추출+1차(phase①) → 사용자가 워크트리에서 픽셀-퍼펙트 마감+게이트 ⓒ(phase②). 화면 단위(u1~)는 기본=사용자 운전.
- 2026-06-15 · PM · **스캐폴드(`d04d356`) + 병렬 스폰**: pnpm 모노레포·apps/web(Vite·React·TS·FSD steiger lint:fsd)·supabase init — all green. 호스팅=Cloudflare Pages. 워크트리 2개 생성 → **Lane A 디자이너 에이전트(BG) + Lane B u0b 헤드리스(`acceptEdits`·opus4.8 max·7턴 캡=관찰)**. (skip-permissions는 분류기 차단 → acceptEdits.)
- 2026-06-15 · PM+사용자 · **✅ u0 디자인시스템 완료**(`9924300`, feat/u0-design-system): 디자이너 에이전트 Figma `668:29` 추출 → 정밀 리팩토링 워크플로(실화면 픽셀측정 5병렬 + 프론트 에이전트) → 사용자 사인오프. 핵심: #00623A→#66FF4B 정정·흰색 #FAFAFA 통일·토글 28(탭정렬)·on-primary 2버전. tsc/lint/lint:fsd green, `/ui-preview` 라이브.
- 2026-06-15 · PM(관찰)+사용자 · **✅ u0b 데이터코어 완료**(`3225bc0`, feat/u0b-data-core): ADR-0002 10항목 락(정준키·[start,end)·**정의자뷰 단일우회 sanitized read**·익명 N=5·히트맵 RPC·프로필분리·folder부착·soft-delete). **RLS 설계리뷰 PASS** + pglite로 정본 .sql 6종 실행·전수통과(38/0, rls 버그1 수정). **정본 = CI**(`u0b-canonical-tests.yml`) — 로컬 Docker가 디스크97%로 wedge·재기동실패 → push 시 클린러너 게이트로 이관. 결정점 3개 → §6.
- 2026-06-15 · **사용자(게이트 FD1/2/3)** · **u0 충실도 결정 3건 확정**: FD1=**대시보드 탭 제거 유지**(GNB 4탭=홈·검색·라이브러리·수신함) · FD2=**토글 Figma 파랑 100% 채택**(ON #2563EB·track 44×22·knob18 흰+0.5px stroke+이중그림자) · FD3=**흰색 #FAFAFA 유지**. → u0 감사 반영(A) 착수.
- 2026-06-15 · **PM + 사용자 · ✅ 화면 8단위 spec 역설계 완료**(Workflow `wtpvyccum` 885k토큰/8에이전트 → `docs/units/{u1,u2,u3,u4,u6,u7,u8,u11}/spec.md`, Oliver 템플릿·게이트 ⓐ 스코프·ADR-0002 DM 의존·[fidelity]·디자인공백 표시). **핵심 결정 3건 확정**: ① **u1 인증=Google+Kakao만**(Naver/이메일 컷 → 픽셀충실도 '스코프 컷'=게이트 ⓒ 사인오프) ② **u4 annotations=옵션1**(인사이트=공개클립만 BE배선·댓글/답글=UI+목킹·`annotations`+replies+likes는 **ADR-0003 신규 단위**로 다음 스프린트 분리) ③ **수신함=u11 제공**(목록 빈상태+알림설정 → GNB 죽은링크 방지). 경량결정 다수 PM 기본값(spec 잠정값 reversible — §6).
- 2026-06-15 · **사용자/PM · ▶ 3-레인 병렬 가동(진행중)**: ① **FE u0c 감사반영**(워크트리 `feat/u0c-fidelity` — Workflow `w5ssx1e3x`: 측정→토큰→컴포넌트→앱셸→검증, FD1/2/3 반영). ★사용자 지시=FE는 **운전 안 함**·워크트리 핸드오프 X → 에이전트 자동완료 후 **시각 확인만**(ui-preview/스크린샷). ② **PM 전단위 spec 역설계**(Workflow `wtpvyccum`: u1·u2·u3·u4·u6·u7·u8·u11 → `docs/units/<slug>/spec.md`, Oliver 템플릿, 게이트 ⓐ 스코프·ADR-0002 DM). ③ **BE** = spec 1단위 확정 후 헤드리스 `/goal` opus4.8 max 투입(아직). 근거: 무엇=Figma 고정이라 UI구현·spec역설계 병렬 성립. 의존: u0c(파운데이션)가 화면 UI의 선행.
- 2026-06-16 · PM+사용자 · **✅ u0c 감사반영 완료 · 게이트 ⓒ 통과 · integration 머지(`4984172`)**: Workflow `w5ssx1e3x` 자동구현(측정→토큰→컴포넌트→앱셸→검증, 15에이전트/1.16M토큰) + 사용자 시각 컨펌. **34px 버튼·앱셸 widgets(sidebar FD1 4탭·topbar·app-shell)·toggle FD2 파랑·stepper·칩 변형·textarea·breadcrumb + 토큰 18종**(전부 측정 노드ID 주석). 추가수정: 최근 본 컨텐츠 박스 제거(reset.css button bg 누락)·**아이콘 lucide-react 교체**(사용자 요청). 통합 트리 tsc/lint/lint:fsd/build 0. **u0 파운데이션 완성 — 화면 단위 UI 준비됨.** 잔여 GAP(Toast surface·toggle OFF·default selected 등 실프레임 부재)는 후속 측정 시 반영.
- 2026-06-16 · PM+사용자 · **게이트 ⓑ Wave1 킥오프**: u1(#2)·u3(#3) 이슈 생성·보드 #2 등록(type:feature·priority:P1). 착수 방식=**FE Workflow 자동구현(시각확인) + BE 헤드리스 /goal 동시**(사용자 결정). 워크트리 `feat/u1-auth-onboarding`·`feat/u3-clip-webapp`. 나머지 6단위(u2·u4·u7·u8·u6·u11)=백로그(Wave 진입 시 생성 — 승인범위 준수). **Wave 계획**: 1=u1·u3 / 2=u2·u4 / 3=u7·u8 / 4=u6·u11. WIP 상한 2.

## 5. Design System (Figma 추출)
> **디자인 = 고정 Figma SoT** (`docs/design/README.md`). frontend가 **디자인-시스템 단위**에서 Figma MCP로 토큰을 추출 → `src/app/styles`. 보이스 시드: `config/brand_seed.md`.
- 토큰 정밀 추출 SoT = Figma 페이지 **"디자인 시스템" `668:29`** (+ 컴포넌트 SECTION `2562:7927`). 인벤토리: `docs/design/README.md`.
- 상태: **✅ 추출 완료** (u0 워크트리 `feat/u0-design-system` `9924300` → `apps/web/src/app/styles/tokens.css`). 정밀값은 거기 — integration 머지 시 이 섹션 동기화.
- 확정 토큰(실화면 측정): primary 그린 **`#66FF4B`**(CTA)·on-primary `#242424`/`#121212`·다크(배경 `#000`/카드 `#121212`/모달 `#1F1F1F`)·흰색 통일 `#FAFAFA`·Pro 보라 `#6D5DFF`. 사이즈: button 42/38(★+34 신설 예정)·input 42/search 48·**toggle track 44×22/knob18 ON#2563EB(FD2)**·radius sm6/lg12/pill100. 그림자 4(모달 3레이어·dropdown).
- 토큰 네임스페이스: `--color-*`·`--text-*`·`--space-*`·`--radius-*`·`--shadow-*` (CSS 변수). shared/ui 11종(button·chip·card·tabs·toggle·input·dropdown·modal·toast·avatar·badge). 보이스: config/brand_seed.md
- ⚠ **픽셀 충실도 감사 완료(2026-06-15, 전수 54프레임)** → **`docs/design/u0-fidelity-audit.md` (190 findings: HIGH48/MED66/LOW76)**. **u0 파운데이션 추가 작업 필요**(게이트 ⓒ 전):
  - **버튼**: ★`--size-button-md=34`(radius8) 신설 — 34px가 전 화면 정준 small(GNB·톱바·상세·검색). compact width 128 추가. 변형 누락(라이트솔리드 #EFEFEF·소셜솔리드다크 #242424). 네온 글자색 3종(#000000/#242424/#121212).
  - **앱 셸 미구현**(`widgets/` 비어있음): GNB(254/226px·item h32·active #242424)·톱바(h56)·프로필카드·브레드크럼 구축 필요.
  - **칩**: selected 채움색=#FAFAFA+#111111(실측). 사이즈 누락 h30/h28(.06채움·#CECECE). **탭**: underline active=#FAFAFA(네온 아님)·segment bg #1B1B1B/15px. **stepper**(온보딩 진행바 40×4) 미구현. **input** textarea변형(h64/h174·border solid #363636) 없음.
  - 토큰 갭: #1B1B1B·#CECECE·#434343·#000000·radius10·shadow-popover.

## 6. Escalations — 게이트 ⓐ ✅ 해소 (2026-06-15)
| # | 결정 | 결과 |
|---|---|---|
| D1 | MVP wedge + 클립 경로 | **AI·대시보드 제외, 나머지 전부 구현**(클립 2경로 u3+u6 모두). MVP = 9단위(§3) |
| D2 | AI 어시스턴트 범위 | **AI 후순위 — 전면 제외**(어시스턴트·AI요약·AI노트 모두) |
| D3 | 디자인 공백 처리 | **u0 디자인시스템/파운데이션 풀 추출 먼저 → 그 기반으로 없는 UI/페이지 채움**. 단 구독·아티클클리핑·연간플랜 제외 |
| D4 | **결제/Pro (PM 기본값 — 확인 요청)** | Pro 가치(AI·대시보드·리포트) 전부 제외됨 → **결제·요금제 모달·페이월 전면 제외, 무료 MVP**로 처리(u10·u1 요금제모달 컷). *다르면 알려주세요.* |

### 보조 확인(스펙 작성 시): 익명화 충돌(실명 동반) · 상황↔목표 매핑 확정 · 영상 전용(아티클 제외) 일관.

### u0b 데이터모델 결정점 (u0b가 제기 — 화면 단위 착수 시 확정. 전부 reversible)
| # | 항목 | u0b 결정(잠정) | 확인 시점 |
|---|---|---|---|
| DM1 | **annotations 엔티티** | 클립과 분리된 *시점앵커 공개노트*로 모델링. 단 Figma 소셜사이드바는 "인기구간+인사이트(=공개 클립)+댓글/답글"만 → annotations 분리가 *추측 스코프*일 수 있음(클립에 흡수 가능) | **u4** 착수 시(실 프레임 2087:12538 사이드바 구조 확인) |
| DM2 | **folder=클립 부착** | 클립에 folder_id(클립모달이 폴더+태그 동시설정). 한 콘텐츠 클립이 다른 폴더면 콘텐츠가 복수 폴더 표시 | **u7** 착수 시(콘텐츠-단일폴더로 조일지) |
| DM3 | **익명화 N=5** | 코호트(직업10×연차6=60버킷) 5명 미만 라벨 숨김. 표본 적은 영상은 대부분 숨김 → 버킷 롤업 추가 여부 | 데이터 생기면 튜닝(`anonymization_threshold()`) |

### u0 충실도 감사 결정점 (✅ 해소 2026-06-15 — 상세: `docs/design/u0-fidelity-audit.md`)
| # | 충돌 | ✅ 결정 |
|---|---|---|
| FD1 | **대시보드 탭** — Figma GNB엔 '대시보드' 탭 명시 존재(라이브러리·수신함 사이) vs 게이트 ⓐ "대시보드 제거" | ✅ **탭 제거 유지** — GNB=홈·검색·라이브러리·수신함(4탭). 스코프 결정(왜=문서) 우선, 죽은 링크 ❌. 나머지 4탭은 Figma 실측대로 |
| FD2 | **토글 색** — Figma 토글=Fluent2 외부킷 잔재(ON 파랑 #2563EB·track44×22·knob18) vs 구현 브랜드그린 #66FF4B·46×28 | ✅ **Figma 파랑 100% 채택** — ON track #2563EB·track 44×22·radius1000·knob 18(흰 #FAFAFA+rgba(0,0,0,.24) 0.5px stroke+이중그림자). 카디널 룰 "무엇=Figma" 엄격 적용 |
| FD3 | **흰색** — 온보딩 칩 라벨 실측 #FFFFFF vs 사용자 결정 #FAFAFA 통일 | ✅ **#FAFAFA 유지** — 흰색 토큰 단일화 유지(미세차 무시) |

### 화면 단위 spec 결정점 (✅ 3건 해소 2026-06-15 — 상세: `docs/units/<slug>/spec.md` §ESCALATION)
| # | 결정 |
|---|---|
| **u1-E1 인증** | ✅ **Google+Kakao만** 렌더 — Naver 버튼·이메일/"계속" 컷. 픽셀충실도=게이트 ⓒ '스코프 컷' 사인오프. ADR-0001 준수 |
| **u4-DM1 annotations** | ✅ **옵션1** — 인사이트=공개클립만 BE배선·댓글/답글=픽셀퍼펙트 UI+목킹/비활성. `annotations`+replies+likes = **ADR-0003 신규 단위**(다음 스프린트) |
| **수신함 탭** | ✅ **u11 제공** — 수신함 목록(빈상태)+알림설정. GNB 4탭 죽은링크 방지(u11 머지 전 비활성/준비중) |
| 잔여(PM 기본값·reversible) | u7 **DM2=클립부착**(`clips.folder_id`)·북마크=UI탭+빈상태·다중선택=게이트ⓒ 사인오프·폴더삭제=folder_id NULL해제 / u2 추천=콜드스타트 폴백·시드(추천 RPC 추후)·비회원홈=온보딩 리다이렉트 / u6 메모 nullable / u1 목표=Figma라벨 SoT·관심분야 5초과 토스트·웹스토어 placeholder·모달 1회 / u8 정렬·자동완성·최근검색어=파운데이션 / u11 계정메뉴=팝오버+설정페이지·soft-delete=deleted_at additive — 전부 spec 잠정값(다르면 PM 보고) |

## 7. Risks / WIP cap
- WIP 상한: **2 동시 단위** (기본 — 스프린트 계획 시 조정).
- 리스크: **R1 디자인 공백 광범위**(빈/로딩/에러 + 설정/알림) → u0 파운데이션으로 채움(게이트 ⓐ 결정). **R2 MV3 확장(u6)=무거운 단위** → 서브-spec 분할, 사이징 게이트 주의. **R3 콜드스타트**(소셜애노테이션·또래비교·추천) → 데이터 없는 MVP에서 빈 화면(u0b 폴백 스텁). **R4 인증=고위험**(u1) → 백그라운드 관찰 필수. **R5 환경: 로컬 Docker wedge·디스크 빠듯** → supabase 정본은 CI로(로컬 supabase dev 시 Docker 복구 필요). **R6 TODO: 범용 `ci.yml`이 npm 기반(stale)** → pnpm + 실제 스크립트로 갱신 필요(integration 브랜치).

---
Last updated: 2026-06-16 by PM (✅ **u0c 감사반영 완료·게이트 ⓒ·머지 `4984172`**[34px·앱셸 FD1·toggle FD2·stepper·lucide아이콘, tsc/lint/fsd/build 0] + ✅ **화면 8단위 spec 역설계**(`wtpvyccum`)·**spec 결정 3건**[u1 Google+Kakao·u4 annotations 옵션1·수신함 u11]. **u0 파운데이션 완성.** ✅ **게이트 ⓑ Wave1 킥오프**(u1 #2·u3 #3·보드 #2·워크트리 feat/u1·feat/u3). **다음 = Wave1 착수**: BE 헤드리스 u1(프로필 온보딩 RPC·코호트·게이팅·pgTAP) + FE Workflow u1·u3(UI 픽셀-퍼펙트·시각확인). u3 BE 신규 0(u0b ingest_clip 호출).)
