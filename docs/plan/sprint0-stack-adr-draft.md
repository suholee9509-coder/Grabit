# Sprint 0 — 스택/아키텍처 ADR 초안 (/plan-eng-review 검증 대상)

> PM이 작성한 초안. `/plan-eng-review`로 엔지니어링 관점 압박 테스트 후 `state/decisions.md`에 ADR-0001로 확정한다. **코드 작성 전 확정 필수 — 가정 ❌.**

## Context
Grabit = **성장 콘텐츠(영상) 구간 클리핑·큐레이션** 서비스. 게이트 ⓐ 스코프 확정으로 MVP는 **9단위**(u0 디자인시스템 · u1 인증·온보딩 · u2 홈피드 · u3 인앱클립 · u4 콘텐츠상세 · u6 크롬확장 · u7 라이브러리 · u8 검색 · u11 설정·계정). **AI·대시보드·결제/구독·아티클·연간플랜은 제외.**

제품은 **두 클라이언트 + 백엔드**:
- **웹앱**(데스크톱): 온보딩·홈(취향관/피드)·인앱 클립·콘텐츠 상세(뷰어+히트맵+소셜애노테이션)·라이브러리(폴더/검색)·설정.
- **크롬 확장(MV3)**: YouTube 시청 중 즉시 구간 클립 + 인사이트 메모 → 서버 전송. (content script 주입 + 클립 모달 + popup)
- **백엔드**: 소셜 OAuth+JWT, 클립/폴더/태그/소셜애노테이션 CRUD, 콘텐츠 메타데이터 fetch(YouTube), 검색, 또래/트렌드 집계. **클라이언트측 LLM·외부 API 키 호출 ❌** (Frozen 규칙). *AI 제외 → MVP에 LLM 게이트웨이 불필요.*

디자인 = 고정 Figma SoT(픽셀-퍼펙트). 토큰·스타일(그림자 등 모든 효과)·컴포넌트를 "디자인 시스템" 페이지(`668:29`)에서 추출해 시스템화(u0)하는 것이 모든 화면의 선행 의존.

