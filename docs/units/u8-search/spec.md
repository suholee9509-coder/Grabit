# Unit: u8-search

> Sprint 0 · Wave (화면 단위) · owner=**both** · **mode=인터랙티브 워크트리(사용자 운전)**
> · Issue #TBD(게이트 ⓑ에서 PM 발급) · dep=**u0c**(파운데이션: 토큰·`shared/ui`·앱셸/GNB) + **u0b**(데이터코어·ADR-0002 락, 특히 #10 검색 데이터 형태·#8 tags) 머지 후 · migration **유**(검색 RPC/FTS 인덱스 — u0b 스키마 위 additive)
> 매 턴 spec + 대상 Figma 프레임(2087:40320 / 2087:38847 / 2087:40125) reload.

## L1 User Story  (검증의 north star — 각 인수기준이 여기로 추적)
- **L1-a** As a 회원, 검색바에 들어가면 **추천 키워드 칩 + 카테고리 탭 + 카테고리별 추천 컨텐츠**(디폴트 발견 상태)를 보고, 막막함 없이 탐색을 시작할 수 있다.
- **L1-b** As a 회원, 검색어(또는 추천 칩/카테고리)를 입력하면 **내가 클립한 컨텐츠를 제목·메모·태그 기준으로 통합 검색**해 결과 리스트를 본다 — 검색바엔 선택된 쿼리가 **칩(X dismiss)**으로 남고, **출처(소스)별 카운트 필터 + 카테고리 필터 + 정렬(최신순…)**로 좁힐 수 있다.
- **L1-c** As a 회원, 결과가 0건이면 **"‘<쿼리>’의 검색 결과가 없습니다." 빈 상태**를 보고(쿼리 칩·카테고리·정렬은 유지, 출처 필터·결과 그리드는 비노출), 칩 dismiss나 새 검색으로 빠져나올 수 있다.
- **L1-d** As a 회원, 결과 리스트의 각 컨텐츠는 **제목·태그·클립 수·출처**를 카드로 보여, 클릭 시 콘텐츠 상세(u4)로 진입한다.
**Production acceptance (관찰가능):** prod-like 환경에서 회원이 ① 검색 진입 시 디폴트 발견(추천칩·카테고리·추천 그리드)을 보고 → ② 칩/입력으로 검색하면 본인 클립 컨텐츠가 제목·메모·태그로 매칭되어 리스트로 뜨고(쿼리 칩·출처카운트·정렬 동작) → ③ 매칭 0건이면 빈 상태 문구가 정확한 쿼리로 렌더되며 → ④ 결과 카드 클릭이 상세로 이동한다. QA가 위 3 상태를 e2e 재현하고, **검색이 본인 행만 매칭(타 user 클립 누출 0)** 함을 확인한다.

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- **디폴트 발견(추천)** `2087:40320` (검색_디폴트_시안A) — 검색바(placeholder "제목, 메모, 태그로 검색하기" + "검색하기" 버튼) · 추천 키워드 칩(AI 활용법·시간 관리·AI 업계 소식·커리어 전환·실리콘밸리·창업 스토리, 각 검색 아이콘) · 카테고리 탭(헤더 "모든 카테고리" + "다양한 컨텐츠와 함께 성장하는 매일을 만나보세요." + 칩: 전체·면접·자소서·포트폴리오·프로덕트·서비스 기획·디자인·프로그래밍·커리어·리더십·협업·커뮤니케이션·마케팅·그로스·업무 생산성·마인드셋·창업·스타트업) · "카테고리별 추천 컨텐츠" 그리드(카드=제목·태그2·클립수 "N개"·출처 썸네일)
- **검색 결과** `2087:38847` (검색_검색 결과) — 검색바에 **선택 쿼리 칩**("IT 업계 동향" + Dismiss 아이콘 `compId=1230:5857`) · 카테고리 필터 스트립(헤더 "카테고리" + "카테고리별로 검색 결과를 확인해 보세요." + 동일 칩) · 결과 헤더("‘IT 업계 동향’ 검색 결과" + 카운트 "34") + **정렬 드롭다운**("최신순" + 짧은 화살표) · **출처(소스) 필터 탭+카운트**(Youtube 16 · Long Black 8 · Medium 6 · Tistory 6 · EO planet 2 · Publy 2) · 결과 컨텐츠 그리드(3열, 카드=제목·태그2·클립수)
- **검색 결과 없음(빈)** `2087:40125` (검색_검색 결과_검색 결과 없음) — 동일 쿼리 칩 + 카테고리 스트립 + 결과 헤더(카운트 "0") + 정렬 드롭다운 유지 · **출처 필터·결과 그리드 비노출** · 빈 문구 "‘IT 업계 동향'의 검색 결과가 없습니다." · 좌측 GNB(홈/검색/라이브러리/수신함 + 내 폴더 + 최근 본 컨텐츠) 노출
- 공통 앱셸/GNB = **u0c 파운데이션이 SoT** (대시보드 탭 ❌ = FD1).

