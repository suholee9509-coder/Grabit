# u7 Library 페이지 — 정밀 충실도 감사 (read-only)

- fileKey: `5GGyKsjXEOpjKMLtUodeSs`
- 감사일: 2026-06-16
- 대상 프레임(풀깊이 실측·렌더):
  - `2117:22041` 컨텐츠 탭 전 섹션 (라이브러리_내 컨텐츠_전체 폴더_시안A)
  - `2117:24721` 인사이트 탭 (source filter row=`2117:24845`)
  - `2117:22576` 폴더 드롭다운 활성화 (= 좌 사이드바 폴더 트리 확장)
  - `2117:23135` 폴더별 뷰 + 브레드크럼 (라이브러리_우측 패널 폴더 선택)
  - `2117:23917` 폴더 트리 토글 (좌 사이드바)
- PNG: `state/fidelity-audit/u7-library/{2117-22041-content-tab,2117-24721-insight-tab,2117-22576-folder-dropdown,2117-23135-folder-detail-breadcrumb,2117-23917-folder-tree-toggle}.png`

## 충실도 추정: 78%

레이아웃·치수·타이포·색상의 정적 충실도는 매우 높음(좌 사이드바 382×1080, 폴더카드 160×160 r16, 컨텐츠 5열 그리드 카드249/썸142, 출처칩 h32, 인사이트 2열 등 픽셀 일치). 감점은 **(1) Sparkle FAB 누락, (2) 폴더 드롭다운 인터랙션 구조 불일치(Figma=사이드바 트리 인라인 확장 vs impl=별도 오버레이), (3) 디자인에 없는 추가 요소(정렬 드롭다운·"선택 모드" 텍스트 버튼), (4) 브레드크럼 위치/AI 노트 GNB 아이콘** 등 인터랙션·구조 항목에서 발생. 정적 픽셀은 ~92%, 인터랙션·전수 구조 포함 시 ~78%.

---

## 섹션 대조표

