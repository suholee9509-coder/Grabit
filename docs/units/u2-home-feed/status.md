# u2-home-feed — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **구현 완료 · 보수 검증 에이전트 재검 PASS(2026-06-16, 2차) — 게이트 ⓒ(충실도 사인오프) 대기**
- 보수 검증(2차, 실측 재실행 — 게이트 6/6 PASS · Figma 직접 대비 충실도 PASS · 수정사항 없음):
  - `tsc -b --force`=0 · `eslint .`=0 · `steiger ./apps/web/src`=No problems found · `build`=성공(dist 생성, chunk>500kB 경고만) · `test`=**24 파일/178 테스트 PASS**(통합 베이스라인 — home-feed.contract 6 + home-empty-cold-start 2 + clip-flow 7 보존, 무회귀) · 콘솔 0(cold-start가 console.error spy로 0 단언).
  - Figma 직접 대비(get_figma_data) 측정 1:1 확인: 트렌드 그리드 카드 `2087:71188`=**356×461**(layout_XJZ4Z3)·#1B1B1B·shadow 0 4 16 .24·썸네일 332×187 r6 x12/y150·상단블록 x18/y20 w320 gap14·제목 Bold20 #FFFFFF·하단블록 y375 → GridCard tsx/css와 동일. demo-seed `GRID_ALL`=**12카드**(grid-1~12). 우 패널 토글 펼침 **420**/접힘 **40**(recommendation-rail.module.css `.rail`/`.collapsed`, collapsed useState). GrabCard 헤더=**1줄**(flex row: identity[아바타+이름+역할 nowrap] + 시간 우측). 칩 정상렌더: InterestChipRow 82×82·gap30·선택 ring brand-50 2px·라벨 #B4B4B4/active #66FF4B, FieldGlyph 7분야 전수 글리프(+fallback)·토큰(size-avatar-xl/ring·brand-primary-50) 전부 정의 — 누락/깨짐 없음. 푸터 `2087:71659`=#121212·r하단8·separator 1px .08·Nav pad40·"© 2025 Grabit" #B3B3B3 → SiteFooter와 동일(컬럼 카피는 Figma 원본 템플릿 잔재 그대로=1:1).
  - supabase/ diff=**0**(u0b 미접촉) 확인.
- (이하 1차 검증 기록 — 보존)
- 검증(clean checkout 재현 가능 · 검증 에이전트 실측 재실행):
  - `tsc -b --force` → **0 에러** (EXIT=0, 실측)
  - `eslint .` → **0 에러 / 0 경고** (EXIT=0, 실측)
  - `steiger ./apps/web/src` (lint:fsd) → **No problems found** (EXIT=0, 실측)
  - `pnpm test` (vitest run) → **13 파일 / 62 테스트 PASS** (실측 · 신규 home-feed.contract 6 + home-empty-cold-start 2 + clip-flow 7 보존)
  - `pnpm build` (tsc -b && vite build) → **성공**(EXIT=0, dist 생성 · chunk>500kB 경고만, 에러 아님)
  - 콘솔 에러 **0**: home-empty-cold-start.test가 `console.error` spy로 0 단언 + home 테스트 stderr grep clean.
  - `git diff --stat supabase/` → **0** (u0b 미접촉) · tokens.css = **additive only**(수정 0) · shared/ui·app-shell·sidebar·topbar = **0**(소비만)
- **R1 해소(검증 에이전트, Figma 직접 확인)**: 추천 카드 = Figma 풀스크롤 정본 `2087:70515` 실측 = **334×334**(layout_4K96N7)·inset14·썸네일 **306×172**(layout_HKDK5L) 1:1 확인. spec [fidelity]의 "172×172"는 썸네일 height(172) 약칭 — 구현 334×334(카드)/306×172(썸네일)이 프레임과 일치. **불일치 아님 · 픽셀-퍼펙트.**
- **contract 테스트 검수(비동어반복·결정론)**: `vi.mock('@/shared/api')`로 isSupabaseReady=false 강제 → demo-seed 결정론 경로(MSW 등가 — 데이터 경계 목킹). 단언은 *필터 인자별로 다른 시드 배열 반환*을 검증(AI칩→노코드 시드 등장·마케팅 트렌드 소거 / 마케팅탭→마케팅 시드·데이터 시드 소거 / 리더십칩→리더십 시드 / 카드클릭→`route:content:rec-mine-1`). 동어반복 아님.

- 런북 결정 반영: E1 신규 BE RPC ❌(demo-seed 콜드스타트 폴백이 MVP 주 경로) · E2 회원 홈만(RequireOnboarded) · E3 시드+빈상태 둘 다 인터페이스 · E4 우 추천 레일 포함 · E5 수신함 no-op 유지.