## Decision (제안)
### 1. 모노레포 — pnpm workspaces
```
apps/web          # React 웹앱 (FSD)
apps/extension    # MV3 확장 (Vite+CRXJS)
packages/ui       # Figma 컴포넌트 기반 공유 UI (웹·확장 클립 모달 공유)
packages/shared   # 공유 타입·디자인 토큰·API 계약
supabase/         # migrations · functions(Edge, Deno)
```
### 2. 웹앱
- **React 18 + Vite + TypeScript**, **FSD**(app→pages→widgets→features→entities→shared, 하향 임포트만, 배럴 경유, `lint:fsd` 강제).
- 라우팅 React Router · 서버상태 TanStack Query · 클라이언트상태 경량(zustand 등).
### 3. 스타일 (픽셀-퍼펙트)
- Figma 토큰(`668:29`) → **CSS 변수**(`apps/web/src/app/styles`: `--color-*`,`--space-*`,`--text-*`,`--radius-*`,`--shadow-*`) + **CSS Modules**. 다크테마(#000/#121212).
- 무거운 UI 킷(MUI 등) ❌ → `packages/ui`를 **Figma 컴포넌트에서 직접** 구축(충실도 우선).
### 4. 크롬 확장 (MV3)
- **Vite + CRXJS** · content script(YouTube 페이지 주입: 플로팅 '영상 인사이트 얻기' 버튼 + 클립 모달) · popup(React) · background service worker.
- 클립 모달 = `packages/ui` 공유(인앱 클립 u3와 컴포넌트 재사용).
### 5. 백엔드 — Supabase
- **Postgres**(profiles, contents, clips, folders, tags, annotations[그랩/댓글], likes) + **RLS**(유저 데이터 격리, Oliver 검증 패턴) + **Edge Functions(Deno)**(콘텐츠 메타 fetch[YouTube oEmbed/Data API], 확장 클립 인제스트, 통합 검색, 또래/트렌드 집계).
- **Auth**: Google = Supabase 기본. **Naver/Kakao = 미지원 → 커스텀 OAuth 플로우(Edge Function) 필요**(열린 질문 §아래).
### 6. 테스트/CI
- Vitest(unit/contract) · Playwright(e2e/QA) · pgTAP(RLS). GitHub Actions로 Validation 명령 실행(Sprint 0 이후).

## Consequences
- **Good**: 웹·확장이 UI/타입 공유(클립 모달 1벌) · Supabase로 Auth+RLS+서버로직 일원화(Oliver 팀 친숙) · Vite 빠른 DX · FSD 경계로 증식 차단 · CSS 변수로 Figma 토큰 1:1.
- **Tradeoffs**: 모노레포 초기 설정 비용 · CRXJS는 MV3 빌드 결합도 · Supabase 종속 · Naver/Kakao 커스텀 OAuth 추가 작업.
- **Future impact**: AI(u5) 복귀 시 Edge Function에 서버측 LLM 게이트웨이 추가(브라우저 키 ❌ 준수). 결제(u10) 복귀 시 토스페이먼츠 Edge Function.

## Alternatives Considered
- **Next.js(풀스택)** — SSR 불필요(데스크톱 앱·인증 후 사용)·확장과 공유 구조 복잡 → Vite SPA 채택.
- **자체 Node 백엔드** — Auth/RLS 직접 구현 비용 → Supabase 채택(Oliver 검증).
- **Tailwind** — 픽셀-퍼펙트 Figma 토큰 매핑엔 CSS 변수+Modules가 더 직접적 → 보류(논의 가능).
- **단일 레포(모노레포 아님)** — 웹·확장 컴포넌트 중복 → 모노레포 채택.

## 열린 질문 (eng-review에서 결정)
1. **Naver/Kakao OAuth**: 커스텀 Edge Function 플로우 vs 서드파티(Auth0 등) vs MVP는 Google만?
2. **스타일**: CSS Modules vs vanilla-extract(타입세이프 토큰) vs Tailwind?
3. **클라이언트 상태**: zustand vs Redux Toolkit vs Context?
4. **콘텐츠 메타**: YouTube Data API(쿼터·키) vs oEmbed(키리스·제한적)?
5. **모노레포 도구**: pnpm workspaces only vs Turborepo(캐시)?
6. **확장↔웹 인증 공유**: 확장이 웹 세션/JWT를 어떻게 획득(메시지 패싱·토큰 저장)?

---

## Review Outputs (/plan-eng-review 2026-06-15)

### 확정 결정 (열린 질문 6개 + 텐션 → 해소)
- Phasing = **웹 우선 린 스타트** · MV3 = **WXT** · OAuth = **Google+Kakao**(Naver 후순위) · 상태 = **TanStack Query+React, zustand 보류** · 메타 = **oEmbed 우선** · 모노레포 = **pnpm only** · 시퀀싱(T1) = **u0 디자인시스템 + u0b 코어 데이터패스 스파이크 병렬**.

### NOT in scope (고려했으나 명시 연기)
- Naver OAuth(Custom OIDC) — Google+Kakao로 한국 다수 커버, 후순위.
- Turborepo — pnpm workspaces로 충분, 빌드 캐시 필요 시 후속.
- 확장 공유 UI 추출(`packages/ui`) — u6에서(2번째 소비자 등장 시).
- 호스팅 최종 택1(Cloudflare Pages vs Vercel) — 인증 작업 직전 결정(콜백 URL 의존).
- AI·대시보드·결제·아티클·연간(게이트 ⓐ 제외).

### What already exists
- 그린필드 — 재사용 코드 없음. 오케스트레이션 메타레이어(`.claude/`, `config/`, `state/`, `docs/`)만 존재. 디자인 = Figma 고정 SoT(생성 ❌, 추출).

### Failure modes (코어 데이터패스 — u0b가 테스트로 커버)
1. **cross-user 클립 누출**(RLS 오설정) — sanitized view/RPC만 노출, pgTAP로 *파생 API* 누출 0 증명. (silent leak = critical → 테스트 필수)
2. **콘텐츠 파편화**(URL 비정규화) — 정준키 + dedup 테스트.
3. **재식별**(니치 영상 익명화) — N명 미만 코호트 숨김.
4. **확장 ingest 401**(MV3 SW sleep·토큰 만료) — 401 재로그인 유도 + 세션 갱신 테스트.
5. **콜드스타트 빈 화면**(또래/트렌드) — 폴백(전역 인기·시드).

### Parallelization (worktree lanes)
| Lane | 단위 | owner/mode | depends |
|---|---|---|---|
| A | **u0**-design-system | frontend / 인터랙티브 워크트리 | — |
| B | **u0b**-data-core(스파이크) | backend / 헤드리스 `/goal` opus4.8 max | — |
| 이후 | u1·u2·u3·u4·u6·u7·u8·u11 | both | A(토큰) + B(데이터모델) |
> **Lane A + B 병렬 착수**(소유자·worktree 다름 — 충돌 0). 둘 머지 후 화면 단위 진행. u4는 B(히트맵·dedup·익명) 완료 의존.

### Implementation Tasks (스캐폴딩 → 병렬 착수)
- [ ] **T1 (P1)** — 모노레포 스캐폴딩: pnpm workspaces + `apps/web`(Vite+React+TS+FSD 골격·`lint:fsd`) + `supabase/` init + 호스팅 택1. → ADR-0001.
- [ ] **T2 (P1)** — u0b spec(데이터모델·RLS·sanitized view/RPC·히트맵·확장 ingest contract) 작성 + 헤드리스 스폰. → ADR-0002.
- [ ] **T3 (P1)** — u0 spec(Figma `668:29` 토큰·effect·컴포넌트 풀 추출 → `shared/ui`·`app/styles` + 앱 셸[GNB 대시보드탭 ❌]) 작성 + 인터랙티브 워크트리 핸드오프.
- [ ] **T4 (P2)** — Kakao Supabase 네이티브 연동 *사전 검증*(락 전).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | (게이트 ⓐ로 스코프 확정) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_folded | 7 arch findings + 27 Codex points → ADR-0001/0002 흡수 |
| Outside Voice | Codex (high) | 독립 2차 | 1 | issues_found | RLS/소셜애노테이션·dedup·콜드스타트·시퀀싱 |
| Design Review | `/plan-design-review` | UI/UX | 0 | — | (u0 디자인시스템 후) |

- **CODEX**: 코어 리스크(소셜 애노테이션 vs RLS, 콘텐츠 정준키, 히트맵 집계 프리미티브, 콜드스타트, 확장=플랫폼) → ADR-0002로 흡수, u0b가 락.
- **CROSS-MODEL**: 시퀀싱 텐션(디자인 우선 vs 코어 우선) → **병렬(A안)** 합의. FSD/zustand 텐션 → FSD 유지(경량)·zustand 보류.
- **VERDICT**: ENG CLEARED — ADR-0001 락, ADR-0002 = u0b 스파이크가 락. 스캐폴딩 + u0/u0b 병렬 착수 준비.

NO UNRESOLVED DECISIONS