| Figma 섹션/요소 (nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 셸 콘텐츠 면 (`2117:22043` Rect34960 `fill_TR3R2W`) | 1437w · `#121212` · r8 · x475 y8 | ✅완전 | library-page.module.css `.content` | inset40·shell-bg 일치 |
| 헤더 행 (`2117:22123`/`23216` layout_ET90QA) | row space-between · w1357 · x40 y110 | ✅완전 | `.header` padding-top:110px | 일치 |
| 제목 "라이브러리" (`2117:22125`) | Bold 28/130%/-2.5% `#FFFFFF` | ✅완전 | `.title` | 전체뷰 일치 |
| 폴더별 제목 (`2117:23218` style_NAMIMH) | Bold 28/130%/-2.5% **CENTER** `#FFFFFF` | 🟡부분 | `.title` (left) | Figma textAlign=CENTER, impl 좌측정렬 |
| 서브 "라이브러리를 통해…" (`2117:22126`) | Regular 15/150%/-2.5% `#CECECE` | ✅완전 | `.sub` | 일치 |
| 폴더별 서브 "72개의 컨텐츠" (`2117:23219` style_PDHLEV) | Regular 15/150% `#CECECE` | ✅완전 | headerSub=formatContentCount | 일치 |
| 컨텐츠 추가 버튼 (`2117:22127` Frame6) | `#66FF4B` r8 · pad8/16/8/13 · h34 · 아이콘_더하기 | ✅완전 | `<Button neonLabel leadingIcon=Plus>` | 일치 |
| 폴더 카드 행 (`2117:22137` layout_EFZ6LZ) | row gap11 · x40 y209 · 전체뷰만 | ✅완전 | `.folderRow` + FolderCardGrid | 폴더별뷰에서 미표시(일치) |
| 폴더 추가 카드 (`2117:22140`) | 160×160 r16 · dashed .08 · 원형 pad8 brand12% · 아이콘24 `#66FF4B` · 라벨 16/Medium `#66FF4B` | ✅완전 | folder-card-grid `.addCard/.addCircle/.addLabel` | 일치 |
| 폴더 카드 (`2117:22144` Group) | 160×160 r16 · bg `.04` · 아이콘32 `#999999` x20 y24 · 명 16/Medium `#FAFAFA` x20 y89 · 카운트 14 `#B4B4B4` x20 y118 | ✅완전 | `.folderCard/.folderIcon/.folderName/.folderCount` | 일치 |
| 폴더 카드 더보기 (impl 추가) | Figma 카드에 더보기 아이콘 노드 없음 | ⚠️틀림 | `.more` (opacity:0 hover노출) | Figma엔 카드 내 더보기 글리프 없음 — impl 추가(기능상 필요, 디자인 부재) |
| 구분선 (`2117:22136` Vector449) | w1357 stroke `rgba(255,255,255,.08)` 1px · y411 | ✅완전 | `.divider` | 일치 |
| 출처 필터 행 (`2117:22471` layout_PX96IL) | row align center gap16 · x40 y441 | ✅완전 | source-filter `.row` | 일치 |
| 컨텐츠/인사이트 토글 (`2117:22472`) | column gap10 pad4 h36 pill (Tabs segment sm) | ✅완전 | `<Tabs variant=segment size=sm>` | 일치 |
| 세로 디바이더 (`2117:22480` Vector450) | w0 h28 stroke `rgba(255,255,255,.16)` | ✅완전 | `.divider` (w1px) | 시각 동등 |
| 출처 칩 — 전체 (`2117:22483`) | h32 r6 · selected `#FAFAFA` bg/`#111111` 글자/`#505050` 카운트 | ✅완전 | Chip `.source.selected` | 일치 |
| 출처 칩 — Youtube/Long Black/Medium/EO planet/Publy (`2117:22485…`) | h32 pad10/12/10/10 r6 · `.06` bg/`.08` border · 라벨 `#FAFAFA` · 카운트 `#B4B4B4` · 로고 leadingIcon | ✅완전 | Chip `.source` + SourceIcon | 일치 |
| 검색바 (`2117:22132` layout_SN6HIZ) | 284×38 r100 · pad10/14 · stroke `.1` · placeholder 14/Regular/130%/-2% `#B4B4B4` · x1113 y440(우상단) | ✅완전 | library-page `.searchBar/.searchPlaceholder` | 일치 |
| 정렬 드롭다운 (impl 추가) | **Figma source-filter 행 우측 = 검색바만**, "정렬/최신순" 노드 부재 | ⚠️틀림 | source-filter `sortSlot`+SortLibrary | 디자인에 없는 추가 요소 |
| 컨텐츠 그리드 (`2117:22165` layout_PEV5HP) | column gap42 · w1357 · x40 y507 · 2×(컬럼블록 gap24 → row gap28 5카드) = **5열** | ✅완전 | content-card-grid `.grid` repeat(5) col28 row42 | 일치(5열 확인) |
| 컨텐츠 카드 (`2117:22169`/`22170`) | h232 · 카드폭 249 · column gap14 | ✅완전 | content-card `.card` | 일치 |
| 카드 썸네일 (`2117:22171`) | h142 r6 cover · 소스배지 `2117:22190` 29.64×28 r6 `rgba(0,0,0,.32)` blur2 x6 y6 | ✅완전 | `.thumb/.sourceBadge` | 일치 |
| 카드 제목 (`2117:22174`) | Medium 15/130%/-2.5% `#FAFAFA` 2줄 (w252) | ✅완전 | `.title` line-clamp2 | 일치 |
| 카드 태그칩 (`2117:22177`) | h28 pad10 r6 `rgba(255,255,255,.06)` 13/400/160% | ✅완전 | `.tagChip` | 일치(2개 slice) |
| 카드 클립수 (`2117:22181`) | row gap7 · 아이콘 + 14/Regular `#999999` ("16개") | 🟡부분 | `.count` gap4 + ClipCountIcon | gap 7→4 미세 · "16개" 텍스트 일치 |
| 인사이트 그리드 (`2117:24898`) | 2열 fill · row gap42 col gap28 | ✅완전 | insight-card-grid `.grid` repeat(2) | 일치 |
| 인사이트 카드 (출처 아이콘20+제목 `#B4B4B4` / 메모 `#FAFAFA` 2줄) | 위계 반전 실측 | ✅완전 | insight-card-grid `.title/.memo` | 일치(반전 보존) |
| 좌 사이드바 (`2117:22557` layout_GXQC0P) | 382×1080 r8 `#121212` · x84 y8 | ✅완전 | library-sidebar `.sidebar` | 일치 |
| 사이드바 제목 "내 라이브러리" (`2117:22559`) | Bold 20/130%/-2.5% `#FFFFFF` x20 y20 | ✅완전 | `.title` | 일치 |
| 내컨텐츠/북마크 토글 (`2117:22560`) | column gap10 pad4 h36 pill · x221 y15 | ✅완전 | `<Tabs segment sm>` | 일치 |
| "전체 폴더" select 트리거 (`2117:22571`/`23130` Component19) | 298×38 r6 · pad12/10/12/14 · `.04` bg `.08` border · 라벨 13/Cap1 · chevron | ✅완전 | `.selectTrigger/.selectLabel` (라벨 14) | 라벨 폰트 14 vs Figma 13(Cap1_Rg) 미세 |
| 사이드바 검색 버튼 (`2117:22573`) | 38×38 r6 pad10 `.04` bg · 아이콘 20 | ✅완전 | `.searchBtn` | 일치 |
| 폴더 트리 (`2117:22569`/`23103` Component20) | column gap14 · x20 y143 · w342 | ✅완전 | folder-tree `.tree` | 일치 |
| 폴더 트리 헤더(접힘) | 아이콘18 `#ECECEC` + 명 15/Regular `#ECECEC` + 카운트 14 `#999999` + 구분선 `.08` | ✅완전 | `.folderHead/.folderName/.folderCount/.divider` | 일치 |
| 폴더 트리 헤더(확장) | open 아이콘 + 내부 항목 + 구분선 `#242424` | ✅완전 | FolderOpen + `.dividerExpanded` | 일치 |
| 트리 내부 컨텐츠 항목 | pad12/10 r8 · 제목14/SemiBold `#FAFAFA` 2줄 + 메타[출처18 `#DEDEDE`·점2×2·날짜12 `#767676`] + 썸네일 102×58 r4 | ✅완전 | `.item/.itemTitle/.itemMeta/.itemThumb` | 일치 |
| GNB 좌 레일 (`2117:22538`) | 아이콘_좌측GNB ×5 + **아이콘_노트(`2117:22545` r8 `#242424`)** | 🟡부분 | widgets/sidebar (AppShell) | AI 노트 아이콘 미렌더(게이트ⓐ 의도) |
| 톱바 브레드크럼 (`2117:23909` 셀렉트박스) | "전체 폴더 / 창업가 정신" · `/` `rgba(255,255,255,.16)` SemiBold13 · 활성 `#FAFAFA` 비활성 `#767676` · x475+10 y8 | 🟡부분 | Topbar `<Breadcrumb>` + body `.crumb` | Figma=topbar select-box 단일, impl=topbar+본문 이중 표기 |
| Sparkle FAB (`2117:22574`/`23915`/`23133`) | 44×44 r21 `#1F1F1F` · stroke `rgba(255,255,255,.08)` 1px · Sparkle mini 아이콘 24×24 · x1848 y1024(우하단 고정) | ❌누락 | 미구현 | library-page에 미렌더(게이트ⓐ 주석) |
| 폴더 드롭다운 활성 (`2117:22576`) | 좌 사이드바 폴더 트리 **인라인 확장**(별도 오버레이 아님) | ⚠️틀림 | `.folderDropdown` 오버레이(left110 top140) | 구조 불일치 — 아래 High §2 |

---

## 인터랙션 체크리스트

| 인터랙션 | Figma 근거 | impl 존재 | 동작 | 판정 |
|---|---|---|---|---|
| 컨텐츠/인사이트 탭 전환 | `2117:22472` 토글 + 24721 인사이트 프레임 | ✅ | panelTab swap → ContentCardGrid/InsightCardGrid | ✅ |
| 내컨텐츠/북마크 사이드 탭 | `2117:22560` | ✅ | sideTab → 트리/북마크 빈상태 | ✅ |
| 출처 칩 필터 | `2117:22483…` selected 상태 | ✅ | selectedProvider 클라 필터 | ✅ |
| 폴더 트리 토글(확장/접힘) | `2117:23917`·`22576` 확장 상태 | ✅ | toggleExpanded → 내부 항목 노출 | 🟡 토글+폴더선택이 **동일 클릭**에 결합(folder-tree.tsx onToggle+onSelectFolder) — Figma상 확장과 진입 분리 가능성 |
| 폴더 진입(폴더별 뷰) | `2117:23135` 폴더선택 프레임 | ✅ | openFolder → 제목/그리드 전환·폴더카드 숨김 | ✅ |
| 브레드크럼 "전체 폴더" 복귀 | `2117:23909` `/` 경로 | ✅ | view.openFolder(null) | ✅ |
| "전체 폴더" select 드롭다운 | `2117:22576` | ⚠️ | impl=별도 Dropdown 오버레이 / Figma=사이드바 트리 인라인 확장 | ⚠️ 구조 불일치 |
| 정렬 드롭다운 | **Figma 부재** | ➕ | impl 추가(SortLibrary) | ➕ 디자인 외 |
| 다중선택 진입 | Figma 명시 프레임 부재 | 🟡 | impl="선택 모드" 텍스트 버튼 → toggleSelect | 🟡 디자인 외 진입 UI |
| 다중선택 카드 체크 | u0c 패턴(측정 부재) | ✅ | ContentCard selected 체크 오버레이 | 🟡 픽셀 SoT 부재 |
| 이동 액션바 + 모달 | 측정 프레임 부재 | ✅ | MoveActionBar + MoveToFolderModal | 🟡 파운데이션(측정 부재) |
| 폴더 CRUD(생성/이름변경/삭제) | 측정 프레임 부재 | ✅ | Create/Rename/Delete 모달 | 🟡 파운데이션 |
| 카드 hover | — | 🟡 | content-card hover 미정의(트리 항목만 hover bg) | 🟡 |
| 폴더 카드 더보기 hover | Figma 글리프 부재 | ➕ | `.more` opacity 0→1 hover | ➕ 디자인 외 |
| Sparkle FAB 클릭(AI) | `2117:22574` 존재 | ❌ | 미구현 | ❌ |

## 상태 체크리스트

| 상태 | 구현 | 비고 |
|---|---|---|
| 기본 | ✅ | 컨텐츠/인사이트/폴더별 모두 |
| hover | 🟡 | 트리 항목·폴더카드 더보기만. 컨텐츠/인사이트 카드 hover 없음 |
| active/selected | ✅ | 출처칩 selected · 트리 active · 카드 selected · 탭 active |
| 빈(empty) | ✅ | 컨텐츠0/폴더내0/북마크/인사이트0 분기 |
| 로딩 | ✅ | 스켈레톤(컨텐츠10·인사이트6·사이드3) |
| 에러 | ✅ | "불러오지 못했어요" + 다시 시도 |

---

## High severity 보완점 (즉시 수정 대상)

### H1. Sparkle FAB 미구현 — `❌누락`
- Figma: `2117:22574`(content) / `2117:23915`(folder) / `2117:23133`(dropdown) 모든 라이브러리 프레임에 존재.
  측정: **44×44 · radius 21 · fill `#1F1F1F`(fill_Y03NAH) · stroke `rgba(255,255,255,.08)` 1px · pad9 · 내부 Sparkle mini 24×24 · 위치 x1848 y1024(우하단 고정, content 1437 기준 우측·하단 inset)**.
- impl: `library-page.tsx`에 미렌더(파일 주석 "Sparkle FAB 미렌더(게이트ⓐ)").
- 수정: `library-page.tsx`에 우하단 `position:fixed`(또는 `.content` 기준 absolute) FAB 추가 — `right≈40 bottom≈40`, 44×44 r21 `#1F1F1F` border `rgba(255,255,255,.08)` + Sparkle 아이콘 24. (게이트ⓐ로 의도적 보류라면 디자인 대비 누락임을 사인오프에 명시.)

### H2. "전체 폴더" 드롭다운 인터랙션 구조 불일치 — `⚠️틀림`
- Figma `2117:22576`("폴더 드롭다운 활성화"): select 트리거 활성 시 **좌 사이드바의 폴더 트리가 인라인 확장**(2117:23103 = Component20 트리가 펼쳐진 상태, 별도 오버레이 팝오버 없음). 우측 본문은 변화 없음.
- impl: `library-page.tsx` `folderMenuOpen` → 화면 위 **별도 Dropdown 오버레이**(`.folderDropdown` `left:110 top:140`)를 띄움. 디자인 의도(사이드바 트리 펼침)와 다른 UX.
- 수정: select 트리거 클릭 시 별도 오버레이 대신 사이드바 폴더 트리를 확장/포커스하거나, 사이드바 자체 select가 트리 표시를 토글하도록 재배선. 최소한 오버레이 위치(left110/top140 임의값)를 트리거 기준 앵커로.

### H3. 폴더 트리 토글과 폴더 진입이 단일 클릭에 결합 — `🟡부분(인터랙션)`
- Figma `2117:23917`(토글)·`2117:23135`(진입)는 별개 상태. 트리에서 폴더를 **펼치는 것**과 **폴더별 뷰로 진입**은 분리될 수 있음.
- impl: `folder-tree.tsx` 헤더 버튼 onClick = `onToggle(id)` + `onSelectFolder(id)` 동시 호출 → 한 번 클릭에 확장과 본문 폴더 진입이 함께 일어남(다시 클릭 시 접힘+여전히 진입 상태 유지). 사용자가 "펼치기만" 할 수 없음.
- 수정: 폴더 아이콘/쉐브론 영역=토글, 이름 영역=진입으로 히트영역 분리(Figma 트리 토글 프레임 의도에 맞춤). 또는 단일 클릭=진입, 별도 토글 어포던스 제공.

---

## Med/Low 보완점

- **M1 정렬 드롭다운(디자인 외 추가):** source-filter 행 우측은 Figma상 검색바만 존재(정렬 노드 부재). impl `sortSlot`+`SortLibrary`는 디자인에 없는 추가 — 기획 §5.1.1 근거이나 프레임 미반영. 게이트 사인오프 필요.
- **M2 브레드크럼 이중 표기:** Figma는 topbar select-box(`2117:23909`)에 "전체 폴더 / 창업가 정신" 단일. impl은 Topbar 브레드크럼 + 본문 `.crumb` 둘 다 렌더(library-page.tsx L182). 본문 crumb 제거 검토.
- **M3 AI 노트 GNB 아이콘 누락:** `2117:22545` 아이콘_노트(r8 `#242424` 활성표시)가 GNB 레일에 존재하나 미렌더(게이트ⓐ).
- **M4 "선택 모드" 진입 버튼(디자인 외):** library-page.tsx `.selectMode` 텍스트 버튼은 Figma 부재. 다중선택 진입 UI가 디자인에 명시되지 않음 — 사인오프 필요.
- **L1 폴더별 제목 정렬:** Figma `style_NAMIMH` textAlign=CENTER, impl 좌측. (단 본문 좌측정렬이 일반적이므로 디자인 의도 확인 필요.)
- **L2 select 트리거 라벨 폰트:** Figma 13(Cap1_Rg), impl 14(text-body-3). 미세.
- **L3 카드 클립수 gap:** Figma row gap7, impl gap4. 미세.
- **L4 폴더 카드 더보기 글리프(디자인 외):** Figma 폴더 카드에 더보기 아이콘 노드 없음. impl `.more`(hover 노출)는 CRUD 진입을 위한 추가 — 디자인 부재.

---

## 참고: 색상/토큰 대조(주요)
- 셸 면 `#121212`(fill_TR3R2W/SJ71TF) = `--color-shell-bg` ✅
- 폴더카드 bg `rgba(255,255,255,.04)`(fill_OPXWA7) = `--color-surface-ghost` ✅
- 구분선 `rgba(255,255,255,.08)`(fill_6SUETT) = `--color-border-subtle` ✅
- 확장 트리 구분선 `#242424`(fill_EHLZH3) = `--color-stroke-100` ✅
- 브랜드 `#66FF4B`(fill_CQBY9X/SOJB3Q) ✅ · 원형칩 `rgba(102,255,75,.12)` = `--color-brand-primary-12` ✅
- 출처칩 selected `#FAFAFA`/카운트 `#505050` ✅ · 태그칩 `rgba(255,255,255,.06)` ✅
- FAB `#1F1F1F`(fill_Y03NAH) — 토큰 미등재(누락 요소이므로 추가 시 토큰화 권장)
