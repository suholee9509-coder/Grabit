# Plan: u8-search (검색 — 디폴트 발견 · 결과 · 빈)

> 정본 spec = `docs/units/u8-search/spec.md` (매 턴 reload) · status = `docs/units/u8-search/status.md` (매 턴 갱신)
> Figma SoT(매 턴 view, 픽셀-퍼펙트 1:1): 디폴트 `2087:40320` · 결과 `2087:38847` · 빈 `2087:40125`
> 실측 = `docs/units/u8-search/figma/2087_40320.md` · `2087_38847.md` · `2087_40125.md` (+ .png). **추측 금지 — 실측값만.**
> 실화면 = 프로토타이핑 2087:5987 하위. **컴포넌트 SECTION 2562:7927 미참조.**
> BE RPC = **이미 머지됨**(`supabase/migrations/0012_search.sql`). u8은 **이 RPC를 소비(read)만** — BE는 추가 안 함(검증 픽스만 필요 시).

> ★★ 카디널 룰(제1목표): w·h·padding·gap·radius·border·color(HEX/rgba)·font·lineHeight·weight·shadow·상태를 Figma 실측 그대로 1:1. AI(자동완성/시맨틱/추천 개인화) = 게이트ⓐ 제외 → **결정론 비-AI**.

---

## 0. 결정 요약 (런북 §6 · spec 고정)

- **검색 대상** = 본인 클립 컨텐츠의 **제목·메모·태그** 한국어 FTS (RPC `search_my_content`). 타 user 누출 0(RLS + user_id pin, 0012가 보장 — FE는 그 계약만 호출).
- **디폴트 발견**(검색 전) = 추천 키워드 칩 + 카테고리 리스트 + 카테고리별 추천 그리드. = **콜드스타트 폴백**(결정론 시드, 비-AI). RPC 호출 ❌ — 정적 칩/시드.
- **디바운스 0.5s** → 1회 RPC 호출. **최근 검색어 최대 10개**(localStorage). **쿼리 칩 dismiss** → 디폴트 발견 복귀.
- **결과 카드 클릭** → `/content/:id` (u4 스텁이 받음).
- **AI 자동완성/시맨틱 ❌.** 정렬 옵션은 RPC 계약(`recent`/`oldest`/`most_clips`)으로 한정(프레임은 "최신순" 노출 → 드롭다운 3옵션은 [디자인 공백] = 파운데이션 dropdown + 기획 §5.1).

---

## 1. 파일 트리 (Boundaries 내 only-edit)

