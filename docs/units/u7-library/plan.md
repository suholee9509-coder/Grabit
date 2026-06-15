# u7-library — 빌드 플랜 (FE 퍼블리싱 + BE 배선)

> 정본 = spec.md(매 턴 reload) · 디자인 SoT = Figma 프레임 `2117:22041`/`24721`/`22576`/`23135`/`23917`(실화면 = 프로토타이핑 2087:5987 하위 · 컴포넌트 SECTION 2562:7927 비정준 → **보지 말 것**) · 측정 SoT = `docs/units/u7-library/figma/*.md` · BE = `supabase/migrations/0011_library_folders.sql`(이미 머지·소비/확장만).
>
> ★★ **카디널 룰(제1목표)**: 모든 UI는 Figma 프레임과 **픽셀단위 1:1**(w·h·padding·gap·radius·border·color HEX/rgba·font·lineHeight·weight·shadow·상태). Figma MCP 실측 그대로 — 측정 .md의 값만 사용·추측 금지. 측정에 없는 값은 [디자인 공백]으로 u0c 파운데이션 패턴 적용(임의 수치 ❌).
>
> **게이트ⓐ 제외 → 미렌더(죽은 UI ❌)**: ① 좌측 사이드바 토글의 `AI 노트` 탭(좌측은 `내 컨텐츠`/`북마크`만) · ② `Sparkle mini` FAB(44×44 #1F1F1F r21 우하단) · ③ GNB `아이콘_노트`(노트 nav item). 우측 패널 토글은 `컨텐츠`/`인사이트`만(AI 노트 탭 제거).

---

## 0. 전제 / 검증된 사실 (착수 전 확인 완료)

| 사실 | 출처 | 결론 |
|---|---|---|
| 0011 RPC 7종 이미 머지 (`create_folder`·`rename_folder`·`soft_delete_folder`·`move_clips_to_folder`·`library_folder_counts`·`library_source_counts`·`library_cards`) | `0011_library_folders.sql` | BE는 **신규 마이그레이션 불필요** — RPC 호출 래퍼만 작성. **§Boundaries: 0011/u0b 마이그레이션 미수정.** |
| `folders` 테이블·`clips.folder_id`·max20 트리거·RLS는 u0b(0003/0004)에 존재 | 0011 주석 §u0b ALREADY | 소비만. (DM2 = `clips.folder_id` 부착 확정 — reversible.) |
| GNB Sidebar는 **router link가 아니라 `onMenuSelect(key)` 콜백** + `activeMenu` prop | `widgets/sidebar/ui/sidebar.tsx` L24·47·103 | `/library` 링크 = 페이지에서 `onMenuSelect`→`navigate('/library')`, `activeMenu="library"`. **Sidebar 컴포넌트 미수정.** |
| `library_*` RPC 반환 = snake_case 테이블 셰이프 | 0011 returns table | `content-read.ts` toXxx 매퍼 패턴 거울 → camelCase DTO. |
| 컨텐츠 상세 = u4 `/content/:id` 라우트 존재(가드 없음) | `app/app.tsx`, `pages/content-detail/index.ts` | 카드 클릭 = `navigate('/content/'+contentId)`. **u4 surface 미수정.** |
| 테스트 = vitest + RTL + MemoryRouter + TanStack Query, `vi.mock('@/shared/api')`로 supabase null → **demo 시드 폴백** | `content-detail.contract.test.tsx` | MSW 대신 **`vi.mock` + demo-data 폴백** 패턴 따름(프로젝트 정합). |
| 검증 스크립트 | `apps/web/package.json` | `tsc -b`·`eslint .`·`steiger ./src`(lint:fsd)·`vitest run`. |
| tokens.css = 측정값 거의 전부 보유 | `app/styles/tokens.css` | 신규 토큰 3종만(§2-C). 나머지 매핑 사용. |

**그리드 열 수(★Figma 실측 우선 — CLAUDE.md 충돌규칙 "무엇=Figma"):**
- 컨텐츠/폴더별 그리드 = **행당 5열 fill**(`2117:22041` §6·`2117:23135` §7 실측: row gap28·그룹 gap42·행간 gap24, 카드 h232·내부폭249). 역할 명세 "2열"과 불일치 → **Figma 5열 채택**.
- 인사이트 그리드 = **2열×5행**(`2117:24721` §8 실측: row gap42·col gap28, 카드 thumb h142). (컨텐츠 5열 ↔ 인사이트 2열 — 탭별 그리드 다름. 실측 그대로.)

---

## 1. 파일 트리 (FSD · 배럴 경유 · 하향 임포트만)

> 모두 `apps/web/src/` 하위 절대경로. 신규(＋) / 수정(~) / 미접촉(=). Boundaries(§6)와 1:1.

```
apps/web/src/
├─ app/
│  └─ app.tsx                                              ~ /library 라우트 추가(RequireOnboarded 래핑) ※GNB 링크는 페이지 onMenuSelect로
├─ pages/
│  └─ library/                                             ＋ 페이지(셸 호스트 + 라우팅 컨텍스트)
│     ├─ index.ts                                          ＋ 배럴: export { LibraryPage }
│     ├─ ui/
│     │  ├─ library-page.tsx                               ＋ AppShell+Sidebar(activeMenu=library)+Topbar 호스트, 라우트 상태(폴더·탭·출처·정렬) 보유
│     │  └─ library-page.module.css                        ＋ 본문 레이아웃(폭1437·inset40·헤더110→폴더카드→구분선411→필터행441→그리드507)
│     ├─ model/
│     │  └─ use-library-view.ts                            ＋ 뷰 상태 머신(folderId·tab(컨텐츠/인사이트)·source·sort·selection) — URL/로컬 동기화·상세 복귀 시 상태 유지([non-regression])
│     └─ library.contract.test.tsx                         ＋ FE 계약 테스트(§5)
├─ widgets/
│  ├─ library-sidebar/                                     ＋ 좌측 "내 라이브러리" 사이드바(382×1080)
│  │  ├─ index.ts · ui/library-sidebar.tsx · *.module.css  ＋ 제목·내컨텐츠/북마크 토글·전체폴더 select+검색버튼·폴더리스트/트리 슬롯
│  ├─ folder-tree/                                         ＋ 폴더 트리(접힘/펼침 — 2117:23917)
│  │  ├─ index.ts · ui/folder-tree.tsx · *.module.css      ＋ 폴더 헤더행(open/closed 아이콘18·명15·카운트14)+확장 시 내부 컨텐츠 항목(pad12/10 r8·썸네일102×58 r4)
│  ├─ folder-card-grid/                                    ＋ 본문 폴더 카드 행(160×160 r16 · 폴더추가 카드)
│  │  ├─ index.ts · ui/folder-card-grid.tsx · *.module.css ＋ +추가카드(dashed stroke·원형+칩 brand12%)+폴더카드×N(아이콘32·명16·N개의컨텐츠14)
│  ├─ content-card-grid/                                   ＋ 컨텐츠 카드 그리드(5열 fill · h232)
│  │  ├─ index.ts · ui/content-card-grid.tsx · *.module.css ＋ 카드(썸네일249×142 r6·소스배지 blur·제목15·태그칩 h28·N개 메타)+빈/로딩/에러 슬롯
│  ├─ insight-card-grid/                                   ＋ 인사이트 카드 그리드(2열×5행)
│  │  ├─ index.ts · ui/insight-card-grid.tsx · *.module.css ＋ 카드(썸네일 h142·출처행+제목14 #B4B4B4·메모발췌 14/lh160 #FAFAFA)
│  └─ source-filter/                                       ＋ 컨텐츠/인사이트 토글 + 세로구분선 + 출처 카운트 칩 행
│     ├─ index.ts · ui/source-filter.tsx · *.module.css    ＋ 토글(h36·선택#363636)·디바이더·칩(전체 selected#FAFAFA / 출처 unselected rgba.06+border.08)
├─ features/
│  ├─ create-folder/        ＋ 폴더 생성(modal+input·최대20 안내·중복/공백 차단·낙관적+롤백·toast) → create_folder RPC
│  ├─ rename-folder/        ＋ 폴더 이름변경(modal·기존명 프리필) → rename_folder RPC
│  ├─ delete-folder/        ＋ 폴더 삭제(확인 다이얼로그·folder_id NULL해제 안내) → soft_delete_folder RPC
│  ├─ move-to-folder/       ＋ 다중선택→폴더 이동(card selected·선택카운트·액션바·폴더선택 modal) → move_clips_to_folder RPC
│  ├─ filter-by-source/     ＋ 출처 클릭 시 그리드 필터(selected 칩 강조) + library_source_counts 소비
│  ├─ sort-library/         ＋ 정렬 dropdown(최신/오래된/클립많은 = recent/oldest/most_clips)
│  └─ switch-library-tab/   ＋ 컨텐츠↔인사이트 우측 토글(본문 그리드 스왑) + 좌 내컨텐츠/북마크 탭(북마크=UI+빈상태)
│     (각: index.ts · ui/*.tsx · *.module.css · model/use-*.ts)
├─ entities/
│  ├─ folder/   ~ model/types.ts에 contentCount(폴더별 N) 필드 추가 + 배럴 유지(Folder는 그대로)
│  ├─ content/  ~ model/types.ts에 LibraryCard 표현 타입(content_id·title·thumbnail·provider·tags·grabCount) 추가
│  └─ clip/     = (insight 발췌는 LibraryCard/InsightCard 표현 타입으로 — clip 모델 미변경)
└─ shared/
   └─ api/
      ├─ index.ts            ~ library RPC 래퍼·DTO·demo 시드 export 추가
      ├─ library.ts          ＋ 7 RPC 호출 래퍼(create/rename/softDelete/moveClips/folderCounts/sourceCounts/libraryCards) + snake→camel 매퍼
      ├─ types.ts            ~ LibraryCardDto·InsightCardDto·FolderCountDto·SourceCountDto·LibrarySort 추가
      └─ demo-data.ts        ~ DEMO_LIBRARY_CARDS·DEMO_INSIGHTS·DEMO_FOLDER_COUNTS·DEMO_SOURCE_COUNTS(콜드스타트/테스트 폴백)
```

> **위젯 데이터-비의존 원칙**: `*-grid`·`source-filter`·`library-sidebar`·`folder-tree`는 **순수 프레젠테이션**(props in / 콜백 out). fetch·RPC·라우팅은 `pages/library` + `features/*`가 보유 → 위젯은 픽셀-퍼펙트 마크업에만 집중(테스트·재사용 용이, FSD 하향 준수).

---

## 2. 컴포넌트 재사용 맵 + 토큰 표

### 2-A. u0c `shared/ui` 재사용 (신규 프리미티브 ❌)
| 사용처 | shared/ui | 비고 |
|---|---|---|
| 폴더 CRUD·다중선택 폴더선택 다이얼로그 | `Modal`(width 기본582·title·footer) | [디자인 공백] → u0c 패턴 |
| 폴더명 입력(생성/이름변경) | `Input` | 공백/중복 검증은 feature model |
| 정렬 선택 | `Dropdown`(items·onSelect) | 최신/오래된/클립많은 |
| 출처 칩·태그 칩 | `Chip`(variant) | selected/unselected 상태 매핑(§2-C) |
| 컨텐츠/인사이트·내컨텐츠/북마크 토글 | `Tabs` 또는 `Toggle` | 세그먼트 pill(h36·item h28) |
| 브레드크럼 `전체 폴더 / <폴더명>` | `Breadcrumb`(items) | 폴더별 뷰 헤더 |
| 카드 면(선택 상태) | `Card` | 다중선택 selected 변형 |
| 토스트(이동/삭제 성공·실패 롤백) | `Toast`(success/error) | 낙관적 업데이트 피드백 |
| `컨텐츠 추가` CTA·`폴더 추가` | `Button`(primary·neonLabel) | h34 r8 #66FF4B |
| 프로필 아바타 | `Avatar` | 좌 GNB(셸 기존) |

### 2-B. u4 / 셸 재사용
| 재사용 | 출처 | 방식 |
|---|---|---|
| 앱 셸 레이아웃 | `widgets/app-shell`(AppShell) | sidebar/topbar/children 슬롯 — **미수정** |
| 좌 GNB(4탭) | `widgets/sidebar`(Sidebar) | `activeMenu="library"` + `onMenuSelect`→navigate — **미수정** |
| 상단 톱바 | `widgets/topbar`(Topbar) | 폴더별 뷰 브레드크럼은 톱바 셀렉트 영역 사용(`2117:23135` §2-1) — Topbar props 범위 내, 불가 시 본문 헤더 브레드크럼으로 |
| 카드 클릭 → 상세 | `pages/content-detail`(`/content/:id`) | `navigate('/content/'+contentId)`(라우팅만) — **u4 surface 미수정** |
| 콘텐츠/태그/시간 포맷 | `entities/content`·`entities/clip` 기존 포맷터(`formatGrabCount` 등) | `N개의 컨텐츠`·`15개` 렌더 |
| 폴더 목록 fetch(기본) | `shared/api`(`fetchFolders`) | 트리/select 초기, 카운트는 `library_folder_counts`로 보강 |

### 2-C. 토큰 표 (측정 → tokens.css · 픽셀-퍼펙트)
| 측정 | 값 | 토큰 |
|---|---|---|
| 캔버스 bg / 셸 면 | `#000000` / `#121212` | `--color-bg` / `--color-shell-bg` |
| 폴더카드·토글·select·선택 사이드카드 bg | `rgba(255,255,255,.04)` | `--color-surface-ghost` |
| 출처칩 unselected·태그칩 bg | `rgba(255,255,255,.06)` | `--color-surface-hover` |
| 칩/카드/구분선 보더·폴더추가 stroke | `rgba(255,255,255,.08)` | `--color-border-subtle` |
| 검색바·프로필 프레임 보더 | `rgba(255,255,255,.1)` | `--color-border-default` |
| 세로 디바이더·브레드크럼 `/` | `rgba(255,255,255,.16)` | `--color-border-breadcrumb-sep` |
| 폴더(A) 하단 구분선 | `#242424` | `--color-stroke-100` |
| 선택 탭 채움(내컨텐츠·컨텐츠·인사이트활성) | `#363636` | `--color-surface-tab-selected` |
| 선택 출처칩(전체) 채움 / 글자 / 카운트 | `#FAFAFA` / `#111111` / `#505050` | `--color-white` / `--color-text-on-light` / `--color-chip-count-selected` |
| brand CTA·폴더추가 글자 | `#66FF4B` | `--color-brand-primary` |
| CTA 위 글자 | `#121212` | `--color-text-on-primary-alt` |
| 로그인 pill bg / 글자 | `#EFEFEF` / `#171717` | `--color-btn-light-solid` / `--color-text-on-light-solid` |
| 폴더 리스트 명 | `#ECECEC` | `--color-gray-700` |
| 사이드 카드 출처명 | `#DEDEDE` | `--color-gray-575` |
| 검색 placeholder·폴더 카운트·출처칩 카운트(비선택)·인사이트 제목 | `#B4B4B4` | `--color-gray-500` / `--color-text-secondary` |
| 설명문·태그칩 글자 | `#CECECE` | `--color-gray-550` |
| 비선택 탭·메타카운트·dot·트리 카운트 | `#999999` | `--color-text-tertiary` / `--color-gray-450` |
| 브레드크럼 비활성·날짜 | `#767676` | `--color-breadcrumb-inactive` |
| 검색바·select·검색버튼 h | 38 | `--size-search-sm` / `--size-select` |
| 토글 컨테이너 h / item h | 36 / 28 | `--size-tab` / `--size-tab-item` |
| 출처칩 h / 태그칩 h | 32 / 28 | `--size-chip-sm` / `--size-chip-tag` |
| CTA h / 로그인 h | 34 | `--size-button-md` |
| 브레드크럼 칩 h | 26 | `--size-breadcrumb-chip` |
| 칩/select/썸네일 radius | 6 | `--radius-sm` |
| 셸/카드/CTA radius | 8 | `--radius-md` |
| 사이드 카드 썸네일 radius | 4 | `--radius-xs` |
| 폴더 카드 radius | 16 | `--radius-xl` |
| pill(검색바·토글·로그인) | 100 | `--radius-pill` |
| 프로필 프레임 radius | 10 | `--radius-10` |
| 그리드 행간 / 그룹간 / 행내 gap | 24 / **42** / 28 | `--space-12`(24)·**42 인라인/신규**·`--space-14`(28) |
| Pretendard 전 타이포 | — | `--font-family-base` + weight 토큰(원문 lh/ls 인라인 분기) |

**신규 토큰(3종 — 측정 미보유, PM 확인 후 `tokens.css` 추가):**
1. `--color-brand-primary-12: rgba(102,255,75,.12)` — 폴더추가 카드 원형 + 칩 bg.
2. `--color-overlay-black-32: rgba(0,0,0,.32)` — 컨텐츠 카드 썸네일 소스/재생 배지 bg(+ `backdrop-filter: blur(2px)` 인라인).
3. `--space-grid-row: 42px`(또는 인라인 42) — 그리드 행간/그룹간(스케일 40·48만 보유).

**★ FD3 흰색 충돌(PM/게이트ⓒ 결정 대상):** `라이브러리` 타이틀(28)·`내 라이브러리` 사이드바 제목(20)·선택 탭 글자가 실측 **`#FFFFFF` 순백**. 토큰 정책 = 흰=`#FAFAFA`(`--color-white`), 순백 토큰 `--color-white-pure`(#FFFFFF) 존재. → **픽셀-퍼펙트 우선이면 해당 사용처에 `--color-white-pure` 적용**(기본 채택, 게이트ⓒ 사인오프). 그 외 흰(카드 제목·메모·폴더명)은 `--color-white`(#FAFAFA) 유지(실측대로 분기).

---

## 3. 데이터 배선 (0011 RPC 소비 · 본인 행만 RLS · demo 폴백)

### 3-A. RPC 래퍼 (`shared/api/library.ts` — `content-read.ts` 매퍼 패턴 거울)
| 래퍼(camel) | RPC | 인자 | 반환(camel DTO) | 용도 → L1 |
|---|---|---|---|---|
| `createFolder(name)` | `create_folder(p_name text)` | name | `FolderRow`(id·name) | 생성 → L1-e |
| `renameFolder(id,name)` | `rename_folder(p_folder_id uuid, p_name text)` | id·name | `FolderRow`\|null(0행=no-op) | 이름변경 → L1-e |
| `softDeleteFolder(id)` | `soft_delete_folder(p_folder_id uuid)` | id | `FolderRow`\|null | 삭제(folder_id NULL해제) → L1-e |
| `moveClipsToFolder(contentIds[],folderId?)` | `move_clips_to_folder(p_content_ids uuid[], p_target_folder_id uuid=null)` | contentIds·folderId(NULL=detach) | `number`(이동수) | 다중선택 이동 → L1-e |
| `getFolderCounts()` | `library_folder_counts()` | — | `{folderId,name,contentCount}[]` | 폴더별 N개 → L1-d |
| `getSourceCounts(folderId?)` | `library_source_counts(p_folder_id uuid=null)` | folderId(NULL=전체) | `{provider,contentCount}[]` | 출처 카운트 → L1-c |
| `getLibraryCards(folderId?,sort?)` | `library_cards(p_folder_id uuid=null, p_sort text='recent')` | folderId·sort('recent'\|'oldest'\|'most_clips') | `{contentId,title,thumbnailUrl,provider,tags[],grabCount,lastClipAt}[]` | 카드/정렬 → L1-a/c/d |

> **호출 방식**: `supabase.rpc('create_folder', { p_name })` 등. snake_case 인자 키 **정확히 0011 시그니처대로**(`p_name`/`p_folder_id`/`p_name`/`p_content_ids`/`p_target_folder_id`/`p_folder_id`/`p_sort`). 반환 row는 모듈 내 `toLibraryCard`/`toFolderCount`/`toSourceCount` 매퍼로 camel 변환.
> **인사이트 탭 데이터**: 본인 클립 메모 발췌 = 본인 read(sanitized 불필요·내 데이터). 0011은 인사이트 전용 RPC 미제공 → **`getLibraryCards`(+ 메모/insight 필드) 또는 별도 read 필요**. → **[OPEN-A]**: 인사이트 카드의 메모 발췌 소스. 잠정 = `library_cards` 반환 + 본인 클립 메모(콘텐츠별 대표 메모)를 페이지에서 합성, 미흡 시 demo 폴백. 타인 공개 인사이트 혼입 시에만 ADR-0002 #3 sanitized(`getContentSocialClips`) 적용. **PM 확인.**

### 3-B. 훅 (TanStack Query — 프로젝트 정합)
- `useLibraryCards(folderId, sort)` → `getLibraryCards`. queryKey `['library','cards',folderId,sort]`.
- `useFolderCounts()` → `getFolderCounts`. 좌 사이드바 트리/select·폴더 카드 N개.
- `useSourceCounts(folderId)` → `getSourceCounts`. 출처 필터 칩 카운트.
- **폴더 mutations**(create/rename/delete/move): `useMutation` + **낙관적 업데이트**(즉시 UI 반영 → 실패 시 `onError` 롤백 + error Toast). move/delete 성공 시 `invalidate(['library'])`.
- **검색바 = 입력 진입점만** → onSubmit/Enter 시 `navigate('/search?q=...')`(u8). 결과 화면 미구현(spec out of scope).

### 3-C. RLS·누출 0 (소비 검증, 신규 RLS ❌)
- 모든 RPC `security invoker` → `auth.uid()` 본인 행만. cross-user `clips`/`folders` 직접 쿼리 **금지**(RLS=self → 0행). 누출 0 정본 = u0b pgTAP(`rls-isolation`/`derived-api-no-leak`) — 본 단위 재단언 ❌(동어반복 회피).
- move 대상 폴더 비소유/미존재 = `23503`, max20 초과 = `23514`, 공백/중복명 = `23514`, 미인증 = `28000` → `mapIngestError` 패턴 확장(`shared/api/errors.ts` 참고)으로 사용자 문구 매핑.

### 3-D. demo 폴백 (`demo-data.ts` — supabase null/콜드스타트/테스트)
- `DEMO_FOLDER_COUNTS`(창업가 정신32·피그마 실습 강의22·디자인 트렌드8 = 측정/명세 카운트) · `DEMO_SOURCE_COUNTS`(전체32·Youtube16·Long Black8·Medium6·EO planet2·Publy2) · `DEMO_LIBRARY_CARDS`(태그·grabCount·provider) · `DEMO_INSIGHTS`(썸네일+메모발췌). 폴더카드 카피는 측정상 모두 "32개의 컨텐츠"이나 **데이터=32/22/8 우선**(명세).

---

## 4. 빈 / 로딩 / 에러 / 최대20 상태 ([디자인 공백] → u0c 파운데이션)

| 상태 | 트리거 | 표면(u0c) |
|---|---|---|
| **빈①** 폴더 0개 | `getFolderCounts`=[] | 폴더 카드 행 = `폴더 추가` 카드만 · 좌 트리 빈 |
| **빈②** 컨텐츠 0개(전체) | `getLibraryCards`(null)=[] | 그리드 빈상태 + `컨텐츠 추가` 유도(콜드스타트=확장 설치 유도, `ExtensionInstallModal` 재사용 가능) |
| **빈③** 폴더 내 0개 | `getLibraryCards`(folderId)=[] | 폴더 컨텍스트 빈상태 + 다른 폴더/전체 이동 안내 |
| **빈④** 인사이트 0건 | 인사이트 탭 데이터=[] | 인사이트 빈상태 문구 |
| **빈⑤** 북마크 0건 | `북마크` 탭(DM-bookmark 옵션1) | **UI 탭 + 빈/플레이스홀더만**(데이터 배선 보류) |
| **로딩** | query pending | 카드 그리드 스켈레톤·폴더 카드 스켈레톤·트리 스켈레톤(u0c 패턴) |
| **에러** | fetch 실패·폴더작업 실패 | 에러 표면 + 재시도 / 낙관적 작업 실패 = 롤백 + error Toast |
| **최대20 도달** | 활성 폴더 ≥20 (또는 `23514`) | `폴더 추가` 비활성 + 안내 문구(생성 모달 진입 차단) |

> 빈/로딩/에러는 측정 프레임에 없음 → **u0c 표면·문구로 일관 렌더**(임의 비주얼 ❌). 게이트ⓒ에서 시각 확인.

---

## 5. 테스트 계획

### 5-A. `library.contract.test.tsx` (FE · `pages/library`) — `content-detail.contract.test.tsx` 패턴
`vi.mock('@/shared/api')`로 supabase null → demo 시드 폴백 + 인증 mock. 단언:
- 컨텐츠↔인사이트 탭 전환 → 본문 그리드 스왑(컨텐츠 카드 ↔ 인사이트 메모 카드).
- 출처 칩 클릭 → 그리드 필터 + selected 칩 강조(채움 `#FAFAFA`). 정렬 dropdown 선택 → 순서 변경(recent/oldest/most_clips).
- 폴더 내비: 폴더 카드/좌 트리 항목/`전체 폴더` 드롭다운 → 폴더별 뷰(헤더=폴더명·`N개의 컨텐츠`·브레드크럼 `전체 폴더 / <폴더명>`). 트리 chevron 토글 펼침/접힘.
- 폴더 CRUD 모달(생성 input·취소/확인 / 이름변경 프리필 / 삭제 확인) 렌더·콜백.
- 다중선택 → 선택 카운트·`폴더로 이동` 액션 → 폴더 선택 모달.
- 카드 클릭 → `navigate('/content/:id')`(라우팅 타깃 probe 단언).
- 인사이트(타인 공개분 혼입 시) sanitized 셰이프만 사용(user_id/실명 키 부재) 단언.
- **AI 노트 탭·Sparkle FAB·아이콘_노트 미렌더** 단언(queryByText null).

### 5-B. `library-folders.contract.test` (BE 배선 · `shared/api/library`)
RPC 래퍼 인자/반환 계약(mock supabase client):
- create/rename/softDelete/move RPC 정확 인자 키(`p_name`/`p_folder_id`/`p_content_ids`/`p_target_folder_id`/`p_sort`) 전달 단언.
- 정렬 파라미터 매핑(최신→recent·오래된→oldest·클립많은→most_clips).
- 출처 카운트·폴더 카운트 매퍼(snake→camel) 정확성.
- 에러코드 매핑(`23514`=공백/중복/20초과 → 사용자 문구, `23503`=비소유 폴더, `28000`=미인증).
> ⚠ cross-user 누출 0은 u0b pgTAP 정본 → **재단언 ❌**.

### 5-C. 게이트
`tsc -b` 0 · `eslint .` 0 · `steiger ./src`(lint:fsd) 0 · `vitest run` green · 콘솔 0. `/design-review` 충실도 PASS(프레임 `2117:22041`/`24721`/`22576`/`23135`/`23917` 대비 스크린샷 첨부).

---

## 6. Boundaries (FROZEN 미접촉 · 앱셸 구조 변경 금지)

**only edit (FE):** `src/pages/library/**` · `src/widgets/{library-sidebar,folder-tree,folder-card-grid,content-card-grid,insight-card-grid,source-filter}/**` · `src/features/{create-folder,rename-folder,delete-folder,move-to-folder,filter-by-source,sort-library,switch-library-tab}/**` · `src/entities/{folder,content,clip}/**`(배럴 경유·하향 임포트, content/clip은 표현 타입 **추가만**) · `src/shared/api/{index,library,types,demo-data}.ts`(library 래퍼 추가) · `src/app/styles/tokens.css`(신규 토큰 3종, PM 확인 후) · `src/app/app.tsx`(/library 라우트 1줄).

**do not change (FROZEN — 소비/라우팅만):**
- u0b 계약·마이그레이션(0001~0011 포함 — **0011도 소비만, 수정 ❌**): `folders`·`clips`·`get_or_create_content`·`content_clips_public`·`content_heatmap`·RLS·익명 임계·`library_*` RPC 시그니처.
- u0c: `shared/ui/**`·`app/styles`(토큰 추가 외 기존 값 수정 ❌)·**`widgets/{app-shell,sidebar,topbar}` 구조 변경 금지**(props로만 구동 — `activeMenu`/`onMenuSelect`/슬롯).
- u4: `pages/content-detail/**`·`widgets/{video-player,clip-heatmap,social-sidebar,similar-content}` — **라우팅만**(`/content/:id`), surface 구현 ❌.
- 인증/온보딩/결제(u1) 라우트·가드.
- **preserve**: FSD 하향 임포트·배럴 경유·동일레이어 크로스슬라이스 ❌·RLS·ADR-0002 sanitized read·soft-delete.

**정적 유지(out of scope · 죽은 UI ❌):** AI 노트 탭·Sparkle mini FAB·아이콘_노트(게이트ⓐ 영구컷) · 아티클 클리핑/하이라이트 · 통합 검색 결과 화면(u8 — 검색바는 입력 진입점만) · 대시보드/GNB 대시보드 탭(FD1) · 결제/Pro.

**Git:** main 직접 푸시 ❌ · force-push ❌ · blast radius `feat/u7-library`.

---

## 7. RPC 계약 요약 (BE 소비 — 0011 그대로)

```
create_folder(p_name text) → folders                  -- 본인 INSERT(RLS) · 공백 23514 · 21번째 23514 · 미인증 28000
rename_folder(p_folder_id uuid, p_name text) → folders -- 본인 UPDATE · 타/미존재/삭제됨 = 0행(null) · 공백 23514
soft_delete_folder(p_folder_id uuid) → folders         -- deleted_at=now + 부착 clips.folder_id NULL해제(클립 보존) · 슬롯 회복 · 타/미존재 = null
move_clips_to_folder(p_content_ids uuid[], p_target_folder_id uuid=null) → int
                                                       -- 본인 클립 일괄 folder_id 갱신(NULL=detach) · 비소유/미존재 타깃 23503 · 미인증 28000 · 이동수 반환
library_folder_counts() → (folder_id, name, content_count)        -- 활성 폴더별 distinct content (본인 라이브 클립)
library_source_counts(p_folder_id uuid=null) → (provider, content_count)  -- NULL=전체 / folder 내 · provider별 distinct content
library_cards(p_folder_id uuid=null, p_sort text='recent')
   → (content_id, title, thumbnail_url, provider, tags text[], grab_count, last_clip_at)
                                                       -- NULL=전체 / folder 내 · distinct content 1행 · sort: recent/oldest/most_clips
-- 모두 security invoker (RLS 본인 범위) · grant authenticated.
```
**DM 확정(spec/런북 §6):** DM2=**(A) folder=클립 부착(`clips.folder_id`)**(reversible·콘텐츠 복수폴더 가능·폴더카운트=distinct content) · DM-folder-delete=**folder_id NULL해제(클립 보존)** · DM-multiselect=u0c card(selected)+액션바+modal(게이트ⓒ 사인오프) · DM-bookmark=**옵션1 UI탭+빈상태**(데이터 보류) · DM-sort=dropdown(최신/오래된/클립많은).

---

## 8. 리스크 / OPEN (PM·게이트 결정)

1. **[OPEN-A] 인사이트 탭 데이터 소스** — 0011에 인사이트 전용 RPC 없음(`library_cards`는 메모 미반환). 인사이트 카드 메모 발췌(`2117:24721` §8)의 read 경로 미확정. → **잠정**: `library_cards` + 본인 클립 메모를 페이지에서 합성(본인 read), 미흡 시 demo 폴백. 본인 데이터라 sanitized 불필요. **PM 확인**(별도 read RPC가 필요하면 BE in-flight 흡수 — 신규 마이그레이션은 0011 additive로만, 새 티켓 ❌).
2. **그리드 열 수 5 vs 명세 2** — Figma 실측 5열(컨텐츠)·2열(인사이트) 채택(충돌규칙 무엇=Figma). 명세 "2열"과 불일치 → **게이트ⓒ 시각 확인**(반응형 fill이라 뷰포트별 가시 열 수 변동: `2117:22576`는 4열로 보임).
3. **FD3 순백 #FFFFFF vs 토큰 #FAFAFA** — 타이틀·사이드바 제목·선택 탭 글자. 픽셀-퍼펙트 우선 = `--color-white-pure` 적용(기본). **게이트ⓒ 사인오프.**
4. **브레드크럼 위치** — `2117:23135`는 톱바 셀렉트 영역에 `전체 폴더 / 창업가 정신` 렌더. Topbar(u0c FROZEN)가 브레드크럼 props를 받는지에 따라 톱바 주입 vs 본문 헤더 폴백 결정 → 구현 시 Topbar 시그니처 확인(구조 변경 ❌).
5. **다중선택 진입 트리거** — [디자인 공백]. 체크박스 상시/선택모드 토글/롱프레스 중 u0c 패턴 통일 필요 → **게이트ⓒ 시각 사인오프**(픽셀 SoT 없음).
6. **검색바·`전체 폴더` select 동작** — 검색바=`/search` 라우팅 진입점만(결과=u8). `전체 폴더` select 드롭다운(`2117:22576`)은 폴더 간 이동 UI — 좌 트리와 동일 데이터, 중복 없이 단일 폴더 상태로 구동.
7. **신규 토큰 3종**(brand-primary-12·overlay-black-32·space-grid-row) — tokens.css 추가는 기존 값 수정 아닌 **추가**로 Boundaries 내. PM 확인 후 반영.

---

### 산출물 경로 (절대)
- 플랜(본 파일): `/Users/suho/Desktop/Grabit/.claude/worktrees/u7-library-fe/docs/units/u7-library/plan.md`
- spec: `/Users/suho/Desktop/Grabit/.claude/worktrees/u7-library-fe/docs/units/u7-library/spec.md`
- 측정: `/Users/suho/Desktop/Grabit/.claude/worktrees/u7-library-fe/docs/units/u7-library/figma/{2117_22041,2117_24721,2117_22576,2117_23135,2117_23917}.{md,png}`
- BE RPC: `/Users/suho/Desktop/Grabit/.claude/worktrees/u7-library-fe/supabase/migrations/0011_library_folders.sql`