---
/goal --tokens <예산>  검색 디폴트 발견(추천칩·카테고리·추천 그리드)·검색 결과(쿼리 칩·출처카운트 필터·카테고리 필터·정렬·결과 그리드)·빈 상태를 위 3 프레임과 픽셀-퍼펙트로 구현하고, **본인 클립 컨텐츠의 제목/메모/태그 한국어 FTS 검색**(ADR-0002 #10)을 u0b 데이터계약 위에 배선해 contract/e2e 로 증명한다. 형용사 금지.

### Source of truth (매 턴 reload)
- read   docs/units/u8-search/spec.md (이 파일) · follow plan.md · update status.md
- view   Figma 프레임 `2087:40320`(디폴트) · `2087:38847`(결과) · `2087:40125`(빈) (Figma MCP — 토큰·간격·정렬·타이포·상태 정확 값) · u0c 파운데이션 `apps/web/src/app/styles` + `shared/ui` + 앱셸 GNB
- 참조: state/decisions.md **ADR-0001**(스택·FSD) / **ADR-0002 #10**(검색 데이터 형태=한국어 FTS·제목/메모/태그/공개애노테이션 인덱싱·프라이버시) · **#8**(tags 글로벌/유저별·content/folder 부착) · config/quality_standards.md · docs/source/기능명세서.md §5.2 · docs/source/유저플로우.md s5(통합 검색)

### Acceptance criteria  (스토리에서 도출 · 관찰가능 · 각 항목 → L1-x)
**BE** (owner=both)
- [behavior] **검색 RPC = 본인 클립 컨텐츠 한국어 FTS**: `search_my_content(query, category?, source?, sort?)` → 본인이 클립한 content를 **제목·메모(clips.memo)·태그** 매칭(ADR-0002 #10 한국어 FTS, Postgres FTS/`pg_trgm` 또는 정한 형태). 결과 행 = 카드 표면(제목·태그·클립수·출처·content_id). RLS: 검색은 **본인 행만**(쓰기 본인·읽기 본인) — 타 user 클립 비매칭. → L1-b
- [behavior] **정렬**: 최신순(기본) 외 프레임이 노출하는 정렬 옵션을 RPC 파라미터로 (시점/관련도 등 — 드롭다운 옵션은 프레임 텍스트가 "최신순"만 명시 → 추가 옵션은 [디자인 공백], 파운데이션 dropdown 패턴 + 기획 §5.1 정렬(최신/오래된/클립많은)으로 채움). → L1-b
- [behavior] **출처(소스)별 카운트**: 결과 집합을 provider별로 그룹·카운트(Youtube/Long Black/Medium/Tistory/EO planet/Publy 등) → 출처 필터 탭의 카운트 배지. provider 매핑은 u0b content 정준키(provider) 사용. → L1-b
- [behavior] **카테고리 필터**: content의 카테고리/태그 분류로 필터(전체 + 12 카테고리). 분류 소스(글로벌 카테고리 vs 태그)는 ADR-0002 #8 결정 따름. → L1-a/b
- [behavior] **추천(디폴트 발견) 데이터**: 추천 키워드 칩·카테고리별 추천 컨텐츠 = 콜드스타트 폴백 인터페이스(ADR-0002 #7)로 채움 — 개인 클립 시드/전역 인기/에디토리얼 시드. AI 개인화 ❌(게이트 ⓐ 제외) → 결정론적 비-AI 소스. → L1-a
- [negative] 빈 쿼리/공백만/특수문자·FTS 인젝션 무해화 · 0건 매칭 시 빈 응답(에러 ❌) · 미인증 차단(401).
**FE** (owner=both)
- [behavior] **디폴트 발견**: 검색 진입 시 추천 키워드 칩(클릭→해당 쿼리 검색) + 카테고리 탭(클릭→카테고리 필터 검색) + 카테고리별 추천 그리드 렌더. → L1-a
- [behavior] **검색 실행 UX**: 입력 디바운싱 **0.5초**(기획 §5.2.1) 후 RPC 호출 · 실시간 자동완성(드롭다운) · **최근 검색어 저장(최대 10개)**(기획 §5.2.1) — 자동완성/최근검색어/디바운싱은 [디자인 공백] → 파운데이션 dropdown/input 패턴으로 채움. → L1-b
- [behavior] **선택 쿼리 칩**: 검색 후 검색바에 쿼리가 **칩(selected) + X dismiss**(Dismiss 아이콘)로 표시, dismiss 클릭 시 디폴트 발견 상태로 복귀. → L1-b/c
- [behavior] **출처/카테고리/정렬 필터링**: 출처 탭(카운트)·카테고리 칩·정렬 드롭다운 선택 시 결과 그리드 갱신. → L1-b
- [behavior] **결과 카드 → 상세**: 카드 클릭 시 콘텐츠 상세(u4) 라우트로 이동. → L1-d
- [negative] 빈/공백 쿼리 검색 차단(또는 디폴트 유지) · 자동완성/검색어 XSS 무해화 · 미인증 시 로그인 유도.
- [non-regression] u0c 앱셸/GNB(홈·검색·라이브러리·수신함, **대시보드 ❌**)·`shared/ui` 컴포넌트·토큰 미변경. 다른 화면 단위 라우트 안 깨짐.
- [state] **빈**(L1-c): 결과 0건 = 프레임 `2087:40125` 그대로(쿼리 칩·카테고리 스트립·결과 헤더 카운트 0·정렬 드롭다운 유지 · 출처필터·그리드 비노출 · "‘<쿼리>’의 검색 결과가 없습니다." 문구 정확 보간). 디폴트 발견(검색 전)도 별도 "빈→발견" 상태. **로딩**: 검색/추천 fetch 중 = 그리드 스켈레톤(파운데이션 패턴 — [디자인 공백]). **에러**: 검색 실패 = 토스트+재시도, 권한오류=로그인(파운데이션 toast 패턴 — [디자인 공백]).
- [fidelity] 지정 Figma 프레임과 1:1(토큰·간격·정렬·타이포·상태): 디폴트=`2087:40320` · 결과=`2087:38847` · 빈=`2087:40125`. 칩·카드·탭·드롭다운·인풋은 u0c `shared/ui` 인스턴스. → L1-a/b/c/d   # UI

### Validation  (증명 명령 — QA가 clean checkout 재실행 · AI/외부 목킹 · 동어반복 ❌)
- BE pgTAP/contract: `search-rls-isolation`(타 user 클립 검색 비매칭=누출 0) · `search-fts-match`(제목/메모/태그 매칭·한국어 토큰) · `search-source-count`(provider 그룹 카운트) · `search-empty`(0건→빈 응답·에러 ❌) · `search-auth`(미인증 401) · 빈/공백/인젝션 무해화.
- FE contract/e2e(Vitest + Playwright, 검색 RPC 목킹 → 결정론적): 디폴트 발견 렌더 · 입력 디바운싱 0.5s 후 1회 호출 · 쿼리 칩+dismiss · 출처/카테고리/정렬 필터 반영 · 0건→빈 문구(쿼리 보간) · 카드 클릭→상세 라우트 · 최근검색어 10개 캡.
- `tsc -b` 0 · lint 0 · **lint:fsd** 0 · 콘솔 0.
- (UI) `/design-review` 충실도(3 프레임 1:1) PASS · 스크린샷(디폴트/결과/빈).

### Boundaries
- only edit (FE): `apps/web/src/pages/search/**` · `apps/web/src/widgets/search-bar/**`(쿼리칩·자동완성) · `apps/web/src/widgets/search-results/**`(출처필터·정렬·그리드) · `apps/web/src/widgets/search-discovery/**`(추천칩·카테고리·추천그리드) · `apps/web/src/features/content-search/**`(검색 쿼리/디바운싱/최근검색어) · `apps/web/src/entities/content/**`(검색 카드 모델 — 기존 재사용 우선). GNB에 검색 라우트 연결만(앱셸 구조 변경 ❌).
- only edit (BE): `supabase/migrations/**`(additive: 검색 RPC + FTS 인덱스만) · `supabase/tests/**`(pgTAP) · 필요 시 `supabase/functions/_shared` 재사용(신규 곁다리 지양).
- do not change: 인증·결제(제외)·u0/u0c 파운데이션 계약(토큰·`shared/ui`·앱셸)·u0b frozen 스키마/RLS(읽기는 additive RPC로만). preserve: FSD 하향 임포트·배럴·RLS(쓰기 본인·읽기 본인)·u0b 정준키/[start,end)/soft-delete.
- 정적 유지: 추천 알고리즘 고도화·개인화 랭킹(콜드스타트 인터페이스/결정론 시드까지만).
- out of scope (게이트 ⓐ 제외): **AI**(AI 자동완성/시맨틱 검색·AI 추천 ❌) · **대시보드**(GNB 대시보드 탭 ❌=FD1) · **구독/결제·요금제 모달·페이월** · **아티클 클리핑/하이라이트**(영상 전용 — 출처에 아티클 소스 표기는 데이터상 존재하나 클리핑 기능은 ❌) · **연간 플랜**. → u5/u9/u10/다음 스프린트.
- main 직접 푸시 ❌ · blast radius = `feat/u8-search`.

### Loop behavior
- 의미있는 변경마다 validation(pgTAP/Vitest/Playwright + tsc/lint/lint:fsd) 실행 · status.md 갱신(변경·검증결과·디자인 공백 채움 결정).
- ⚠ **goal = 모든 L1-x(a/b/c/d) production acceptance가 관찰가능하게 충족될 때까지 루프.** 미충족 기준에 done ❌ → ESCALATION(§C no-fake-done).
- in-flight 발견은 이 유닛이 흡수, 범위 밖은 PM 보고(새 티켓 ❌) · 토큰/턴 예산 초과 시 차단 사유 기록 후 정지.