```
apps/web/src/
├─ app/
│  └─ app.tsx                          [편집] /search 라우트 1줄 추가(RequireOnboarded 가드). 그 외 무변경.
│
├─ pages/search/                       [신규] 화면 호스트(AppShell + Sidebar activeMenu="search" + Topbar)
│  ├─ index.ts                         배럴: export { SearchPage }
│  ├─ ui/
│  │  ├─ search-page.tsx               AppShell 호스트 · useContentSearch 상태 → discovery|results|empty 분기
│  │  └─ search-page.module.css        본문 면 #121212(셸 연속) — home-page.module.css 거울
│  ├─ search-discovery.contract.test.tsx   디폴트 발견 렌더(칩·카테고리·추천그리드)
│  ├─ search-results.contract.test.tsx     디바운스 0.5s·쿼리칩·필터·정렬·0건빈·카드→상세
│  └─ search-recent.contract.test.tsx      최근검색어 10캡(localStorage)
│
├─ widgets/search-bar/                 [신규] 검색 입력/쿼리칩 + (디자인공백)자동완성 드롭다운 + 최근검색어
│  ├─ index.ts                         export { SearchBar }
│  └─ ui/
│     ├─ search-bar.tsx                디폴트=입력 pill+"검색하기" / 결과·빈=쿼리칩(X dismiss)
│     ├─ search-bar.module.css         520×48 · radius80 · pad(디폴트 8/7/8/20·결과 8/20) — 실측
│     └─ recent-dropdown.tsx           [디자인공백] 최근검색어 패널(파운데이션 Dropdown 패턴)
│
├─ widgets/search-discovery/           [신규] 디폴트 발견(추천칩 + 카테고리리스트 + 추천그리드)
│  ├─ index.ts                         export { SearchDiscovery }
│  └─ ui/
│     ├─ search-discovery.tsx          히어로 + 추천칩 행 + 카테고리패널(좌 리스트 + 우 그리드)
│     ├─ keyword-chips.tsx             추천 키워드 칩 6개(클릭→쿼리 검색) — Chip variant="recommend"
│     ├─ category-list.tsx             세로 카테고리 리스트(헤더+divider+13항목) — 선택/비선택 색·weight만
│     ├─ discovery-grid.tsx            "카테고리별 추천 컨텐츠" 4열 그리드(ContentCard 소비)
│     └─ search-discovery.module.css   패널 row gap62 · 그리드 행42/열28 · 좌176/196 우1083/1092 — 실측
│
├─ widgets/search-results/            [신규] 결과 헤더+정렬 + 출처필터 + 카테고리필터 + 결과그리드
│  ├─ index.ts                         export { SearchResults }
│  └─ ui/
│     ├─ search-results.tsx            결과헤더(타이틀+카운트)+정렬드롭다운 / 출처필터탭 / 결과그리드 / 빈
│     ├─ result-header.tsx             "'<쿼리>' 검색 결과" + 카운트 + 정렬 Dropdown
│     ├─ source-filter.tsx             출처필터 탭(provider별 카운트 배지) — Chip variant="source" pill
│     ├─ category-strip.tsx            좌측 카테고리 필터 스트립(결과/빈 공용 — discovery category-list와 동형, 분리 컴포 재사용)
│     ├─ results-grid.tsx              4열 결과 그리드(ContentCard 소비)
│     ├─ empty-results.tsx             빈 상태("'<쿼리>'의 검색 결과가 없습니다.") — 출처필터·그리드 비노출
│     └─ search-results.module.css     메인컬럼 1092 gap32 · 헤더 space-between · 그리드 행42/열28 — 실측
│
├─ features/content-search/           [신규] 검색 쿼리/디바운스/최근검색어/필터 상태 + RPC 훅
│  ├─ index.ts                         export { useContentSearch, useRecentQueries, SEARCH_CATEGORIES, KEYWORD_CHIPS }
│  ├─ model/
│  │  ├─ use-content-search.ts         디바운스0.5s·쿼리/카테고리/출처/정렬 상태·discovery|results|empty 파생
│  │  ├─ use-recent-queries.ts         localStorage 최근검색어(최대10·중복제거·최신우선)
│  │  └─ constants.ts                  KEYWORD_CHIPS(6) · SEARCH_CATEGORIES(13) · SORT_OPTIONS(3) · provider 라벨맵
│  └─ api/
│     └─ search-queries.ts            useQuery(search_my_content) + useQuery(search_my_content_sources) 훅
│
├─ entities/content/                  [편집-additive] 검색 카드 모델 + ContentCard 표현(재사용 우선)
│  ├─ index.ts                         [편집] SearchContentItem·SourceCount·ContentCard·DiscoveryCard 추가 export
│  ├─ model/
│  │  └─ search.ts                     [신규] SearchContentItem · SourceCount · SearchSort 타입 (RPC 반환 매핑)
│  └─ ui/
│     ├─ content-card.tsx             [신규] 결과/추천 공용 카드(썸네일+제목+태그2+클립수+출처배지) — onSelect(id)
│     └─ content-card.module.css      [신규] 카드 249/252 · 썸네일 142h radius6 · 태그칩·클립수 — 실측
│
└─ shared/api/                        [편집-additive · 경계타입만] 검색 RPC 호출 래퍼
   ├─ index.ts                         [편집] searchMyContent·searchMyContentSources·DEMO_SEARCH export 추가
   ├─ search.ts                        [신규] supabase.rpc('search_my_content'/'..._sources') 래퍼(snake→camel)
   └─ demo-search.ts                   [신규] 콜드스타트/오프라인 폴백 시드(디폴트 발견 그리드·결과·0건) — 비-AI
```

