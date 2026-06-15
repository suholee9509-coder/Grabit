# Unit: u0b-data-core

> Sprint 0 · Wave 0 (선행, Lane B) · owner=backend · **mode=헤드리스 `/goal`** (`claude-opus-4-8` · `--effort max`) · dep=스캐폴딩(`supabase init`) 후 · migration **신규(0001~)**
> ★ **이 단위가 ADR-0002(데이터모델·RLS)를 *락*한다.** 매 턴 spec + `state/decisions.md` ADR-0002 reload. 고위험(데이터모델·RLS) → 첫 ~5턴 PM/사용자 관찰.

## User Story (L1 — 검증의 north star · 각 인수기준이 여기로 추적)
- **L1-a** As a user, when I clip a video interval with a memo, it is stored against a **canonical content identity** (one content per video regardless of URL form) and **RLS-isolated to me**.
- **L1-b** As a user, on a content's detail I see **everyone's clips on that video, anonymized as job+years** (hidden below a cohort threshold), rendered as a **clip-density heatmap** — via a *sanitized read model*, never raw cross-user rows.
- **L1-c** As the chrome extension, I can POST the **exact same clip payload** as the web app and it ingests identically.

**Production acceptance (관찰가능):** 로컬 Supabase에서 두 계정이 같은 영상(다른 URL 형태)을 클립 → **1 content로 dedup**, 각자 RLS 격리, 상세의 sanitized view/RPC가 **익명 코호트 + 히트맵**을 반환(N미만 숨김), 확장 payload가 동일 인제스트. **pgTAP가 cross-user 누출 0을 증명.**

## Figma frames (백엔드 — 직접 프레임 없음. 데이터 소비처)
- u4 콘텐츠상세 히트맵·소셜애노테이션 `2087:12538` · u3 클립 `2087:33548` · u7 라이브러리 `2117:22041` (데이터 형태 역설계: docs/design/README.md §데이터모델)

---
/goal --tokens <예산>  [ADR-0002의 데이터모델·RLS·sanitized read·히트맵·확장 ingest를 마이그레이션 + contract 테스트로 구현·증명한다. 형용사 금지.]

### Source of truth (매 턴 reload)
- read   docs/units/u0b-data-core/spec.md (이 파일) · update status.md
- 참조: state/decisions.md **ADR-0001 / ADR-0002** · config/quality_standards.md · docs/design/README.md(데이터모델 역설계)

### Acceptance criteria (스토리 도출 · 관찰가능 · 각 항목 → L1-x)
**BE**
- [behavior] **콘텐츠 정준화**: `provider`+`provider_content_id`+정규화 URL(youtu.be/Shorts/모바일/타임스탬프/playlist 파라미터 정규화) → `get_or_create_content` RPC, URL당 1 content(파편화 방지). → L1-a
- [behavior] **클립 스키마**: `clips`(user_id, content_id, start_sec int, end_sec int, memo, is_public, created_at). 끝 배타/겹침/0길이 규칙·영상길이 변경·메타 fetch 실패 처리 *명시*. → L1-a
- [behavior] **RLS**: 쓰기=본인만, 읽기=본인 행 + **sanitized 공개 집계 view/RPC**(`content_clips_public`: 직업+연차 코호트 + 구간/메모, 사용자 식별자·실명 제거). 클라가 cross-user `clips` 직접 read ❌. → L1-b
- [behavior] **익명화 임계값**: 코호트(직업+연차) **N명 미만이면 코호트 메타 숨김/버킷팅**(재식별 방지). → L1-b
- [behavior] **히트맵 집계 = SQL view/RPC**(`content_heatmap(content_id)` → 구간별 밀도). Edge Function 곁다리 ❌(핵심 프리미티브). → L1-b
- [behavior] **프로필 분리**: `profiles` private(auth·관심사) vs public 코호트(직업+연차) 노출 경로 분리.
- [behavior] **확장 ingest = 웹과 동일 계약**: `clip-ingest` Edge Function(또는 동일 RPC), bearer JWT 검증, 웹/확장 payload 동일. → L1-c
- [behavior] 콜드스타트 폴백 **인터페이스 스텁**: 또래/트렌드 0건 시 전역 인기/시드 경로(구현은 후순위, 계약만).
- [negative] 잘못된 URL·삭제/비공개 영상·**중복 클립**(같은 구간 재클립 → 메모 추가만) 처리.

### Validation (증명 명령 — QA가 clean checkout 재실행 · AI/외부 목킹 · 동어반복 ❌)
- pgTAP: `rls-isolation`(타 user `clips` read 0) · **`derived-api-no-leak`**(view/RPC가 user_id·실명 미노출) · `content-dedup`(URL 변형 → 1 content) · `clip-interval`(경계·겹침·0길이) · `heatmap`(밀도 집계) · `anonymize-threshold`(N미만 숨김).
- `deno test supabase/functions/`(`clip-ingest` contract — 웹/확장 동일 payload·401·중복).
- `tsc`/lint 0.

### Boundaries
- only edit: `supabase/migrations/**` · `supabase/functions/{clip-ingest,_shared}/**` · `supabase/tests/**`(pgTAP).
- do not change: `apps/**`(FE) · u0. preserve: (그린필드 — 첫 마이그레이션 0001).
- out of scope: 화면 UI · 추천/트렌드 알고리즘 고도화(스텁만) · AI(제외) · 결제(제외).
- main 직접 푸시 ❌ · blast radius = `feat/u0b-data-core`.

### Loop behavior
- 의미있는 변경마다 validation(pgTAP/deno) 실행 · status.md 갱신(변경·검증결과·ADR-0002 결정 기록).
- goal = L1-a/b/c 관찰가능 + **cross-user 누출 0 증명**까지 루프. 미충족 done ❌ → ESCALATION(ADR-0002 미결 항목 기록 후 정지, §no-fake-done).
