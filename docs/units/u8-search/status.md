# u8-search — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **BE 검증 완료(pgTAP 0 not-ok · 커밋 보류 — PM 통합)**
- 검증 (pglite = real Postgres WASM, `supabase/tests/_pgtap_pglite.mjs`):
  - **전체 16 pgTAP 파일 · 111 asserts ok / 0 not ok / 0 file-error** (기존 11파일 무회귀 + u8 신규 5파일 PASS).
  - u8 신규: search-auth 5/5 · search-empty 11/11 · search-fts-match 9/9 · search-rls-isolation 6/6 · search-source-count 6/6.
  - **FTS 실제 실행 확인(pglite)**: `to_tsvector('simple',…) @@ websearch_to_tsquery('simple',…)`가 한국어 토큰을 *실매칭* — "창업"(제목)·"관리"(메모)·다중토큰 "창업 투자" 모두 true. `pg_trgm`은 pglite에 **부재(absent)** 확인 → 부분/중간토큰("실리콘"→"실리콘밸리")은 ILIKE 폴백이 처리(FTS-only는 false, ILIKE는 true). 한국어 샘플 직접검증: `AI 활용법`·`활용법`·`기획`→매칭, 없는단어→0건.
  - **인덱스**: `clips_memo_fts_idx`(GIN on `to_tsvector('simple', memo)`) 생성됨; `clips_memo_trgm_idx`는 guarded DO-block로 pglite에서 no-op(부재) — 쿼리 로직 불요.
  - **RLS 누출 0**: 공유 content 위 bob(1클립)·alice(2클립) 시나리오에서 bob 검색=1행·clip_count=1·tags=본인것만(alice의 "커리어" 미노출), alice=clip_count 2, 클립無 carol="성장" 검색→0행·source 0행. SECURITY INVOKER + `user_id = auth.uid()` 핀 = 구조적 cross-user 비매칭. 미인증(uid null)→28000.
- 변경 파일 (boundary 준수 · **additive only · 기존 tracked 파일 0 수정** — `git diff --stat HEAD` empty):
  - `supabase/migrations/0012_search.sql` (신규 — clip_search_doc/like_escape/search_my_content/search_my_content_sources + clips_memo_fts_idx; 0001~0010·RLS·content_clips_public·content_heatmap·get_or_create_content 미접촉)
  - `supabase/tests/search-{auth,empty,fts-match,rls-isolation,source-count}.sql` (신규 5)