> **신규 토큰 0**: 세 figma 실측의 토큰 갭(히어로 lh150%·순백, 칩 lh130%, 카드제목 등)은 전부 **기존 토큰으로 커버**(`--color-white-pure`·`--text-segment-lg`·`--text-tab-list`·`--text-chip-tag` 등 — §2 확인). lineHeight 130/140/150% 변형은 컴포넌트 module.css에서 인라인 흡수(기존 토큰 수정 ❌, 추가만). 42px 행간 등 레이아웃 고정값은 컴포넌트 상수(인라인).

---

## 2. 컴포넌트 재사용 맵 + 토큰표

### 2-1. shared/ui 재사용 (인스턴스만 — 신규 프리미티브 ❌)

| u8 요소 | shared/ui | 변형/props | 프레임 실측 | 근거 |
|---|---|---|---|---|
| 추천 키워드 칩(6) | `Chip` | `variant="recommend"` `leadingIcon=<SearchIcon16/>` | 32h · pad10/12/10/10 · radius100 · ghost(.04)/border(.08) · 14/500/130%/-2% · #FAFAFA | chip.tsx 주석: recommend=검색 추천칩 2087:40686 1:1 |
| 출처 필터 탭(6) | `Chip` | `variant="source" pill` `leadingIcon=<로고20/>` `count={n}` | 32h · pad10/12/10/10 · radius100 · gap(icon6/count4) · 라벨14/500/130 · 카운트14/400/130 | chip.tsx: source pill = 검색 출처필터 2087:38908 |
| 쿼리 칩(검색바 내부) | **자체 마크업**(검색바 컨테이너가 pill) | Dismiss=`Chip onRemove` 아님 — 검색바 row 내 X 아이콘(16) | 컨테이너 520×48 surface-100/border-default/radius80; 쿼리 15/400/160%/-2.5% #FAFAFA; X 16 #999 | 2087:38859/40137 — 검색바 자체가 칩 호스트 |
| 정렬 드롭다운 | `Dropdown` | `trigger="최신순 ▾"` `items=SORT_OPTIONS` `onSelect` | 라벨 14/400/130%/-2% #B4B4B4 · gap2 · 화살표14 | 2087:38904 / 40182 |
| 검색 입력(디폴트) | `Input` 또는 검색바 자체 row | leadingIcon=검색아이콘 · 우측 "검색하기" Button | placeholder 15/400/160%/-2.5% #B4B4B4 | 2087:40407 |
| "검색하기" 버튼 | `Button` | `variant="primary" size="md" neonLabel` | 34h · pad14/16 · radius80 · #66FF4B · 라벨14/600/130/-2% #000 | 2087:40411 — sidebar CTA와 동일 패턴 |
| 카드 태그칩(카드 내부 2개) | **content-card 내부 span**(Chip 미사용 — 비인터랙티브) | 28h · pad10 · radius6 · surface-hover(.06) · 13/400/160%/-2% #CECECE | grid-card 거울 | recommendation/grid-card.tsx 태그 패턴 재사용 |
| 카테고리 리스트 항목 | **자체 button row**(Tabs 미사용 — 세로 리스트, 배경/언더라인 없음·색+weight만) | h32 · pad6/0 · 15/130%/-2.5%; 선택 500/#FAFAFA · 비선택 400/#999 | 2557:7614 / 2087:38870 / 40148 | Tabs는 가로형 → 세로 리스트는 자체 |
| 로딩 스켈레톤 | `CardSkeleton`(recommendation) **재사용 불가**(다른 슬라이스 entities — cross-import ❌) → content-card 자체 skeleton | grid variant 거울 | [디자인공백] | FSD: entities 동일레이어 cross-slice ❌ |
| 빈/에러 메시지 | 자체(`SectionEmpty` 패턴 거울, cross-import ❌) | 빈문구 18/400/130%/-2% #B4B4B4(실측) | 2087:40185 | 빈은 프레임 확정·에러는 [디자인공백] toast |

> ⚠ FSD 주의: `entities/recommendation`의 `CardSkeleton/GridCard/SectionEmpty`는 **다른 entities 슬라이스 → cross-slice 임포트 금지**. u8 카드/스켈레톤/빈은 `entities/content` + 위젯 자체에 둔다(패턴만 거울).

