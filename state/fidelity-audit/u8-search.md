# u8 — Search 페이지 정밀 충실도 감사 (read-only)

- **fileKey**: 5GGyKsjXEOpjKMLtUodeSs
- **프레임**: 2087:40320(디폴트 발견) · 2087:38847(결과, 1920×2963 풀스크롤) · 2087:40125(빈)
- **렌더 PNG**: `state/fidelity-audit/u8-search/discovery-2087-40320.png` · `results-2087-38847.png`(2880×4445) · `empty-2087-40125.png` · 크롭: `crop-chips.png` · `crop-sourcefilter.png` · `crop-resultcard.png`
- **감사일**: 2026-06-16 · 방법: get_figma_data 풀깊이 파싱(layout/style 레퍼런스 해석) + 3프레임 풀렌더 시각확인 + impl 전수 Read
- **충실도 추정**: **약 88%** — 레이아웃·타이포·간격·상태분기·인터랙션은 거의 1:1. 핵심 미달은 (1) 출처 로고 자산 5/6 누락(모노그램 폴백), (2) 히어로 상단 오프셋 ~56px 과다(토픽바 중복 카운트), (3) 카드폭 249 vs 252 미세차. 누락 섹션·누락 인터랙션은 사실상 없음.

---

## 프레임별 구조 요약 (실측)