- 화면/섹션 → 측정 프레임 1:1 매핑:
  - 셸/GNB/톱바 = u0c(미변경 소비). 본문만 `<HomeFeed/>`로 교체.
  - 히어로(취향관/피드) = 2087:70387 / 2087:71885 (베이스 #0A0A0A·좌페이드·메타행 18/#B4B4B4·제목 36/700/#FAFAFA·썸네일 72×40·페이지 도트 48×7/#66FF4B).
  - 1차 세그먼트(취향관/피드) = 2087:70406 (Tabs segment lg + lh130% override·선택 #363636/흰·비선택 #999999).
  - 관심분야 칩행 = 2173:120904 / 칩active 2173:105190 / 재필터 2278:136811 (82×82·gap30·선택 링 brand-50 2px·라벨 #66FF4B·"분야 추가" Medium #FAFAFA).
  - 추천 캐러셀 카드 = 풀스크롤 2087:70515 (**334×334**·inset14·썸네일306×172 r6·클립배지 overlay-black-60·태그 .06/#CECECE).
  - 크로스/인사이트 카드 = 2557:35384/2278:136038 (252폭·썸네일251.81×142 r6·작성자 가변색·summary #FAFAFA).
  - underline 탭(크로스/인사이트) = 2087:69500 / 재필터 2278:136030 (h48·선택 pad10/0 + 2px 순백 언더라인·강조어 #20C974).
  - 피드 카테고리 칩 = 2087:71870~71884 (Chip filter·선택 #FAFAFA/#111111/600·비선택 .06/#B4B4B4/400).
  - 그리드/트렌드 카드 = 2087:71188 / 2087:72353 (**356×461**·#1B1B1B·shadow-card 0 4 16 .24·썸네일332×187 r6·제목 20/700 순백).
  - 실시간 인기 그랩(피드) = 2087:72950 (가로형 467×124·썸네일132×77·카드 사이 세로 divider .08).
  - 우 추천 레일 = 2087:71744 (**420** r8 #121212·작성 버튼 38px #333333 r7·제목 18/Bold 순백·GrabCard 버블+임베드 gap28).

- 콜드스타트/상태 처리:
  - 데이터 = `entities/recommendation` TanStack Query 훅 + `feed-api`(isSupabaseReady 분기, 집계 RPC 부재 → demo-seed 결정론 반환). 필터/재필터 = 클라 state → queryKey 분기.
  - 각 섹션 독립 로딩(스켈레톤 rec334/grid356/cross280/grab/stream)·빈("아직 추천이 없어요" 등)·에러(재시도 버튼). 히어로는 null 시 collapse(레이아웃 안전).
  - no-leak: 모델 셰이프에 user_id/실명/display_name **부재**. 작성자=가공 직군 라벨. cross-user clips 직접쿼리 ❌. `useMyProfileJob`=자기 행 select(RLS-safe).

- 라우팅: app.tsx에 `/content/:id`(RequireOnboarded) 등록 + `app/content-detail-stub`(u4 교체 자리). 카드 onSelect → widget이 navigate. 죽은 링크 ❌.

- 보존: clip-flow.test.tsx(useClipAddFlow·ExtensionInstallModal·?onboarded=1) 유지 — Router 래핑 추가로 그린 복구(기존엔 useSearchParams가 Router 없이 호출돼 RED였음).

- 리스크/미완:
  - **R1 [해소]**: 추천 카드 = 풀스크롤 정본 `2087:70515` Figma 실측 **334×334**(썸네일 306×172) 1:1 확인 — spec "172×172"는 썸네일 height 약칭. 픽셀-퍼펙트. (게이트 ⓒ 시각 사인오프만 남음)
  - **R2 (lh override)**: 세그먼트 lg 토큰 lh160% → 홈 실측 130%를 widget CSS `:global([role=tab])`로 override. shared/ui 미변경.
  - **R3 (썸네일 자산)**: 이미지 자산 미연동(imageUrl=null) → 면색 placeholder. 실 썸네일은 콘텐츠 메타 배선 후. 레이아웃·치수는 1:1.
  - **R4 (그라데이션/페이드)**: 히어로 좌페이드는 토큰 부재로 인라인 linear-gradient(측정 rgba(10,10,10)) 근사. 캐러셀 우페이드는 미구현(스크롤 어포던스만, 시각 영향 작음).
  - footer(Spotify 템플릿 잔재)는 스코프 외 → 미구현(셸 footer 별도 단위).
  - AI 패널·Sparkle FAB = 게이트 ⓐ 제외 → 미구현(엄수).

STATUS = "구현완료: 취향관/피드 2탭 + 우레일 1:1 퍼블리시 · tsc/eslint/steiger/build 0 · 62테스트 PASS · u0b·u0c 미접촉 · demo-seed 콜드스타트 폴백(E1) · /content/:id 라우팅 · 게이트 ⓒ(픽셀 사인오프) 대기 · R1 추천카드 334×334 확인요청"