### 2-2. 토큰표 (실측 → 토큰, 신규 0 — 전부 기존)

**색 (전부 매칭 ✅)**
| 사용처 | HEX/rgba | 토큰 |
|---|---|---|
| 루트 bg | #000000 | `--color-bg` |
| 셸/본문판 bg | #121212 | `--color-shell-bg` |
| 검색바 면 | #1F1F1F | `--color-surface-100` |
| 검색바 border | rgba(255,255,255,.10) | `--color-border-default` |
| 검색버튼 면 | #66FF4B | `--color-brand-primary` |
| 검색버튼 글자 | #000000 | `--color-text-on-primary-black` |
| 칩(키워드/출처) 면 | rgba(255,255,255,.04) | `--color-surface-ghost` |
| 칩 border | rgba(255,255,255,.08) | `--color-border-subtle` |
| 카드 태그칩 면 | rgba(255,255,255,.06) | `--color-surface-hover` |
| 흰 글자(칩/카드제목/쿼리/선택탭) | #FAFAFA | `--color-white` / `--color-text-primary` |
| **히어로 카피(순백)** | #FFFFFF | `--color-white-pure` (※ 존재 확인됨) |
| 보조(카운트/부제/정렬/빈문구) | #B4B4B4 | `--color-text-secondary` / `--color-gray-500` |
| placeholder/비선택탭/클립수/Dismiss | #999999 | `--color-text-tertiary` / `--color-gray-450` |
| 태그칩 글자 | #CECECE | `--color-gray-550` |
| 구분선 | rgba(255,255,255,.10) | `--color-border-default` |
| 썸네일 로고배지 면 | rgba(0,0,0,.32) | (가장 근접 `--color-overlay-black-60`=.6 — .32 없음 → **인라인 rgba(0,0,0,.32)** 1곳, 신규토큰 불요·경미) |

**치수/radius/spacing (전부 매칭 ✅)**
| 실측 | 토큰 |
|---|---|
| 검색바 520×48 / radius80 / pad8·20(결과)·8/7/8/20(디폴트) | `--size-search`(48) · `--radius-search`(80) |
| 칩 32h / radius100 | `--size-chip-sm`(32) · `--radius-pill`(100) |
| 카드 태그칩 28h / radius6 | `--size-chip-tag`(28) · `--radius-sm`(6) |
| 검색버튼 34h / radius80 | `--size-button-md`(34) · `--radius-pill` |
| 검색바 내부 gap6 / 카운트행 gap8 / 정렬행 gap2 | `--space-3`(6)·`--space-4`(8)·`--space-1`(2) |
| 메인컬럼 gap32 / 헤더 gap20 / 결과영역 gap14 | `--space-16`(32)·`--space-10`(20)·`--space-7`(14) |
| 카테고리 항목 h32 / pad6·0 / 헤더 gap10 | `--size-tab-list-item`(32)·`--space-3`(6)·`--space-5`(10) |
| 그리드 행간 **42** / 열간 **28** / 카드내부 14 | 42 = 인라인 상수(스케일 미보유) · 28=`--space-14` · 14=`--space-7` |
| 패널 컬럼 gap62 / 좌 176·196 / 우 1083·1092 / 카드 249·252 / 썸네일 142h | 레이아웃 고정값 = 컴포넌트 상수(토큰 불요) |