- FTS 방식 (DECISION): Postgres에 'korean' 사전 없음 + pglite는 pg_trgm 미지원 → **두 엔진 OR**: (1) `to_tsvector('simple')`+`websearch_to_tsquery('simple')` 토큰/구문 매칭, (2) parameter-bound `ILIKE` (LIKE 메타문자 escape) 부분/중간 매칭(한국어 무공백 특성의 pg_trgm 대체). 인젝션 구조적 불가(query는 websearch 파서·바인드 ILIKE만 경유, 실행SQL 비결합).
- 설계 노트:
  - 3 상태 = 디폴트 발견(`2087:40320`) · 결과(`2087:38847`) · 빈(`2087:40125`). 검색바 쿼리는 결과/빈 상태에서 **칩(selected) + X dismiss**(Dismiss 아이콘 `1230:5857`).
  - 결과 상태에만 **출처 필터(카운트)** 존재 · 빈 상태엔 출처필터/그리드 비노출(결과 헤더 카운트 0 + 정렬 드롭다운은 유지).
  - 검색 = u0b 데이터 위 **본인 클립 컨텐츠 한국어 FTS**(ADR-0002 #10). 소셜/cross-user 검색 ❌ — RLS 본인 행만.
  - dep: u0c(파운데이션 토큰·shared/ui·앱셸 GNB) + u0b(검색 RPC/FTS 토대) 머지 후.
- 리스크: BE(RPC+FTS) 검증 통과 · 커밋은 PM 통합 시점에. 정렬/카테고리/추천/자동완성 4건(아래 ESCALATION)은 FE·기획 결정 영역으로 BE 검증 범위 밖(현 RPC는 recent/oldest/most_clips + per-user 태그 카테고리 + provider facet까지 구현).
- ESCALATION (PM 결정 필요):
  1. **정렬 옵션 확정** — 프레임 드롭다운 텍스트는 "최신순"만 노출. 추가 옵션(오래된순/클립많은순=기획 §5.1, 또는 관련도순) 채택 여부 → 채움 vs 단일 정렬.
  2. **카테고리 분류 소스** — 카테고리 필터(12종)를 글로벌 카테고리 컬럼으로 둘지 vs 태그 매핑으로 도출할지(ADR-0002 #8 tags 글로벌/유저별 결정 의존).
  3. **추천(디폴트 발견) 시드 소스** — 추천 키워드 칩·카테고리별 추천 컨텐츠를 무엇으로 채울지(개인 클립 시드 / 전역 인기 / 에디토리얼 시드 — ADR-0002 #7 콜드스타트). AI 개인화는 제외.
  4. **자동완성/최근검색어 저장소** — 최근검색어(10) 로컬(localStorage) vs 서버 저장, 자동완성 소스(본인 태그/제목 vs 카테고리 사전). [디자인 공백] → 파운데이션 채움 방안 확인.

## FE 구현 완료 + 검증 에이전트 재실행 (픽셀퍼펙트 — 워크트리 u8-search-fe)

- 상태: **FE 구현 완료 · 전 게이트 GREEN (검증 에이전트 실측 재확인 2026-06-16)** (tsc 0 · eslint 0/0 · steiger(FSD) 0 · build OK · vitest 80/80, u8 18/18)
- 게이트 결과 (검증 에이전트 실행 — 실제 종료코드):
  - tsc `-b --force`: **EXIT 0 (0 errors)**. eslint `.`: **EXIT 0 (0 error / 0 warning)**.
  - steiger `./apps/web/src`: **EXIT 0 — "✔ No problems found!"** (하향임포트만·배럴경유·동일레이어 cross-slice 0).
  - production build: **EXIT 0** (vite 2082 modules transformed, 579KB chunk-size 경고만 — 게이트 무관). 콘솔: search 테스트 console.error/warn **0**.
  - 풀 vitest: **16 files / 80 tests pass** — **기존 62 무회귀 (13 files) + u8 신규 18 (3 files)**.
    - u8 분해: search-results 9 · search-discovery 4 · search-recent 5.
    - (이전 기록의 "60 무회귀 + 신규 20 / results 11"은 stale — 실측 62+18, results 9로 정정.)
- 화면 1:1(실측 대비):
  - **디폴트 발견(2087:40320)**: 히어로(713×48·32/600/150%/-2.5% CENTER·순백#FFFFFF=white-pure) + 검색바(520×48·radius80·surface-100·border-default·pad8/7/8/20·"검색하기"34h #66FF4B #000 라벨14/600/130) + 추천칩6(Chip recommend·32h·pad10/12/10/10·radius100·14/500/130) + 카테고리패널(좌 176/196 리스트·divider68·세로divider561 / 우 그리드 1092/1083·행42 열28·4열) + 추천그리드(ContentCard 시드 8).
  - **결과(2087:38847)**: 쿼리칩 검색바(pad8/20·쿼리15/400/160·Dismiss16 #999) + 카테고리 스트립("카테고리"/부제\n2줄) + 메인컬럼(1092·gap32: 결과헤더 24/700+카운트24/400·정렬 보더리스 텍스트+화살표14·gap2 / 출처필터 Chip source pill·로고20·count / 4열그리드 행42열28).
  - **빈(2087:40125)**: 쿼리칩·카테고리스트립(13)·결과헤더(카운트0)·정렬 유지 · 출처필터·그리드 비노출(unmount) · 빈문구 곡선따옴표 정확보간 18/400/130%/-2% #B4B4B4 · main gap14.
  - 로딩=그리드 스켈레톤([디자인공백]), 에러=인라인 재시도(토스트 패턴, [디자인공백]).
- 토큰: **신규 0**(전부 기존 토큰·lh130/140/150% 변형만 컴포넌트 module.css 인라인). tokens.css·shared/ui·app-shell·sidebar·topbar **미접촉**(git diff empty). rgba(0,0,0,.32) 썸네일 배지 인라인 1곳(.32 오버레이 토큰 부재 — 경미).
- 데이터 배선: search_my_content/_sources RPC 래퍼(shared/api/search.ts·snake→camel)·isSupabaseReady 분기 demo-search 폴백·query는 RPC 인자로만(인젝션 무해화 0012 위임)·본인행만(user 필터 미전송)·TanStack Query(enabled=query≠''·staleTime60s)·디바운스 0.5s(use-content-search)·최근검색어10(localStorage).
- AI 게이트ⓐ 제외 준수: 자동완성/시맨틱/개인화 추천 ❌ → 정적 칩·결정론 시드·비-AI ILIKE 거울 폴백.
- FSD 배치 결정(plan 대비): **search-bar = features/content-search/ui** (plan은 widgets/search-bar). widgets(discovery/results)가 같은레이어 widget(search-bar)을 import하면 cross-slice 위반 → 검색 컨트롤은 feature로 하향배치(widgets→features 정상 하향임포트). steiger 통과.
- u8 contract 테스트(18, vi.mock('@/shared/api')·renderRoutes 프로브 — 게이트 명세 항목 전수 커버):
  - results(9): 디바운스0.5s 정확1회(최종쿼리 인자)·결과헤더보간·쿼리칩dismiss→discovery 복귀(추천칩 재노출)·출처필터 source 인자 반영 재조회·카테고리 category 인자·정렬 most_clips 인자·0건 빈문구(곡선따옴표 정확보간·출처필터/그리드 부재·카운트0·정렬·카테고리 스트립 유지)·카드→/content/:id·본인행만(식별자부재·이메일 패턴 부재).
  - discovery(4): 추천칩6+카테고리13+그리드시드 노출 + RPC 미호출 단언·히어로/placeholder·칩클릭→검색진입(쿼리칩)·카테고리 클릭→선택표시+그리드 재필터.
  - recent(5): 최신우선 누적·중복1건(최신이동)·10캡(11번째밀림·q1소거)·remove·빈/공백 push 무시.
- spec 항목별 충족 (검증 에이전트 — no-fake-done 체크):
  - **L1-a(디폴트 발견)**: discovery 모드 = 히어로+추천칩6+카테고리13+추천그리드(2087:40320 실측 1:1). RPC 미호출(콜드스타트 결정론 시드). ✅
  - **L1-b(검색/필터)**: 본인 클립 제목·메모·태그 FTS(0012 RPC 소비)·쿼리칩(X dismiss)·출처카운트 필터·카테고리 필터·정렬(recent/oldest/most_clips). 2087:38847 1:1. ✅
  - **L1-c(빈)**: 0건→곡선따옴표 정확보간 빈문구·출처필터/그리드 조건부 unmount·쿼리칩/카테고리/정렬 유지. 2087:40125 1:1. ✅
  - **L1-d(카드→상세)**: ContentCard onSelect→navigate(`/content/:id`)·제목/태그2/클립수/출처배지. ✅
  - **[state]**: 로딩=GridSkeleton·에러=인라인 role=alert 재시도·빈=프레임 그대로. ✅
  - **[fidelity]**: search-bar(520×48·radius80·pad8/7/8/20·8/20)·discovery-grid(4열 행42 열28 width1083/1092)·content-card(썸네일142h radius6·배지 rgba(0,0,0,.32)+blur2px·태그칩28h/pad10/13/400/160% #CECECE·클립수 icon↔num gap4 14/400/130% #999) — 측정 docs 대비 1:1 확인(각 CSS 값에 측정 nodeId 주석 매칭). 클립수 그룹의 외곽 gap7(2087:38967)은 단일자식 프레임 → 무효과, 가시 gap=내부 4(2087:38968)로 정확. ✅
- 미완/리스크:
  1. **출처 로고 자산** [디자인공백]: Youtube만 SVG(#ED1D24), 그 외 provider는 머리글자 모노그램 폴백(imageRef 미보유). figma download_figma_images로 실제 로고 추출 시 교체 가능.
  2. **카테고리=태그 매핑**(plan 리스크 #5): 프레임 13 카테고리 라벨(`디자인` 등)이 실 태그명과 1:1 매칭 안 될 수 있음 → 실데이터 0건 가능(빈 상태 graceful). 시드는 프레임 라벨 사용, 실RPC는 카테고리 라벨을 p_category로 전달.
  3. **정렬 2옵션 라벨**(오래된순/클립많은순) [디자인공백] = 기획 §5.1 + RPC sort 키 1:1. 정렬 드롭다운 트리거는 프레임 보더리스 텍스트+화살표 1:1, 패널만 파운데이션 패턴.
  4. **자동완성/스켈레톤/에러토스트** [디자인공백] = 파운데이션 패턴(최근검색어 드롭다운·그리드 스켈레톤·인라인 재시도). 신규 스타일 생성 ❌.
  5. **/design-review 충실도 사인오프**(게이트ⓒ)는 사용자 시각확인 대기(스크린샷 디폴트/결과/빈 — 인터랙티브 워크트리).
- 커밋: PM 통합 시점에(현재 미커밋).

STATUS = "FE 검증완료(에이전트 재실행): u8-search 3프레임 픽셀퍼펙트 + RPC 배선 + 18 contract green(results9·discovery4·recent5) · 전 게이트 EXIT0(tsc/eslint/steiger/build) · 콘솔0 · 무회귀(기존62 유지·총80/80) · L1-a~d·[state]·[fidelity] 전 항목 충족 · 미커밋(PM 통합) · 잔여=출처로고 자산·카테고리=태그 매핑 [디자인공백] + design-review 시각 사인오프(게이트ⓒ) 대기"
