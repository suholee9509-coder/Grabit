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

STATUS = "계획(미스폰): u8-search spec 역설계 완료(L1 4종·3프레임·검색 FTS 배선) · BE 스폰 전 PM 결정 4건 대기"