**타이포 (전부 기존 토큰 또는 컴포넌트 module.css 인라인 — 신규 0)**
| 실측 | 토큰 / 처리 |
|---|---|
| 히어로 32/600/**150%**/-2.5% CENTER | `--text-title-1` 사이즈 + **lineHeight 150% 인라인**(title-1 lh=131% 불일치) + `--color-white-pure` |
| 카테고리/결과 제목 24/700/130%/-2.5% | `--text-title-3`(24/130%) + font-weight:700 |
| 카운트 24/400/130%/-2.5% | `--text-title-3` 사이즈 + weight400 |
| 빈문구 18/400/130%/-2% | `--text-title-5`(18/130%) + `--letter-spacing-snug`(-2%) |
| 쿼리 텍스트 15/400/**160%**/-2.5% | `--text-segment-lg`(15/160%) 재사용 (또는 인라인 lh160) |
| 카테고리 항목 15/500·400/130%/-2.5% | `--text-tab-list`(15/130%) + weight 500(선택)/400(비선택) |
| 카드 제목 15/500/130%/-2.5% | `--text-tab-list` 재사용(동일 메트릭) |
| 카드 태그칩 13/400/160%/-2% | `--text-chip-tag` ✅ |
| 정렬/카운트/출처카운트 14/400/**130%**/-2% | 14/130 토큰 부재 → **컴포넌트 module.css 인라인**(14/400/130/-2%) |
| 출처명 라벨 14/500/130%/-2% | 인라인(nav-item=160 불일치) |
| 추천 키워드칩 14/500/130%/-2% | Chip recommend 내장 스타일(이미 1:1) |
| 카테고리 부제 14/400/140%/-2% | 인라인 lh140% |

---

## 3. 데이터 배선 (RPC 소비 · 콜드스타트 폴백 · 테스트 셰이프)

### 3-1. RPC 계약 (0012 — FE는 호출만, 변경 ❌)

**`search_my_content(p_query, p_category?, p_source?, p_sort?)`** → rows:
| 반환 컬럼 | 타입 | FE 매핑(camel) |
|---|---|---|
| `content_id` | uuid | `id` |
| `title` | text | `title` |
| `provider` | text | `provider` (= 출처) |
| `clip_count` | bigint | `clipCount` (Number) |
| `tags` | text[] | `tags` (본인 부착 태그 배열) |
| `last_clipped_at` | timestamptz | `lastClippedAt` |

- **인자 정확순**: `p_query`(필수, 한국어) · `p_category`(태그명·전체=null) · `p_source`(provider·전체=null) · `p_sort`(`'recent'`기본/`'oldest'`/`'most_clips'`).
- **빈/공백 query** → 빈 결과(에러 ❌). **미인증** → throw(28000 → PostgREST 401/403).
- 정렬: `recent`=`last_clipped_at` desc · `oldest`=created asc · `most_clips`=clip_count desc. (드롭다운 3옵션 = `SORT_OPTIONS`.)
- ★ **본인 행만**: SECURITY INVOKER + `user_id = auth.uid()` pin → FE는 user 필터 안 보냄(RPC가 강제). 테스트도 본인행만 단언.

**`search_my_content_sources(p_query, p_category?)`** → rows:
| 반환 컬럼 | 타입 | FE 매핑 |
|---|---|---|
| `provider` | text | `provider` |
| `content_count` | bigint | `count` (Number) |

- ⚠ **source 필터 미적용**(모든 출처 배지 동시 표시) · **category 필터 적용**. → 출처필터 탭은 `search_my_content_sources(query, category)`로 배지 카운트, 그리드는 `search_my_content(query, category, source, sort)`로 행.
- 정렬: content_count desc, provider — FE는 프레임 순서(Youtube→Long Black→…)와 무관하게 RPC 반환 순서 또는 카운트순 사용(프레임은 카운트 내림차순과 일치).

### 3-2. 래퍼 (`shared/api/search.ts`) — ingest-clip.ts 거울

```
searchMyContent({ query, category, source, sort }, client=getSupabaseClient())
  → client.rpc('search_my_content', { p_query, p_category, p_source, p_sort })
  → rows.map(snake→camel) : SearchContentItem[]
searchMyContentSources({ query, category }, client)
  → client.rpc('search_my_content_sources', { p_query, p_category })
  → rows.map : SourceCount[]
```
- client null(미구성) → **demo-search 폴백**(오프라인/테스트 결정론, recommendation/feed-api 패턴 거울). isSupabaseReady 분기.
- 에러 → throw(상위 훅이 잡아 toast/로그인 분기 — `mapIngestError` 재사용 가능).

### 3-3. 쿼리 훅 (`features/content-search/api/search-queries.ts`)

