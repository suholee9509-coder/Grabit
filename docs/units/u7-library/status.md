# u7-library — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **FE 충실도 보수 검증 PASS (커밋 대기 — PM 통합)**
- 충실도 보수(2026-06-16, u7-lib-fidelity 워크트리 — fidelity-audit PNG 대비):
  - **B2 폴더트리 히트영역 분리**: `folder-tree.tsx` 헤더행을 두 버튼으로 절단 — ① 토글영역(쉐브론 ChevronDown/ChevronRight 16 #999999 + 폴더 아이콘 FolderOpen/Folder 18 #ECECEC) = `onToggle`만(펼침/접힘) · ② 진입영역(폴더명 + 카운트) = `onSelectFolder`만(폴더별 뷰). 이전엔 한 버튼이 `onToggle`+`onSelectFolder` 동시 호출(2117:23917 토글 vs 2117:23135 진입 결합 결함) → **한 클릭에 결합되지 않도록 분리**. `.active`는 `.headerRow`로 이동(`.active .folderName` 선택자 유지). aria-label(접기/펼치기)·aria-current 부여.
  - **B3 전체폴더 드롭다운 → 인라인 트리 토글**: `library-page.module.css`의 `.folderDropdownOverlay`/`.folderDropdown`/`.dropdownTrigger` 팝오버 오버레이 제거 + `use-library-view.ts`에 `toggleTree(ids)` 추가(하나라도 닫혀 있으면 전체 펼침, 전부 펼침이면 전체 접힘). `LibrarySidebar` select 트리거가 `onSelectClick→view.toggleTree(folderIds)`로 좌 사이드바 폴더 트리를 인라인 확장/접힘(2117:22576 = 팝오버 없는 인라인 펼침). 트리거에 `selectExpanded` prop(active border·쉐브론 180° 회전·aria-expanded/aria-controls) 추가.
  - **AI FAB 미렌더 유지(게이트ⓐ)**: 라이브러리 스코프 소스(pages/library·widgets/folder-tree·widgets/library-sidebar)에 Sparkle/AI-FAB/AI 노트 렌더 코드 0건(테스트 단언 외 참조 없음). 보수로 회귀 없음.
- 검증(FE 게이트 — 2026-06-16, u7-lib-fidelity 워크트리 실제 실행 출력):
  - Gate1 `tsc -b` → **exit 0**.
  - Gate2 `eslint .` → **exit 0** (lint:fsd 포함 클린).
  - Gate3 `pnpm exec steiger ./apps/web/src` → **No problems found! (exit 0)**.
  - Gate4 `pnpm -C apps/web build` (tsc -b && vite build) → **성공(exit 0)** · 2203 modules transformed.
  - Gate5 `vitest run` → **Test Files 24 passed · Tests 178 passed** — 무회귀(전수 통과). 폴더카드 aria-label(`...폴더 열기`)·AI노트탭/SparkleFAB 미렌더 단언 유지.
  - Gate6 콘솔0: 테스트 출력에 console.error/warn/act-warning **0건**.
- 자체검증(fidelity-audit/u7-library PNG 대비): 2117-22576 폴더드롭다운 = 좌 사이드바 인라인 펼침(팝오버 부재) ✓ · 2117-23917 폴더트리토글 = 쉐브론/폴더아이콘 토글영역과 폴더명 진입영역 분리(별개 클릭) ✓ · AI FAB 미렌더 ✓.
- (이전 통합 검증 기록 — FE+BE PASS 유지)
- 상태(이전): **FE+BE 검증 PASS (커밋 대기 — PM 통합)**
- 검증(FE 게이트 — 2026-06-16, u7-library-fe 워크트리 실제 실행 출력):
  - Gate1 `pnpm -C apps/web exec tsc -b --force` → **exit 0**.
  - Gate2 `pnpm -C apps/web exec eslint .` → **exit 0** (lint:fsd 포함 클린).
  - Gate3 `pnpm exec steiger ./apps/web/src` → **No problems found! (exit 0)**.
  - Gate4 `pnpm -C apps/web build` (tsc -b && vite build) → **성공(exit 0)** · 2132 modules transformed.
  - Gate5 contract 테스트: `vitest run` → **Test Files 19 passed · Tests 134 passed (이전 111 + library-folders 신규 23)**. 기존 86류 무회귀(전수 통과).
    - `src/pages/library/library.contract.test.tsx`(10): 컨텐츠/인사이트 탭·출처필터·정렬·폴더 내비(카드/트리/드롭다운→폴더별뷰+브레드크럼)·폴더 생성 모달·다중선택 이동·카드 클릭 navigate·AI 노트/Sparkle FAB **미렌더** 단언 · 북마크 탭.
    - `src/pages/library/library-folders.contract.test.tsx`(23, **신규**): folders CRUD(생성 20제약[23514 folder-limit]·이름변경·soft-delete)·다중선택 folder_id 일괄 이동·출처 카운트·정렬을 **실배선 RPC 경로**(배럴 @/shared/api 목킹·isSupabaseReady=true·fake client spy로 결정론 시드, FSD no-sidestep 준수)에서 검증. 빈 이름(클라이언트 가드 RPC 미호출)·중복(23505 folder-name)·20초과(23514 folder-limit)·타인 폴더(RLS 0행 no-op·23503 target-folder)·미인증(28000 unauthenticated) 처리. **sanitized 셰이프 단언**(카드 키 = 표현 키만; userId/user_id/email 부재). AI 노트 탭·Sparkle FAB 미렌더 회귀 차단.
  - Gate6 콘솔0: 테스트 출력에 console.error/warn/act-warning **0건** · 라이브러리 스코프 소스에 console.* **0건**.
- spec 충족(no-fake-done) 항목별 자체검증(측정 대비 픽셀):
  - L1-a 셸: 좌 LibrarySidebar(2117:22557 **382×1080 #121212 r8**·내컨텐츠/북마크 토글·전체폴더 select 298×38 r6)·헤더(라이브러리·컨텐츠추가)·검색바·폴더카드·우 출처필터 = 렌더 ✓.
  - L1-b 컨텐츠↔인사이트 탭 스왑 ✓ (테스트 단언).
  - L1-c 출처 카운트 필터(selected 칩 **#FAFAFA**·unselected **rgba(255,255,255,.06)**=--color-surface-hover·border-subtle .08, u0c Chip variant=source 소비) + 정렬(최신/오래된/클립많은순) ✓.
  - L1-d 폴더 내비(카드/트리/드롭다운→폴더별뷰·헤더 폴더명·N개의 컨텐츠·브레드크럼 전체 폴더/폴더명) ✓.
  - L1-e 폴더 CRUD(생성 모달·이름변경·삭제 다이얼로그·**최대20 도달 차단+안내**) + 다중선택→폴더 이동(액션바·radiogroup 이동할 폴더·move_clips_to_folder) ✓.
  - L1-f 카드 클릭 → /content/:id (u4 상세 라우팅) ✓.
  - [state] 빈(폴더0/컨텐츠0/폴더내0/인사이트0/북마크0)·로딩(스켈레톤)·에러(재시도)·최대20 = content-card-grid/insight-card-grid/create-folder atLimit로 구현 ✓.
  - [fidelity] 측정 대비: 폴더카드 **160×160 r16**(--radius-xl) · 검색바 **h38**(--size-search-sm) **pill r100**(--radius-pill) **1px stroke**(border-default .10) · 구분선 1px(.08). AI 노트 탭·Sparkle mini FAB·아이콘_노트 **미렌더**(테스트 단언 — 죽은 UI 0). 토큰/Chip/모달은 u0c 파운데이션 소비(boundaries: u0c 무변경).
- 검증(pgTAP via pglite — 2026-06-16, 실제 실행 출력):
  - `node supabase/tests/_pgtap_pglite.mjs` → **pgTAP files 12 · asserts 94 ok / 0 not ok · file-errors 0** (기존 74류 무회귀, `library-folders.sql` 20/20 추가).
  - Gate2: 마이그 0001→0011 strict 순차 적용 pglite에서 클린(`GATE2_OK`). 0011은 additive-only (ALTER ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE FUNCTION / CREATE INDEX IF NOT EXISTS / GRANT / COMMENT — DROP·파괴적 ALTER 없음).
  - Gate3 RLS 누출 0: cross-user 폴더/클립 = ok 17(bob sees 0 folders)·ok 18(bob sees 0 cards)·ok 19(bob의 타인폴더 soft-delete no-op)·ok 20(unauth create_folder 28000 차단). **NOT ok = 0**.
  - u0b FROZEN 무접촉 확인: git status = 신규 2파일만(`0011_library_folders.sql`·`tests/library-folders.sql`). 0001-0010·기존 .sql·get_or_create_content/content_clips_public/content_heatmap/RLS 미변경.
- 변경 파일(additive only, untracked):
  - `supabase/migrations/0011_library_folders.sql` — folders.deleted_at(soft-delete) + enforce_folder_limit() ACTIVE-count 재정의 + create_folder/rename_folder/soft_delete_folder/move_clips_to_folder + library_folder_counts/library_source_counts/library_cards RPC.
  - `supabase/tests/library-folders.sql` — 20-assert pgTAP 계약(폴더 CRUD·max20·다중선택 이동·cross-user no-leak·unauth 차단).
- 설계 노트:
  - 역설계 SoT = Figma 프레임 5종(2117:22041 컨텐츠탭 · 2117:24721 인사이트탭 · 2117:22576 폴더드롭다운 · 2117:23135 폴더별뷰+브레드크럼 · 2117:23917 폴더트리토글) 전수 판독 완료. 상세 surface는 u4 재사용(라우팅만).
  - 셸 구조: 좌측 `내 라이브러리`(내컨텐츠/북마크 탭·폴더 트리·전체폴더 select) + 헤더(라이브러리·컨텐츠추가) + 검색바 + 폴더추가/카드 + 컨텐츠/인사이트 그리드 + 우측 출처 카운트 필터.
  - 데이터 의존(ADR-0002): #8(라이브러리 관계 — folder 부착·tags) · #3(sanitized read — 타인 공개 인사이트 코호트 익명) · #9(soft-delete). folders 테이블 + clips.folder_id 는 본 단위 신규 마이그레이션(u0b 위 additive).
  - 스코프 컷: AI 노트 탭·Sparkle mini FAB·아이콘_노트 미렌더(게이트 ⓐ) · 아티클 제외 · 검색 결과화면=u8 · 상세=u4.
  - 픽셀 토큰: 폴더카드 160×160 r16 · 검색바 h38(pill r100·1px stroke) · 출처칩 selected #FAFAFA / unselected rgba(255,255,255,.06) (u0c 토큰 + 프레임 실측).
- 리스크:
  - R-DM2: folder 부착 단위(클립 vs 콘텐츠-단일폴더) 미확정 → 잠정 (A)클립 부착으로 진행(reversible).
  - R-multiselect: 다중선택→폴더 이동 UI 디자인 공백(2117:23135=_디폴트) → u0c 패턴+게이트 ⓒ 시각 사인오프.
  - R-bookmark: 북마크 탭 미설계 → MVP는 UI+빈상태(데이터 배선 보류).
  - R-design-gap: 폴더 CRUD 모달·빈/로딩/에러·20개도달 프레임 부재 → u0c 파운데이션으로 채움.
- ESCALATION: **DM2(folder 부착 모델)** · **DM-multiselect(다중선택 이동 UI)** · **DM-bookmark(북마크 탭 범위)** — PM 결정 필요(착수 전/초기 턴). 상세 = spec.md §ESCALATION.

STATUS = "FE+BE 검증 PASS(커밋 대기): 게이트 6/6 통과(tsc0·eslint0·steiger0·build0·tests 134 passed[신규 library-folders.contract 23·기존 무회귀]·콘솔0) · L1-a~f·[state]·[fidelity] 항목별 충족(측정 대비 픽셀: 폴더카드160×160r16·검색바h38r100·출처칩#FAFAFA/.06·AI노트탭/SparkleFAB 미렌더) · 잔여: 라이브 Figma MCP 시각 사인오프(게이트ⓒ)는 사용자 운전 핸드오프 · PM 결정 3건(DM2·다중선택·북마크)은 잠정값으로 reversible 진행"
