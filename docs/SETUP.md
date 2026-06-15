# Grabit 셋업 가이드 (키만 꽂으면 구동 — 약 10분)

> 무인 자율 루프가 **코드·설정·검증을 전부 완비**했습니다. 남은 건 *사용자만 할 수 있는 것*(키 발급·클라우드 프로젝트·실배포)뿐입니다.
> 이 문서대로 따라 하면 로그인→온보딩→홈→클립→라이브러리→검색이 end-to-end로 동작하는 프로덕트가 뜹니다.
> SoT: ADR-0001(스택·배포) · ADR-0002(데이터/RLS) · `state/autonomous-runbook.md` §11.

현재 상태(무인 완료분):
- 웹앱(`apps/web`) · 크롬 확장(`apps/extension`) · DB 마이그레이션(`supabase/migrations/0001~0013`) · RLS/pgTAP(172/0) 전부 green.
- **키 미설정이면 결정론적 데모(목) 폴백**으로 화면은 그대로 뜸(`isSupabaseReady` 분기). 아래로 실키를 꽂으면 실제 데이터 경로로 전환됩니다.

---

## 0. 사전 준비 (로컬)
```bash
# Node 20 + pnpm 10.32.1 (corepack 권장)
corepack enable && corepack prepare pnpm@10.32.1 --activate
pnpm install
pnpm -C apps/web build        # 검증: dist 생성 (성공해야 함)
pnpm -C apps/web test         # 검증: vitest green
node supabase/tests/_pgtap_pglite.mjs   # 검증: pgTAP 172/0 (Docker 불필요)
```

## 1. Supabase 클라우드 프로젝트 (≈3분)
1. https://supabase.com → New project 생성(Region: 가까운 곳·예 Northeast Asia).
2. **Project Settings → API**에서 확보:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY` (⚠ `service_role` 키는 브라우저에 절대 넣지 말 것 — RLS 보호 anon만)

## 2. 마이그레이션 적용 (≈2분)
Supabase CLI(권장):
```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <프로젝트 ref>
pnpm dlx supabase db push          # supabase/migrations/0001~0013 순서 적용 (idempotent)
```
또는 대시보드 SQL Editor에 `supabase/migrations/0001_*.sql` … `0013_*.sql`를 **번호 순서대로** 붙여넣어 실행.
> 적용 후 핵심 객체: `profiles·contents·clips·folders` + RLS · `content_clips_public`(sanitized) · `content_heatmap` · `search_my_content`(한국어 FTS) · folders/소프트삭제/알림 RPC. (cross-user 누출 0 — pgTAP 정본)

## 3. OAuth 앱 등록 (Google + Kakao, ≈3분)
> Naver/이메일은 MVP 컷(ADR-0001). 콜백 URL = `https://<프로젝트 ref>.supabase.co/auth/v1/callback`.
- **Google**: Google Cloud Console → OAuth 2.0 클라이언트 ID 생성 → client id/secret →
  Supabase **Authentication → Providers → Google**에 입력 + 위 콜백 URL 등록.
- **Kakao**: Kakao Developers → 앱 생성 → REST API 키/시크릿 → Supabase **Providers → Kakao**에 입력 + 콜백 URL 등록.
- Supabase **Authentication → URL Configuration → Site URL/Redirect URLs**에 배포 도메인(및 `http://localhost:5173`)을 추가.

## 4. 환경변수 주입 (≈1분)
로컬:
```bash
cp .env.example apps/web/.env.local
# apps/web/.env.local 편집:
#   VITE_SUPABASE_URL=https://<ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<anon key>
pnpm -C apps/web dev    # http://localhost:5173 — 실제 로그인 동작 확인
```
배포(Cloudflare Pages): 프로젝트 환경변수에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 등록.

## 5. 배포 — Cloudflare Pages (ADR-0001, ≈2분)
- Cloudflare Pages → Git 연결(이 레포) 또는 직접 업로드.
- Build command: `pnpm -C apps/web build` · Output dir: `apps/web/dist` · Node 20 · 환경변수(4)에서 등록한 VITE_*.
- 배포 후 도메인을 §3 Supabase Redirect URLs에 추가.

## 6. 크롬 확장 (선택, ≈2분)
```bash
# 확장 env (apps/extension/.env): WXT_SUPABASE_URL·WXT_SUPABASE_ANON_KEY·WXT_WEB_APP_URL
pnpm -C apps/extension build      # → apps/extension/.output/chrome-mv3
```
- 크롬 `chrome://extensions` → 개발자 모드 → "압축해제된 확장 프로그램 로드" → `apps/extension/.output/chrome-mv3` 선택.
- YouTube 영상 페이지에서 "영상 인사이트 얻기" 버튼 → 클립 모달 → [완료] 전송 확인.
- (웹스토어 배포는 별도 심사 — 개인정보/권한 근거는 u6 spec 참고.)

## 7. 스모크 테스트 (≈1분)
1. 배포 URL(또는 localhost) 접속 → Google/Kakao 로그인.
2. 온보딩 4단계(직업·연차·관심분야·목표) → 홈(취향관/피드).
3. 좌측 "컨텐츠 추가" → YouTube URL → 트림+메모+폴더+태그 → 저장.
4. 라이브러리에서 클립 확인 → 검색(제목/메모/태그) → 콘텐츠 상세(히트맵·인사이트).

---

## 무인이 의도적으로 남긴 것 (사용자/후속 결정)
- **게이트 ⓒ 시각 사인오프**: 각 화면이 Figma와 픽셀-퍼펙트인지 최종 눈 확인(`state/overnight-log.md`의 단위별 라우트 참고).
- **OAuth 실키·Supabase 클라우드·실배포 트리거**: 위 §1·§3·§5 (무인이 추측 실행 ❌).
- **알림 실제 발송 인프라**(웹 푸시) · **annotations 댓글/답글 실데이터**(u4 옵션1=UI+목킹·ADR-0003 후보) · **추천 알고리즘 고도화**(현재 콜드스타트 폴백): 다음 스프린트.
- 게이트 ⓐ 제외 스코프(AI·대시보드·결제/구독·아티클·연간플랜)는 의도적 미구현.
