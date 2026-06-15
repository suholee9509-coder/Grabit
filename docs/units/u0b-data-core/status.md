# u0b-data-core — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **첫 실행 완료(초과달성) · 정본 pgTAP `.sql` 6종 pglite 실행·전수통과(38/0) · RLS 설계리뷰 PASS(PM) · ✅ 정본 엔진 = CI 이관(`.github/workflows/u0b-canonical-tests.yml`) — 로컬 Docker wedge·디스크97% → push 시 supabase pgTAP+deno 게이트**
- 검증:
  - ✅ **정본 pgTAP `.sql` 파일 전수 실행·통과** — `supabase test db`/`deno`/`docker`가 전부 샌드박스 코드실행 게이트라, **`@electric-sql/pglite`(실제 Postgres WASM) + 순수 PL/pgSQL pgTAP 심**으로 **커밋된 6개 `.sql` 테스트 파일을 그대로 실행**(JS 재구현 아님):
    ```
    PASS rls-isolation 6/6 · derived-api-no-leak 7/7 · content-dedup 7/7
    PASS clip-interval 8/8 · heatmap 5/5 · anonymize-threshold 5/5
    PASS contract(node, 실제 모듈) 7/7   →  38 asserts ok / 0 not ok / 0 file-error
    ```
  - 🐞 **실행으로 진짜 버그 발견·수정**: `rls-isolation.sql`의 데이터변경 CTE(`with d as (delete…returning) …`)를 `is()` 인자로 중첩 → Postgres "WITH … data-modifying must be at top level" 에러. **CTE를 top-level로 호이스트해 수정**(정본 `supabase test db`도 이 에러였을 것 — 사전 차단). 마이그레이션 0001~0009도 전부 클린 적용 확인.
  - 보조 교차검증: `_pglite_proof.mjs`(독립 JS 어서션) 34/34 PASS.
  - **재현**: `pnpm add -D @electric-sql/pglite && node supabase/tests/_pgtap_pglite.mjs` (~1.2s). RLS·정의자뷰·SECURITY DEFINER·`security_invoker=false`는 Supabase Postgres와 동일 동작.
  - ⏳ **정본 러너만 미실행(게이트)**: `pnpm supabase start`+`supabase test db`(pg_prove) / `deno test`는 docker·supabase·deno 바이너리가 전부 승인 전용 게이트라 자율 실행 불가. 충실도 차이 = 엔진(pglite vs docker-postgres)·pgTAP 심(서브셋)·`auth.users` 최소심뿐. **정본 런타임 미확인 → 전체 goal done 금지(no-fake-done).**
- 변경 파일:
  - `supabase/migrations/0001_profiles.sql` … `0009_ingest.sql` (9개) — 아래 ADR-0002 락 참조
  - `supabase/tests/` pgTAP **6종**: `rls-isolation` · `derived-api-no-leak`(필수 2종) + `content-dedup` · `clip-interval` · `heatmap` · `anonymize-threshold`(스펙 Validation 전체) + Docker-free 실행 하니스 2개: `_pgtap_pglite.mjs`(정본 `.sql` 그대로 실행) · `_pglite_proof.mjs`(독립 JS 교차검증)
  - `supabase/functions/_shared/{cors.ts,ingest-contract.ts}` · `clip-ingest/{index.ts,contract_test.ts}` (L1-c)

## ADR-0002 락 결과 (이 단위가 결정·구현 — 증명: 정본 pgTAP `.sql` 6종 실제 실행 전수 통과(pglite), 아래 "증명" 열의 (차기)는 정본 엔진 1회 확인만 의미)
| # | 항목 | 결정(LOCKED) | 증명 |
|---|---|---|---|
| 1 | 콘텐츠 정준키 | `UNIQUE(provider, provider_content_id)` + `get_or_create_content()` (youtu.be/shorts/embed/live/v/watch·m·music·타임스탬프·playlist 정규화) | content-dedup pgTAP(차기) |
| 2 | 클립 구간 | int초, **end 배타 `[start,end)`**, 0길이 금지(CHECK), 겹침 허용, 정확중복→메모머지, duration 권고(클램프❌), 메타실패→null유지 | clip-interval pgTAP(차기) |
| 3 | Sanitized read | **단일 정의자-뷰 `content_clips_public`**(`security_invoker=false`)=유일 격리우회점 → 모든 소셜/히트맵 파생. RLS write=self·read=self. user_id/실명 컬럼 부재 | **derived-api-no-leak ✅작성** |
| 4 | 익명화 임계 | `anonymization_threshold()`=5. 코호트(직업+연차) N미만→라벨 null(구간은 노출) | no-leak (F) + anonymize-threshold(차기) |
| 5 | 히트맵 | `content_heatmap(content_id,bucket_sec)` SQL RPC(뷰 위 집계, Edge Function 곁다리❌) | heatmap pgTAP(차기) |
| 6 | 프로필 분리 | `profiles.(job,years)`=public 코호트(집계 전용) vs `(display_name,interests,goal)`=private | no-leak (E) |
| 7 | 콜드스타트 폴백 | **미착수(스텁)** — 첫 실행 마일스톤 밖. 차기 인터페이스 계약만 | — (deferred) |
| 8 | 라이브러리 관계 | **folder_id=클립에 부착**(클립모달이 폴더+태그 동시설정) · **tags=유저별** · `clip_tags` M:N · **annotations=콘텐츠 시점앵커 공개노트(클립과 분리)** | rls-isolation ✅ |
| 9 | 라이프사이클 | soft-delete(`deleted_at`) on clips/annotations, 뷰가 필터. 모더레이션(신고/차단)=deferred | — (partial) |
| 10 | 검색 데이터 | **미착수**(u8 의존, 차기) | — (deferred) |