### 디폴트 발견 (2087:40320) — content rect @270,8 1642×1080
1. 히어로 타이틀 `@465,120 713×48` · 32/600/lh150%/-2.5%/CENTER · #FFFFFF
2. 검색바(디폴트) `@561,192 520×48 r80` · [검색아이콘18 + placeholder "제목, 메모, 태그로 검색하기" 15/400 + "검색하기" 버튼34 #66FF4B]
3. 추천 키워드 칩 `@497.5,264 row gap8` · 6칩(AI 활용법/시간 관리/AI 업계 소식/커리어 전환/실리콘밸리/창업 스토리) · 각 [검색아이콘16 + 라벨14/500] · h32 r100 ghost(.04)/border(.08)
4. 카테고리 패널 `@136,408 row gap62`
   - 좌: CategoryList — 헤더 "모든 카테고리" 24/700 + 부제 "다양한 컨텐츠와 함께 성장하는 매일을 만나보세요." 14/400(w176) + divider68 + 13항목 h32(선택 500/#FAFAFA · 비선택 400/#999)
   - 세로 divider 0×561 rgba(255,255,255,.10)
   - 우: DiscoveryGrid — 제목 "카테고리별 추천 컨텐츠" 24/700(w1092) + 4열 그리드(행간42 열간28 w1083) · **카드 249×232**(썸네일249×142 r6 + 좌상단 로고배지 + 제목15/500 2줄 + 태그칩13/400 + "N개"14/400) · 8카드(2행)

### 검색 결과 (2087:38847) — content rect @270,8 1642×2947(풀스크롤 2963)
1. 히어로(동일)
2. 검색바(쿼리칩) `@561,192 520×48 r80` · [검색아이콘18 + 쿼리텍스트 "IT 업계 동향" 15/400 + **X아이콘16**(Dismiss)]
3. row `@136,324`:
   - 좌 CategoryStrip `@136,324` — 헤더 "카테고리" 24/700 + 부제 "카테고리별로 검색 결과를\n확인해 보세요." 14/400 + divider68 + 13항목 + 세로divider 0×561
   - 우 결과컬럼 `@414,324 w1092 column`:
     - 결과 헤더 row(space-between): 좌 "'IT 업계 동향' 검색 결과" 24/700 + 카운트 "34" 24/400 gap8 · 우 정렬 "최신순" 14/400 + 화살표14 gap2
     - **출처 필터** row gap8 · 6칩 pill h32 r100: Youtube(16)·Long Black(8)·Medium(6)·Tistory(6)·EO planet(2)·Publy(2) — 각 [브랜드로고20 + 라벨14/500 + 카운트14/400]
     - 결과 그리드 4열(행간42 열간28 w1092) · **카드 252×232** · 34카드

### 빈 (2087:40125) — content rect @270,8 1642×1080
- 히어로 + 쿼리칩 검색바(동일) + row(좌 CategoryStrip 유지 + 우 컬럼)
- 우 컬럼: 결과 헤더 "'IT 업계 동향' 검색 결과" + 카운트 "0" + 정렬(유지) · **출처필터·그리드 비노출** · 빈문구 "'IT 업계 동향'의 검색 결과가 없습니다." 18/400/-2% #B4B4B4 LEFT
- 헤더↔빈문구 gap14

---

## 섹션 × 요소 대조표

| Figma 섹션/요소(nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 히어로 타이틀 (2087:40320 @465,120) | 713×48 · 32/600/lh150%/-2.5%/CENTER · #FFFFFF | ✅완전 | search-discovery.module.css `.hero` / search-results `.hero` | — (lh150% 인라인 보정 정확) |
| 히어로 상단 오프셋 (y120 abs) | content rect 내부 y120; 토픽바56 아래 ~56px | 🟡부분 | search-discovery/results `.results/.discovery` `padding:120px 0 80px` | 토픽바(56)가 스크롤 밖이라 padding-top 120이 ~56px 과다. `padding-top: ~56px`로 재산정 권장(med) |
| 검색바 디폴트 (2087:40407) | 520×48 r80 · pad8/7/8/20 · surface-100 · border .10 · [아이콘18+input+버튼34] | ✅완전 | search-bar.tsx/.module.css | — |
| 검색바 쿼리칩 (2087:38859) | 520×48 r80 · pad8/20 · [아이콘18+쿼리15/400+X16 #999] | ✅완전 | search-bar.tsx `mode="query"` | — |
| 추천 키워드 칩 6 (2087:40685) | row gap8 · 칩 h32 r100 ghost(.04)/border(.08) · [검색아이콘16+14/500] | ✅완전 | keyword-chips.tsx · chip.module.css `.recommend` | 라벨 카피 6개 일치(constants.ts) · 검색아이콘 일치 |
| CategoryList 헤더 (2087:40320 모든 카테고리) | "모든 카테고리"24/700 + 부제14/400(w176) + divider68 | ✅완전 | category-list.tsx/.module.css | — |
| CategoryList 13항목 (2557:7616~) | h32 pad6/0 15/130/-2.5 · 선택500/#FAFAFA · 비선택400/#999 · w196 | ✅완전 | category-list.module.css `.item/.selected` | 13항목 카피 일치 |
| 세로 divider (Vector161) | 0×561 r0 rgba(255,255,255,.10) | ✅완전 | `.vDivider` min-height561 | — |
| DiscoveryGrid 제목 (2087:40320) | "카테고리별 추천 컨텐츠"24/700 w1092 | ✅완전 | discovery-grid.tsx/.module.css | — |
| DiscoveryGrid 카드 (249×232) | 썸네일249×142 r6 + 배지 + 제목15/500 + 태그13/400 + 클립수14/400 | 🟡부분 | content-card.tsx (공용) | 카드폭 249 측정인데 공용 ContentCard는 252 기준(1fr 채움이라 시각상 흡수) — 미세(low) |
| 결과 헤더 타이틀+카운트 (2087:38900) | "'쿼리' 검색 결과"24/700 + 카운트24/400 gap8 · ‘ ’곡선따옴표 | ✅완전 | result-header.tsx/.module.css | — |
| 결과 정렬 트리거 (2087:38079) | "최신순"14/400/-2% + 화살표14 gap2 보더리스 | ✅완전 | result-header.tsx `.sort` | — |
| **출처 필터 6칩** (2087:38907) | row gap8 · pill h32 r100 ghost(.04) · [로고20+라벨14/500+카운트14/400] · 선택 #FAFAFA bg/#111 라벨 | 🟡부분 | source-filter.tsx · chip `.source.pill` | 구조·타이포·선택상태 일치. **단 로고 자산 5/6 누락**(아래 high) |
| 출처 브랜드 로고 (Youtube/LB/Me/Tistory/EO/Publy) | 실 imageRef 로고(빨강 재생/LB원/Me사각/주황dot/초록EO/보라Publy) | ⚠️틀림 | source-logo.tsx | Youtube만 SVG · 5개는 머리글자 모노그램 폴백(L/M/T/E/P). 실 로고와 불일치(high) |
| 결과 그리드 (2087:38953) | 4열 행간42 열간28 w1092 · 카드252×232 | ✅완전 | results-grid.tsx/.module.css | 34카드 4열 흐름 정확 · 페이지네이션/더보기 없음(프레임도 없음) |
| 카드 로고배지 (Frame1707483317 @6,6) | 30×28 r6 rgba(0,0,0,.32)+blur2 · 내부 로고24 | ✅완전 | content-card.module.css `.sourceBadge` | 위치·블러·반경 정확(단 로고는 위 자산 이슈 상속) |
| 카드 태그칩 (Frame2085668471) | 28h r6 surface-hover(.06) 13/400/160/-2% #CECECE · 2개 | ✅완전 | content-card.module.css `.tag` | — |
| 카드 클립수 (chromecast18 + "N개") | 아이콘18 gap4 14/400/130 #999 | ✅완전 | content-card.tsx `.clipCount` | — |
| CategoryStrip(결과/빈) (2087:38864) | 헤더 "카테고리" + 부제2줄(\n) + divider68 + 13항목 + 세로divider561 | ✅완전 | category-strip.tsx/.module.css | 부제 명시 줄바꿈(\n) 처리됨 |
| 빈 문구 (2087:40185) | "'쿼리'의 검색 결과가 없습니다." 18/400/130/-2% #B4B4B4 LEFT | ✅완전 | empty-results.tsx/.module.css | 곡선따옴표 일치 |
| 빈: 출처필터·그리드 비노출 | 빈에선 미렌더(헤더·카운트0·정렬·카테고리만) | ✅완전 | search-results.tsx `mode==='results'` 조건부 | 정확 |

---

## 인터랙션 체크리스트

| 인터랙션 | Figma 근거 | 구현 | 상태 |
|---|---|---|---|
| 추천 칩 클릭 → 검색 | 칩=쿼리 트리거 | keyword-chips `onSelect`→submit | ✅ |
| 카테고리 항목 클릭 → 필터 | 선택 500/#FAFAFA | category-list/strip `onSelect`+aria-pressed | ✅ |
| 검색 입력 → 디바운스 0.5s → 결과 | 결과 화면 전환 | use-content-search `useDebouncedValue(500)` | ✅ |
| 검색바 포커스 → 최근검색어 드롭다운 | [디자인공백] 명시 | search-bar `focused`→RecentDropdown(blur 지연 닫기) | ✅ (프레임 부재, 파운데이션 패턴) |
| 최근검색어 항목 클릭/삭제 | — | recent-dropdown `onSelect/onRemove` | ✅ |
| 쿼리칩 X(Dismiss) → discovery 복귀 | X16 #999 | search-bar `onDismiss`→input''·source/category 리셋 | ✅ |
| 정렬 드롭다운 열기/닫기 | "최신순"+화살표 트리거 | result-header `open` 토글 + 외부클릭 닫힘 + 3옵션 listbox | ✅ (패널은 [디자인공백] 파운데이션) |
| 정렬 옵션 선택 | 최신순/오래된순/클립많은순 | result-header `onSortChange` | ✅ |
| 출처 칩 토글(재클릭 해제) | 선택=흰 채움 | source-filter `onSelect(isSelected?null:provider)` | ✅ |
| 카드 클릭 → /content/:id | — | content-card `onSelect`→navigate | ✅ |
| 에러 → 재시도 | [디자인공백] | search-results `.error`+retry refetch | ✅ |
| 로딩 → 스켈레톤 | [디자인공백] | grid-skeleton 8셀 | ✅ (파운데이션) |
| 항목 hover | 정적 export 없음 | category item/chip hover 한 단계 강조 | 🟡 추정(노트, gap) |

**결론**: 누락 인터랙션 없음. 토글·패널 열고닫기·탭전환·드롭다운·디바운스 전부 구현됨.

---

## 상태 체크리스트

| 상태 | 구현 | 비고 |
|---|---|---|
| 기본(discovery) | ✅ | 히어로+검색바+칩+카테고리+추천그리드 |
| 결과(results) | ✅ | 헤더+출처필터+그리드 |
| 빈(empty) | ✅ | 출처필터/그리드 비노출 + 빈문구 |
| 로딩(loading) | ✅ | GridSkeleton([디자인공백] 파운데이션) |
| 에러(error) | ✅ | 인라인 재시도([디자인공백]) |
| selected(카테고리/출처/정렬) | ✅ | 색+weight / 흰채움 / medium |
| hover | 🟡 | Figma 정적 export 부재 → 추정 |
| active/focus | ✅ | focus-visible 브랜드 아웃라인 |

---

## High severity 보완점 (즉시 수정 대상)

### H1. 출처 브랜드 로고 자산 5/6 누락 → 모노그램 폴백 (⚠️틀림)
- **Figma**: 2087:38907 출처필터 6칩 — Long Black(LB 흑백원), Medium(Me 흑백사각), Tistory(주황 dot), EO planet(초록 EO), Publy(보라 Publy 배지)는 **실제 imageRef 브랜드 로고**(20×20, 내부 18 r4). 카드 배지(24×24)도 동일.
- **impl**: `entities/content/ui/source-logo.tsx` — Youtube만 인라인 SVG, 나머지 5개는 `PROVIDER_LABELS` 머리글자 모노그램(L/M/T/E/P)으로 폴백. 실 로고와 시각 불일치.
- **수정**: 6개 provider 로고를 정적 SVG/이미지 자산으로 추가(`source-logo.tsx`에 provider별 분기 또는 `public/logos/*`). 측정 박스 20×20(필터)/24×24(배지), 내부 18 r4. Figma export로 imageRef 다운로드 가능. (severity high — 출처 식별성 핵심)

### H2. 히어로 상단 오프셋 ~56px 과다 (pixel-mismatch)
- **Figma**: 히어로 abs y120 (content rect @270,8 내부). 토픽바 `Frame2085668923` h56이 content y0-56(abs y8-64)을 점유 → 히어로는 토픽바 하단(abs y64)에서 **56px** 아래.
- **impl**: `search-discovery/search-results .discovery/.results { padding: 120px 0 80px }`. 토픽바는 AppShell에서 **스크롤 영역 밖**(`.content` 위)에 렌더 → padding-top 120이 토픽바 아래부터 120px = Figma 대비 ~56px 과다 하강.
- **수정**: `padding-top`을 120 → 약 56px(= 120 - 64 토픽바영역)로 재산정. 단 panel y408·검색바 y192 등 내부 간격은 히어로 기준 상대값이라 그대로 유지(margin-top 112/24 불변). search-discovery.module.css L8, search-results.module.css L7. (severity high — 첫 화면 수직 정렬, 모든 검색 상태 공통)

---

## Med / Low 보완점

- **M1 (pixel)**: DiscoveryGrid 카드폭 측정 249 vs 공용 ContentCard 252(결과 기준). 1fr 그리드 셀이 폭을 채워 시각 흡수되나, 그리드 컨테이너 폭(disc 1083 / 카드 249×4+28×3=1080)과 미세 불일치. → 영향 낮음, 현행 유지 가능. `discovery-grid.module.css`.
- **L1 (state)**: 항목/칩 hover가 Figma 정적 export 부재로 추정값(`category-list/strip .item:hover`, `chip .filter/.tag:hover`). 디자인 확정 시 보정 필요(코드 주석 [GAP] 이미 표기).
- **L2 (자산)**: 정렬 패널·로딩 스켈레톤·최근검색어 드롭다운은 프레임 부재([디자인공백]) → surface/shadow 파운데이션 토큰으로 구성. 디자인 확정 전까지 수용.

---

## 종합

- search 페이지는 3프레임(디폴트/결과/빈) 전 섹션이 **빠짐없이 구현**되어 있고, 인터랙션(디바운스·드롭다운·토글·dismiss·재시도)도 누락 없음. 이전 감사가 놓친 하단/인터랙션 영역(출처필터·정렬·빈상태 분기)까지 모두 존재 확인.
- 충실도 미달의 실질 원인은 **자산 1건(출처 로고 5개)** + **수직 오프셋 1건(히어로 ~56px)** 이 핵심(high 2건). 나머지는 미세 픽셀·추정 hover(med/low).