```
useSearchResults(query, { category, source, sort })  // useQuery, key=['search','results',query,category,source,sort]
useSearchSources(query, { category })                // useQuery, key=['search','sources',query,category]
```
- `enabled: query.trim().length > 0` → 빈 쿼리는 호출 ❌(디폴트 발견만). staleTime 60s(recommendation 거울).
- 디바운스된 query만 훅 인자로 전달 → **0.5s 내 입력은 1 호출**(아래 3-4).

### 3-4. 디바운스 / 상태 (`use-content-search.ts`)

- 입력 raw `input` → `useDebouncedValue(input, 500)` → `debouncedQuery`.
- **모드 파생**: `debouncedQuery==='' → 'discovery'` · `results.length>0 → 'results'` · `results.length===0 && !pending → 'empty'`.
- 칩/카테고리 클릭 = 즉시 query 세팅(디바운스 우회 가능, 또는 동일 0.5s — 테스트는 디바운스 경로 1회 호출 단언). 검색 실행 시 `useRecentQueries.push(query)`.
- 쿼리칩 dismiss → query='' → discovery 복귀.

### 3-5. 콜드스타트 폴백 (디폴트 발견 — 비-AI · `demo-search.ts`)

- `KEYWORD_CHIPS` = 6개 고정(AI 활용법·시간 관리·AI 업계 소식·커리어 전환·실리콘밸리·창업 스토리) — 프레임 카피 그대로(constants.ts).
- `SEARCH_CATEGORIES` = 13개(전체·면접·자소서…창업·스타트업) — 프레임 그대로.
- **추천 그리드**(카테고리별 추천 컨텐츠) = `DEMO_DISCOVERY` 시드(8카드, 프레임 카피: "쿠팡 디자인 리드…43개" 등) — 결정론·user 식별자 없음. 카테고리 선택 시 시드 필터(비-AI).
- 결과/0건 데모도 `demo-search.ts`에 시드(오프라인 시연·테스트). 모두 **본인 시드만**(no-leak 셰이프).

### 3-6. 테스트 목 셰이프 (MSW 없음 — `vi.mock('@/shared/api')`, home-feed.contract 거울)

```ts
vi.mock('@/shared/api', async (io) => ({
  ...await io(),
  isSupabaseReady: false, supabase: null,            // → demo-search 폴백 경로
  searchMyContent: vi.fn(async ({query,category,source,sort}) => /* 결정론 픽스처 */),
  searchMyContentSources: vi.fn(async ({query,category}) => /* provider 카운트 */),
}));
```
- 픽스처는 **본인 행만**(타 user 행 부재 단언 — 누출 0은 RPC 책임이나 FE 픽스처도 본인행만 구성).
- 필터/정렬은 **인자에 따라 다른 배열** 반환(동어반복 ❌ — category/source/sort 분기 검증).

---

## 4. 빈 / 로딩 / 에러 상태

| 상태 | 트리거 | 렌더 | 프레임/근거 |
|---|---|---|---|
| **discovery(검색전)** | query='' | 히어로 + 추천칩6 + 카테고리리스트13 + 추천그리드(4열) | `2087:40320` 1:1 |
| **results** | query≠'' & rows>0 | 쿼리칩(X) + 카테고리스트립 + 결과헤더(타이틀+카운트) + 정렬 + 출처필터(카운트) + 4열그리드 | `2087:38847` 1:1 |
| **empty(0건)** | query≠'' & rows=0 & !pending | 쿼리칩(X) + 카테고리스트립 + 결과헤더(**카운트 0**) + 정렬 유지 · **출처필터·그리드 비노출** · 빈문구 | `2087:40125` 1:1 |
| **로딩** | results/sources fetch pending | 그리드 스켈레톤(content-card 자체 skeleton, 4열 grid variant) · [디자인공백] 파운데이션 패턴 | spec [state] |
| **에러(검색실패)** | RPC throw | toast "검색에 불러오지 못했어요" + 재시도 · 권한오류→로그인 유도 · [디자인공백] | spec [state] · Toast 패턴 |

