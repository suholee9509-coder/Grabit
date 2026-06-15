# u4-content-detail — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **검증·수정 완료(게이트ⓒ 충실도 사인오프 대기)** — 검증 에이전트 재실행(2026-06-16)
- 검증(재실행 실측): `tsc -b --force`=0 · `eslint .`=0 · `steiger ./apps/web/src`=✔(No problems) · `pnpm build`=OK(tsc -b + vite build, chunk-size 경고만 — 비차단) · `vitest run`=**86 passed / 16 files** · 콘솔 0(테스트 stderr 클린)
- DM1 옵션1 확정 적용: 인사이트=`content_clips_public` BE 배선만 · 댓글/답글·작성·좋아요 = 픽셀퍼펙트 UI + **데이터패스 차단**(목킹/비활성, annotations RPC 미호출, 신규 마이그레이션 ❌).
- 변경/신규 파일 (boundary 준수):
  - **pages/content-detail**: `index.ts` · `ui/{content-detail-page.tsx+.module.css, watch-info-tab.tsx, source-tab.tsx+.module.css}` · `content-detail.contract.test.tsx`
  - **widgets**: `video-player/` · `clip-heatmap/` · `social-sidebar/`(+comment-card) · `similar-content/` (각 index+ui)
  - **features**: `view-insights/`(api/{queries,insights-query,heatmap-query} · model/{cohort+test} · ui/{insight-card,popular-segments,cohort-banner,icons}) · `toggle-clip-like/` · `add-clip/`
  - **entities**: `clip`(+PublicClip·formatClockInterval) · `content`(+ContentDetail·format-meta) · `annotation`(신규 표현 전용 목)
  - **shared/api**: `content-read.ts`(신규)+test · `types.ts`(DTO 추가) · `demo-data.ts`(시드 추가) · `index.ts`(export)
  - **app**: `app.tsx`(content/:id → ContentDetailPage) · `app/content-detail-stub/`(삭제)
- 화면↔프레임 1:1:
  - 시청 정보 탭 = `2087:12538` · 원본 소스 탭 = `2087:13354` · 사이드바 접힘 = `2087:13772`.
  - 토큰 갭은 **슬라이스 로컬 CSS 변수**로 정의(u0c tokens.css 무변경): `--color-heatmap-track:#777777`·`--color-heatmap-peak:#26FA01`·`--color-rank-first:#38C524`·`--color-youtube-red:#ED1D24`·`--color-tab-border:#2D2D2D`·`--color-overlay-black-32`·`--shadow-player`.
- RPC 배선(소비만): `get_content_social_clips(p_content_id)`·`content_heatmap(p_content_id)`·`contents` select. raw `clips` 미쿼리(테스트로 단언). snake→camel 래퍼 내부. isSupabaseReady 분기 → demo 폴백.
- 리스크/게이트ⓒ 확인 항목:
  - **히트맵 마커 색**: spec 텍스트=`#ED1D24` 6×6 빨강 vs **실측=`#26FA01` 25×18 녹색(+틱 21×15)**. 세 측정문서 일치로 **녹색 채택**(실측 정본). `#ED1D24`는 유사카드 YT 아이콘. → PM 1회 사인오프.
  - **DM2 라우트 가드 [수정됨]**: `/content/:id`의 `<RequireOnboarded>` 가드 **제거**. spec `[state] 비로그인`·Production acceptance·[디자인 공백] IQDAKF가 "상세는 비회원도 열람 가능(역할에 비회원 포함)"을 명시 → no-fake-done 위반이던 가드(a)를 spec대로 완화. 페이지 내부 쓰기(좋아요/클립추가/작성)만 `onRequireLogin → /login` 유지. (DM2는 spec ESCALATION 미등재 — spec [디자인 공백]이 이미 해소했으므로 spec 정본대로 적용.) 게이트 전부 무회귀(86 pass).
  - 히트맵 bucket→px는 duration_sec 스케일(없으면 max(bucket_end) 폴백). 마커 px는 밀도 피크 도출(프레임 고정 px는 데모 한정).

STATUS = "검증·수정 완료: tsc/lint/fsd/build/86테스트 PASS · 콘솔 0 · DM1옵션1 적용(댓글 목킹) · DM2 가드 제거(spec 비로그인 열람 가능 충족) · ★게이트ⓒ 잔여 1건: 히트맵 마커 #26FA01녹색(실측 정본·세 측정문서 일치) PM 1회 사인오프 대기"