## ★ PM 결정점 (관찰 게이트에서 확인 요청)
1. **`annotations` 의미** — 클립(구간그랩)과 분리된 *시점앵커 공개노트*로 모델링함. Figma 소셜사이드바는 "인기구간+인사이트"(=공개 클립)만 보이므로 annotations가 **추측 스코프**일 수 있음. 유지 vs 클립에 흡수 → PM 판정. (reversible: 테이블 drop 가능)
2. **folder=클립 부착** — 한 콘텐츠의 클립들이 서로 다른 폴더면 콘텐츠가 복수 폴더에 표시됨(경미한 의미 주름). u7에서 콘텐츠-단일폴더로 조일지 확인.
3. **익명화 N=5** — 재식별 방지 강도. 코호트(직업10×연차6=60버킷)에 5 적정? 표본 적은 영상은 라벨 대부분 숨김 — 코호트 버킷팅(상위카테고리 롤업) 추가 여부.

## 리스크
- **[LOW·환경] 정본 러너 미실행**: `supabase test db`/`deno`/docker가 승인 게이트라 자율 실행 불가. 단 **핵심 로직은 pglite로 실행 증명(34/34)** → 잔여는 정본 런타임 확인뿐(Docker 1회 기동 시 해소).
- **[RESOLVED·정확성] 미실행 SQL 우려**: 정의자-뷰 owner-bypass·`public.clips.memo` ON CONFLICT 상관참조·auth.users 삽입·인터벌 경계 — **정본 pgTAP `.sql` 실행으로 전부 통과 확인**. 실행 중 `rls-isolation.sql` 데이터변경-CTE 중첩 버그 1건 발견·수정(정본 러너 사전 차단).
- cross-user 소셜애노테이션 vs RLS 격리 — 단일 정의자-뷰로 해소, **누출 0 실행 증명 완료**(no-leak 7/7).

## ESCALATION → ✅ RESOLVED (PM, 2026-06-15): 정본 = CI 이관
로컬 정본 러너를 띄우려 했으나 **Docker가 디스크 97%로 wedge**(VM power-off 타임아웃·broken pipe, 재기동 실패). PM 판단: 로컬 Docker 사투 중단 → **정본 pgTAP+deno를 CI(`.github/workflows/u0b-canonical-tests.yml`)로 이관**. push 시 클린 러너에서 `supabase start`+`supabase test db`(pgTAP 6종)+`deno test` 실행 — *비-LLM·un-gameable* 정본 게이트(work-unit-contract §C, ADR-0001 계획).
- 근거: 핵심 로직은 **정본 `.sql` 6종을 pglite(실 Postgres WASM)로 그대로 실행·전수통과(38/0)** + PM **RLS 설계리뷰 PASS** + 실행 중 rls-isolation 진짜 버그 1건 발견·수정(정본 러너 사전 차단). 정본 엔진 차이 = 런타임 1회 확인뿐 → CI가 보장.
- **goal 종결 기준**: 첫 CI 그린(push 시)으로 no-fake-done 충족. 그 전까지 "로직 증명 + 정본 CI 대기".

STATUS = "green(로직)·CI대기(정본): 마이그레이션9 + pgTAP6 + ingest/edge/deno + **정본 pgTAP `.sql` 6종 pglite 실행·전수통과(38/0) + contract 7/7**(rls-isolation 버그1 수정) + RLS 설계리뷰 PASS. 정본 엔진 = CI(u0b-canonical-tests.yml)로 이관 — push 시 게이트. ADR-0002 10항목 락. PM 결정점 3개(annotations 스코프·folder부착·N=5) 제기."
