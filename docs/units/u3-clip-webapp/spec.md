# Unit: u3-clip-webapp

> Sprint 1 · Wave 1 · owner=both · **착수=FE Workflow 자동구현(시각확인)+BE 헤드리스 /goal** · **Issue #3** · dep=u0(디자인시스템·shared/ui)·u0b(데이터코어 `ingest_clip` RPC) 머지 후 · migration **없음**(u0b 계약 위에서 소비만)
> 매 턴 spec + plan + 대상 Figma 프레임(2087:32073 · 2087:33548 · 2087:35127 · 2087:36708 · 2384:141451) reload.
> ★ 데이터 계약 = u0b가 락한 ADR-0002. `clips`/`contents`/`folders`/`tags` 스키마·`ingest_clip()` RPC를 **변경 금지**, 호출만.

## L1 User Story (검증의 north star · 각 인수기준이 여기로 추적)
- **L1-a** As a 회원, 인앱에서 영상 URL을 붙여넣고 [다음]을 누르면 영상이 로드되어 편집 화면으로 진입한다, so that 확장 설치 없이 웹에서 바로 클립을 시작한다.
- **L1-b** As a 회원, 편집 화면에서 영상 구간을 **트림(시작/끝 핸들)**으로 잡아 클립 구간 `[start, end)`을 정한다, so that 핵심 구간만 남긴다.
- **L1-c** As a 회원, 클립에 **인사이트 메모**를 작성한다, so that 왜 저장했는지를 남긴다. (※ Figma의 'AI 요약' 자리는 제거 → 사용자 직접 입력 메모)
- **L1-d** As a 회원, **공개 범위 토글**로 이 클립을 익명 소셜 집계에 포함할지(`is_public`) 정한다, so that 내 클립을 공유/비공개 선택한다.
- **L1-e** As a 회원, **저장 폴더**를 선택해 클립을 폴더에 부착한다, so that 라이브러리에서 정리된다. (folder=클립 부착 — ADR-0002 #8/DM2)
- **L1-f** As a 회원, **태그**를 추가(입력→자동완성→Enter/선택→칩)·제거하여 클립을 분류한다, so that 검색/필터가 쉬워진다. (태그=유저별 — ADR-0002 #8)
- **L1-g** As a 회원, [완료]를 누르면 URL+구간+메모+공개+폴더+태그가 **하나의 클립으로 저장**되고, 같은 영상(다른 URL 형태)은 **1 content로 dedup**되며 같은 구간 재클립은 **메모만 병합**된다. (ADR-0002 #1/#2)

**Production acceptance (관찰가능):** prod-like 환경에서 회원이 ① 홈에서 [컨텐츠 추가] → 링크 붙여넣기 모달에 YouTube URL 입력 → [다음] → ② 편집 모달에서 트림 핸들로 구간 지정·인사이트 메모 작성·공개 토글·폴더 선택·태그 추가 → [완료]를 하면, `clips` 1행이 `ingest_clip()`을 통해 저장되고(QA가 supabase로 검증), 같은 영상의 다른 URL 형태/같은 구간 재클립이 dedup/메모병합되는 것을 e2e로 재현한다. 완료 토스트가 노출되고 모달이 닫힌다.

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- **Step1 링크 입력 모달** `2087:32073` — `모달_검색`(582×364, #1F1F1F, radius 12px, 모달 그림자, 백드롭 rgba(0,0,0,.6)). 헤더 "새 클립 추가"(20px Bold) + 닫기 아이콘 · "링크 붙여넣기"(15px SemiBold) + 헬퍼 "YouTube 등 컨텐츠를 불러올 웹사이트의 링크를 입력해 주세요."(#B4B4B4 13px) · URL textarea(border #363636 1px, padding 14px, radius 6px, 멀티라인) · [다음] 버튼(#66FF4B, on=#121212/#242424, padding 10×18, radius 6px).
- **Step2 편집 모달** `2087:33548` — `모달_검색`(998×702, #1F1F1F, radius 12px, 모달 그림자). 헤더 "컨텐츠 추가"(20px Bold) + 영상 제목 + 닫기 아이콘. **좌: 영상 플레이어 + 트림 타임라인**(시간 눈금 0:32/0:52/1:12/1:32, 트림 구간 핸들 0:32→1:01="29초", 진행/선택 바 #7FC573, 재생헤드 #BE1616). **우: 인사이트**(콜아웃 textarea, border #363636, radius 6px) · **공개 범위 설정**(라벨+설명 "해당 컨텐츠의 공개 여부를 설정합니다." + 토글 ON #2563EB·track44×22·knob18) · **저장 폴더**(드롭다운 셀렉트, 현재 "창업가 정신") · **태그**([추가] 칩 + 태그칩들 "업무생산성/창업/마인드셋" 각 [취소]=제거). [완료] 버튼(#66FF4B).
- **Step2 태그 입력 활성** `2087:35127` — [추가] 칩이 텍스트 입력 필드로 전환(캐럿 Rectangle 34719 + placeholder "입력 후 Enter로 추가해 보세요." Cap1_Rg). 기존 칩 유지.
- **Step2 태그 자동완성** `2087:36708` — 입력("개발") 시 드롭다운에 매칭 추천("개발자", "클라우드 개발", "백엔드 개발") — 입력 부분 하이라이트(ts2 span). 유저 본인 태그에서 추천.
- **Step2 칩 갱신** `2384:141451` — 추천 선택/Enter 후 입력이 [추가] 칩으로 복귀하고 새 칩("개발자")이 기존 칩 앞에 추가됨.

[디자인 공백] 아래 §[state] 참조 — URL 검증/로딩/실패, 완료/실패 토스트, 폴더 드롭다운 열림 상태, 트림 0길이/겹침 차단 피드백, 빈 영상(메타 fetch 실패) 화면은 프레임에 없음 → u0 파운데이션 컴포넌트(toast·dropdown·input 에러 상태)로 일관 채움.

---
/goal --tokens <예산>  [홈 [컨텐츠 추가] → 링크 모달(2087:32073) → 편집 모달(2087:33548) 흐름을 픽셀-퍼펙트로 구현하고, 사용자가 트림·메모·공개·폴더·태그를 설정해 [완료] 시 u0b `ingest_clip()` RPC로 클립 1건을 저장한다. dedup·구간규칙·메모병합은 RPC에 위임. AI 요약 자리 제거. 형용사 금지.]

### Source of truth (매 턴 reload)
- read   docs/units/u3-clip-webapp/spec.md (이 파일) · follow plan.md · update status.md
- view   Figma 5프레임(위 §Figma frames, Figma MCP) — 토큰·간격·정렬·타이포·상태 *정확값*
- 참조: state/decisions.md **ADR-0001(스택)·ADR-0002(#1 정준키·#2 구간 [start,end)·#8 folder부착·tags 유저별)** · config/quality_standards.md · supabase/migrations/{0002,0003,0004,0006,0009}(소비 계약 — read-only) · apps/web/src/shared/ui(u0 프리미티브)

### Acceptance criteria (스토리 도출 · 관찰가능 · 각 항목 → L1-x)
**BE** (owner=both — *신규 서버 코드 없음; u0b 계약 호출만*)
- [behavior] 웹앱은 클립 저장 시 **`supabase.rpc('ingest_clip', {...})`** 단일 호출(p_url·p_start_sec·p_end_sec·p_memo·p_is_public·p_folder_id·p_tags[]·p_title·p_channel·p_duration_sec·p_thumbnail_url). dedup·정준화·구간검증·메모병합·태그 get-or-create는 RPC가 수행. → L1-g
- [behavior] 폴더 목록 = `select from folders`(본인 RLS), 태그 자동완성 = `select from tags where lower(name) like`(본인 RLS, 유저별). → L1-e/f
- [negative] RPC가 던지는 에러(잘못된 URL=22023, invalid interval=start>=0·end>start 위반, 401 미인증, 폴더 20개 초과)를 FE가 사용자 메시지/토스트로 매핑. cross-user 데이터 직접 쿼리 ❌(sanitized 모델은 u4 소관, 이 단위는 본인 쓰기만).
**FE** (owner=both)
- [behavior] 홈 [컨텐츠 추가] 클릭 → Step1 링크 모달 오픈. URL 입력 후 [다음] → 클라 URL 형식 1차 검증(YouTube watch/youtu.be/shorts/모바일) → 유효 시 Step2 편집 모달 진입(영상 메타 로드). → L1-a
- [behavior] Step2 좌측: **트림 핸들** 드래그로 start/end(초 정수) 지정, [start, end) 의미(끝 배타), 선택 길이 표시("29초"). 영상 플레이어는 YouTube iframe(임베드). → L1-b
- [behavior] 인사이트 textarea 입력(메모). 공개 토글 ON/OFF(`is_public`). 저장 폴더 드롭다운 선택. → L1-c/d/e
- [behavior] 태그: [추가] 칩 클릭 → 입력 필드(placeholder "입력 후 Enter로 추가해 보세요.") → 타이핑 시 본인 태그 자동완성 드롭다운(부분 하이라이트) → Enter/선택 → 새 칩 추가 + 입력이 [추가] 칩으로 복귀. 칩 [취소]로 제거. 중복 태그 무시. → L1-f
- [behavior] [완료] → `ingest_clip` 호출 → 성공 시 완료 토스트 + 모달 닫힘(+ 라이브러리/홈 캐시 무효화는 TanStack Query invalidate). → L1-g
- [negative] 빈 URL/형식 불일치 시 [다음] 비활성 또는 인풋 에러. 트림 0길이/start≥end 시 [완료] 차단 + 피드백. 메모/태그 입력 trim·공백 차단, 태그 빈 문자열 무시. 미인증 진입 차단(로그인 유도).
- [non-regression] 홈/앱셸(u0 앱셸·GNB)·기존 라우팅 안 깨짐. shared/ui 프리미티브 시그니처 미변경(소비만).
- [state]
  - **빈**: 폴더 0개 → 드롭다운 "폴더 없음/새 폴더" 안내(u0 dropdown). 태그 0개 → 자동완성 빈 상태(추천 없음, 그대로 Enter로 신규 생성).
  - **로딩**: [다음] 후 메타 fetch 중 → 스켈레톤/스피너(u0). [완료] 후 RPC 중 → 버튼 로딩·중복제출 방지.
  - **에러**: 잘못된 URL → 인풋 에러 텍스트(프레임 공백 → u0 input 에러 상태). 메타 fetch 실패 → 제목/길이 null 허용해 진행(영상 로드는 iframe). RPC 실패 → 실패 토스트(프레임 공백 → u0 toast).
- [fidelity] 지정 5프레임과 1:1 (토큰·간격·정렬·타이포·상태) — 모달 치수(582×364 / 998×702)·#1F1F1F·radius12·모달 그림자·백드롭 rgba(0,0,0,.6)·[다음]/[완료] #66FF4B·공개 토글 ON #2563EB(track44×22/knob18)·태그칩(rgba(255,255,255,.06) bg·#CECECE text·radius6)·태그입력 캐럿/placeholder·자동완성 하이라이트. → L1-a~g

### Validation (증명 명령 — QA가 clean checkout 재실행)
- `clip-flow.test`(Vitest+RTL): Step1→Step2 전환, 트림 start/end 상태, 태그 추가/자동완성/제거, [완료] 시 `ingest_clip` payload(구간 정수·tags[]·is_public·folder_id) 단언. **supabase-js는 목킹 → 결정론적**. 동어반복 ❌.
- e2e(Playwright, 로컬 Supabase): URL 입력→완료→`clips` 1행 + 같은영상 다른URL→1 content(dedup) + 같은구간 재클립→메모병합. (u0b pgTAP가 DB 불변식은 이미 증명 — 여기선 웹 경로 e2e.)
- `tsc -b` 0 · `pnpm lint` 0 · `pnpm lint:fsd` 0 · 콘솔 에러 0.
- (UI) `/design-review` 충실도(5프레임 1:1) PASS · 스크린샷(Step1·Step2·태그입력·자동완성·칩갱신).

### Boundaries
- only edit (FE): `apps/web/src/pages/clip-add/**`(또는 widget) · `apps/web/src/features/{clip-add,clip-trim,clip-tags,clip-folder}/**` · `apps/web/src/entities/{clip,folder,tag,content}/**` · `apps/web/src/shared/api/**`(supabase 클라이언트·`ingest_clip` 래퍼 — 신규) · 홈 [컨텐츠 추가] 트리거 배선(widgets/gnb 또는 pages/home의 진입점만).
- only touch (BE): 없음(u0b RPC 호출만, `supabase/**` 변경 ❌).
- do not change: `supabase/**`(u0b frozen — `clips`/`contents`/`folders`/`tags` 스키마·`ingest_clip`/`get_or_create_content` 시그니처) · `apps/web/src/shared/ui/**`(u0 frozen — 소비만) · 인증·결제 · u4 sanitized/heatmap 읽기모델.
- preserve: FSD 하향 임포트·배럴(`@/shared/ui`,`@/shared/api`)·`lint:fsd` 0 · RLS(본인 쓰기만) · ADR-0002 불변식(RPC 위임).
- 정적 유지: u4 콘텐츠상세(소셜 애노테이션/히트맵 표시)는 이 단위 ❌ — 여기선 `is_public` 쓰기만.
- out of scope (게이트 ⓐ 제외): **AI 요약/자동태그/키워드 전면 제외**(인사이트 자리=사용자 메모) → 영구제외(u5) · **아티클/텍스트 하이라이트 클리핑 제외**(영상 전용) → 제외 · **대시보드 제외**(FD1, GNB 4탭) · **구독/결제·요금제모달·페이월·연간플랜 제외**(u10) · **크롬 확장 클리핑 경로**(같은 `ingest_clip` 계약) → u6 · **좋아요/공유/필터정렬/검색** → u4/u8 · **폴더 생성/관리 CRUD 화면**(여기선 기존 폴더 선택만; 생성 UI 필요 시 in-flight 흡수 판단 → 범위 밖이면 PM 보고) → u7.
- main 직접 푸시 ❌ · blast radius = `feat/u3-clip-webapp`.

### Loop behavior
- 의미있는 변경마다 validation(clip-flow.test·tsc·lint:fsd) 실행 · status.md 갱신.
- ⚠ goal = 모든 L1-a~g의 production acceptance가 관찰가능하게 충족 + 5프레임 fidelity PASS까지 루프. 미충족 기준에 done ❌ → ESCALATION(§no-fake-done).
- in-flight 발견은 이 유닛이 흡수, 범위 밖(폴더 생성 화면·확장 경로·소셜 표시)은 PM 보고(새 티켓 ❌) · 토큰/턴 예산 초과 시 차단 사유 기록 후 정지.
