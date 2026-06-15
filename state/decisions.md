# Architecture Decision Records (ADR)

> Append-only. 큰 아키텍처/스택 결정을 시간순으로 기록. PM·backend가 추가. **Sprint 0 스택 결정이 첫 엔트리가 된다.**

## ADR 양식
```markdown
## YYYY-MM-DD — <결정 제목>
### Context
<왜 필요한가 — 1–2문단>
### Decision
<무엇을 결정했나>
### Consequences
- Good: ...
- Tradeoffs: ...
- Future impact: ...
### Alternatives Considered
- <대안> — <기각 이유>

By: <pm|backend> · Sprint <N>
```

---

## 2026-06-15 — ADR-0001: Sprint 0 스택/아키텍처
### Context
Grabit MVP(게이트 ⓐ): 웹앱 + 크롬 MV3 확장 + 백엔드. AI·대시보드·결제·아티클·연간 제외. 디자인=고정 Figma(픽셀-퍼펙트). `/plan-eng-review`(Codex 아웃사이드보이스 포함)로 검증. 초안: `docs/plan/sprint0-stack-adr-draft.md`.
### Decision
- **모노레포**: pnpm workspaces (Turborepo는 필요 시 후속). **웹 우선 린 스타트** — `apps/web` + `supabase/` 먼저, `apps/extension`·`packages/ui`는 u6 시작 시 추가·추출(8/9 단위가 웹). 단 워크스페이스는 처음부터(확장 추가 비용 ↓).
- **웹**: React 18 + **Vite** + TS · **FSD**(app→pages→widgets→features→entities→shared, 하향 임포트·배럴·`lint:fsd`) — *가볍게 유지(순수성이 산출물 ❌)* · React Router · **TanStack Query(서버상태) + React 상태/Context(UI)**, zustand는 필요 시.
- **스타일**: Figma "디자인 시스템"(`668:29`) → CSS 변수(`--color/space/text/radius/shadow-*`) + CSS Modules. 다크테마. UI킷 ❌(`shared/ui`를 Figma 컴포넌트로).
- **확장**: **WXT**(CRXJS 대신 — 유지보수 둔화). content script(YouTube 주입 버튼+클립 모달, **Shadow DOM 격리**) · popup(React) · background SW. 인증 = 웹 로그인 팝업으로 Supabase 세션 획득 → `chrome.storage` 저장·갱신, bearer 전송, 401 시 재로그인. (MV3 SW sleep·토큰갱신 위협모델 = u6 spec.)
- **백엔드**: **Supabase** — Postgres + Auth + **RLS** + Edge Functions(Deno). **Postgres view/RPC/RLS 우선**, Edge Function은 **YouTube 메타 fetch(oEmbed 우선) + 확장 ingest**만(과다 지양).
- **Auth**: **Google + Kakao**(둘 다 Supabase 네이티브 — Kakao는 락 전 검증). Naver 후순위(Custom OIDC Edge Function).
- **배포**: 웹 = **Cloudflare Pages**(사용자 확정 2026-06-15). Supabase OAuth 콜백 URL을 Cloudflare Pages 도메인·프리뷰에 맞춰 설정. 확장 = 크롬 웹스토어(개인정보·권한근거·CSP·OAuth 검증을 u6에서 *조기* 준비, "done" 직전 ❌).
- **Supabase 워크플로**: 로컬 개발 = `supabase` CLI(마이그레이션·RLS·pgTAP 로컬 실행), 배포 = 클라우드 프로젝트(키는 `.env` — 커밋 ❌). u0b 스파이크는 로컬에서 시작.
- **테스트**: Vitest(contract) + Playwright(e2e) + pgTAP(RLS). **+ 파생 API(view/RPC)가 cross-user 필드 누출 안 함을 증명하는 테스트**.
### Consequences
- Good: 웹·확장 타입/UI 공유, Supabase로 Auth+RLS+서버 일원화, Figma 토큰 1:1, FSD 경계로 증식 차단.
- Tradeoffs: u6에서 워크스페이스 추가+공유 추출 리팩터 1회, WXT 학습, Naver 커스텀 후순위, 호스팅 조기 택1 필요.
- Future: AI(u5) 복귀 시 서버측 LLM 게이트웨이(브라우저 키 ❌). 결제(u10) 복귀 시 토스 Edge Function.
### Alternatives Considered
- Next.js — SSR 불필요·확장 공유 복잡 → Vite SPA. / 자체 Node 백엔드 — Auth/RLS 비용 → Supabase. / CRXJS — 유지보수 둔화 → WXT. / Tailwind — 토큰 1:1엔 CSS변수+Modules 직접적.

By: pm · Sprint 0

---

## 2026-06-15 — ADR-0002: 데이터 모델 + RLS (OPEN — u0b 코어 스파이크가 락)
### Context
Codex 아웃사이드보이스가 짚은 핵심: **소셜 애노테이션(같은 URL의 모든 유저 클립을 익명 표시)이 "유저별 RLS 격리"와 충돌**. 이건 화면이 아니라 *코어 데이터패스*이며 제품 성립성을 결정. → 게이트 ⓐ 후 **u0b-data-core(백엔드 헤드리스)** 가 u0(디자인시스템·FE 인터랙티브)와 **병렬**로 이 ADR을 *스파이크로 락*한다.
### Decision (OPEN — u0b가 결정·증명)
다음을 u0b 스파이크가 결정하고 contract 테스트로 증명한다:
1. **콘텐츠 정준키**: `provider`+`provider_content_id`+정규화 URL(youtu.be/Shorts/모바일/타임스탬프/playlist 파라미터 정규화·삭제영상 처리) → URL당 1 content(파편화 방지).
2. **클립 구간 의미**: 초 단위 정수, 끝 포함/배타, 겹침·0길이 규칙, 영상 길이 변경·메타 fetch 실패 처리.
3. **Sanitized public read 모델**: 클라가 cross-user `clips` 직접 쿼리 ❌ → **익명 view/RPC**(직업+연차 코호트 + 구간/메모만). RLS는 쓰기=본인, 읽기=sanitized 집계.
4. **익명화 임계값**: 직업+연차+메모+타임스탬프 재식별 방지 → **N명 미만 코호트 메타 숨김**(버킷팅).
5. **히트맵 집계 = SQL view/RPC(필요 시 materialized)** — Edge Function 곁다리 ❌(핵심 프리미티브).
6. **프로필 분리**: private(auth·추천입력) vs public(코호트=직업+연차).
7. **콜드스타트 폴백**: 또래/트렌드 데이터 없을 때 전역 인기·에디토리얼 시드·온보딩 관심사(또는 문구 제거).
8. **라이브러리 관계**: 클립=저장단위? content와 folder/tag 부착 대상? (u7/u8 의존) · **tags 글로벌 vs 유저별** 조기 결정.
9. **라이프사이클·모더레이션**: 클립/애노테이션 수정·삭제(soft/hard), 집계 즉시반영, 신고/차단 최소.
10. **검색 데이터 형태**(u8 의존이나 content/clip ship 전 결정): 한국어 FTS(Postgres FTS로 충분 추정) — 제목/메모/태그/애노테이션 인덱싱·프라이버시.
### Consequences
- u4 콘텐츠상세는 *일반 웹 화면이 아님* — dedup·ingest·공개집계·익명화·히트맵에 의존(u0b 선행 필수).
### Alternatives Considered
- 단순 테이블 RLS만 — cross-user 표시 불가(누출 위험). / Edge Function 집계 — 지연·정책 복잡 → Postgres view/RPC.

By: pm · Sprint 0 (락 예정: u0b)
