# u7-library — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **BE 검증 PASS (커밋 대기 — PM 통합)**
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

STATUS = "계획(미스폰): spec 역설계 완료(프레임 5종 판독·L1 6라벨·ADR-0002 #8/#3/#9 의존) · 게이트 ⓑ(이슈/보드)·PM 결정 3건(DM2·다중선택·북마크) 대기"