- **빈문구 보간 규칙(정확)**: 텍스트 = `‘<쿼리>’의 검색 결과가 없습니다.` — **따옴표 = ‘ ’(U+2018/U+2019 곡선)** · 쿼리 그대로 삽입 · 마침표 포함. 타이포 18/400/130%/-2% #B4B4B4 LEFT. (실측 `2087:40125` §5-2)
- 결과 헤더 타이틀도 동일 곡선 따옴표: `‘<쿼리>’ 검색 결과` (24/700/130%/-2.5% #FAFAFA) + 카운트(24/400/130%/-2.5% #B4B4B4).
- **빈에서도 유지**: 쿼리칩·카테고리스트립(13)·정렬(최신순). **비노출**: 출처필터·결과그리드(조건부 unmount).

---

## 5. 테스트 계획 (Vitest contract — 결정론 · 동어반복 ❌)

`pages/search/*.contract.test.tsx` (home-feed.contract 패턴 · `vi.mock('@/shared/api')` · `renderRoutes`로 /content/:id 프로브):

1. **디폴트 발견 렌더**: query 없이 진입 → 추천칩 6개(`AI 활용법`…`창업 스토리`) + 카테고리 13개(`전체`…`창업 · 스타트업`) + 추천그리드 카드(시드 카피 `쿠팡 디자인 리드…`) 노출. RPC `searchMyContent` **미호출** 단언.
2. **디바운스 0.5s 1회 호출**: `vi.useFakeTimers()` → 입력 연타 후 `advanceTimersByTime(500)` → `searchMyContent` **정확히 1회** 호출(인자 query 확인).
3. **쿼리 칩 dismiss**: 검색 후 쿼리칩(X) 노출 → X 클릭 → discovery 복귀(추천칩 재노출 · 결과그리드 소거).
4. **출처 필터**: 출처탭(예 `Youtube 16`) 클릭 → `searchMyContent` source 인자 반영 → 그리드 재조회(다른 시드 배열). 배지 카운트는 `searchMyContentSources` 반환.
5. **카테고리 필터**: 카테고리 항목 클릭 → category 인자 반영(선택 weight500/#FAFAFA) → 그리드 재필터.
6. **정렬**: 정렬 드롭다운 → `오래된순`/`클립많은순` 선택 → sort 인자(`oldest`/`most_clips`) 반영 호출.
7. **0건 빈 문구**: rows=[] 픽스처 → `‘<쿼리>’의 검색 결과가 없습니다.` **정확 보간**(곡선 따옴표·쿼리값) 단언 · 출처필터·그리드 부재 단언 · 카운트 0 · 정렬/카테고리스트립 유지.
8. **카드 → 상세**: 결과 카드 클릭 → `/content/:id` 라우팅 도착(프로브 `route:content:<id>`).
9. **최근검색어 10캡**: 11개 검색 push → localStorage 최근목록 = **최신 10개**(중복 제거·최신 우선·11번째 밀려남).
10. **본인행만**: 픽스처를 본인행만 구성 → 렌더 결과에 타 user 식별자/행 부재(누출 0 셰이프 단언).

게이트: `tsc -b` 0 · `lint` 0 · `lint:fsd` 0 · 콘솔 0. (UI) `/design-review` 3프레임 1:1 PASS + 스크린샷(디폴트/결과/빈).

---

## 6. Boundaries (위반 시 정지)

- **only-edit**: `pages/search/**` · `widgets/search-bar/**` · `widgets/search-results/**` · `widgets/search-discovery/**` · `features/content-search/**` · `entities/content/**`(additive — 검색 카드 모델/표현) · `shared/api/**`(additive — 검색 래퍼/데모만) · `app/app.tsx`(/search 라우트 1줄).
- **u0b/u0c 미접촉**: 토큰(`app/styles/**`) 수정 ❌(추가도 본 유닛 불요 — §2 신규 0) · `shared/ui/**` 프리미티브 수정 ❌(인스턴스만) · **앱셸 구조 변경 ❌**.
- **GNB**: 검색 라우트 **링크/활성만**(`Sidebar activeMenu="search"`). 메뉴 구성·탭 변경 ❌. (※ 실측 빈 프레임 GNB는 5탭(대시보드 포함)이나 **파운데이션 Sidebar는 FD1 4탭이 SoT** — spec 비회귀: 대시보드 ❌ 유지. GNB 자체는 u0c 소유 → u8은 미변경.)
- **frozen 미접촉**: 0001-0012 마이그레이션/RLS/뷰 변경 ❌(읽기는 additive RPC 호출만). 0012는 **이미 머지** — FE 소비만.
- **cross-slice 금지**: `entities/recommendation`의 카드/스켈레톤/상태 임포트 ❌(동일 레이어) → 패턴 거울로 `entities/content`+위젯에 자체 구현.
- **out of scope(게이트ⓐ 제외)**: AI(자동완성/시맨틱/추천 개인화) ❌ · 대시보드 ❌ · 결제/페이월 ❌ · 아티클 클리핑 ❌.
- **FSD 보존**: 하향 임포트만(app→pages→widgets→features→entities→shared) · 배럴 경유 · 동일레이어 cross-slice ❌.
- main 직접 푸시 ❌ · blast radius = `feat/u8-search`.

---

## RPC 계약 요약 (한눈)

- `search_my_content(p_query, p_category=null, p_source=null, p_sort='recent')` → `{content_id, title, provider, clip_count, tags[], last_clipped_at}[]` · 본인행만(INVOKER+uid pin) · 빈쿼리→빈결과 · 미인증→401 · 정렬 recent/oldest/most_clips · FTS(simple)+ILIKE(제목+메모+태그).
- `search_my_content_sources(p_query, p_category=null)` → `{provider, content_count}[]` · **source 미적용·category 적용**(모든 출처 배지 동시) · 카운트 내림차순.
- FE: 그리드 = `search_my_content`(query·category·source·sort) · 출처배지 = `search_my_content_sources`(query·category). 둘 다 디바운스된 query, `enabled = query≠''`.

## 리스크 / 디자인 공백

1. **출처 로고 자산** — 6개 provider 로고(Youtube #ED1D24 SVG · Long Black/Medium/Tistory/EO planet/Publy imageRef). 실제 자산 URL은 RPC `provider` 문자열 → 클라 로고맵 필요. [디자인공백/자산] provider→로고 매핑 테이블(constants), 미보유 시 첫글자 폴백. 픽셀-퍼펙트 위해 figma download_figma_images로 추출 권장.
2. **썸네일 로고 배지** rgba(0,0,0,.32)+blur(2px) — .32 오버레이 토큰 부재 → 인라인 1곳(경미, 신규토큰 불요).
3. **정렬 3옵션 라벨** — 프레임은 "최신순"만 명시. `오래된순`/`클립많은순` 라벨은 [디자인공백] = 기획 §5.1 + 파운데이션 Dropdown. RPC sort 키와 1:1(`recent`/`oldest`/`most_clips`).
4. **자동완성/최근검색어/스켈레톤/에러 toast** — 프레임 미존재 [디자인공백] → 파운데이션 `Input`/`Dropdown`/`Toast` 패턴으로만(신규 스타일 생성 ❌).
5. **카테고리=태그 매핑** — RPC category=per-user 태그명(ADR-0002 #8). 프레임 13 카테고리(`면접 · 자소서` 등 중점 라벨)가 실제 태그명과 1:1 매칭 안 될 수 있음 → 콜드스타트/실데이터 간 카테고리 키 정합은 데이터 의존(시드는 프레임 라벨 사용, 실RPC는 태그명 전달). 리스크: 실데이터 0건 가능 → 빈 상태로 graceful.
6. **결과 4열 vs spec "3열"** — spec L1/역할은 "3열" 언급하나 **figma 실측 = 4열**(252×4+28×3=1092). **카디널 룰 = 4열**(실측 우선). plan은 4열 확정.
7. **GNB 5탭 실측 vs FD1 4탭** — 빈 프레임 GNB는 대시보드 포함 5탭이나 파운데이션 Sidebar(u0c)=4탭 SoT·spec 비회귀(대시보드 ❌). u8은 GNB 미변경 → 4탭 유지(불일치는 u0c 소유 영역, u8 범위 밖).
