# u11-settings-account — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: BE 검증 완료 (pgTAP pglite GREEN · 커밋❌ — PM 통합 대기)
- 검증 (2026-06-16, `node supabase/tests/_pgtap_pglite.mjs`):
  - pgTAP files 21 · asserts **172 ok / 0 not ok** · file-errors 0 · exit 0.
  - 0013이 0001~0012 순차 적용 후 pglite에서 깨끗이 적용 (MIGRATION FAILED 없음).
  - **무회귀(0 not-ok)**: derived-api-no-leak 7/7 · rls-isolation 6/6 · profile-rls 4/4 · search-rls-isolation 6/6 — sanitized view CREATE OR REPLACE(컬럼 시그니처 보존 + `p.deleted_at is null`만 ADD)로 깨지지 않음 확인.
  - **누출0(gate 2) soft-delete-excludes-public 8/8**: 유예중(deleted_at set) user의 공개클립/주석 5→4, 코호트 라벨 →0(임계 미달), 히트맵 density 4, sanitized 모델 내 user_id 노출 0건, restore 시 →5 복귀. cross-user reader(bob)로 읽어 cross-user 노출 0 단언 통과.
  - 신규 RPC: update_profile 13/13(profile-update) · notification-pref 9/9 · soft-delete 11/11 전부 GREEN.
  - 보류 항목 없음(view replace가 기존 pgTAP를 깨지 않아 deleted 필터 유지).
- 변경 파일 (boundary 준수 · additive only):
  - `supabase/migrations/0013_settings_account.sql` (신규) — deleted_at 컬럼 + update_profile/get_my_profile/soft_delete_account/restore_account + notification_settings 테이블/RLS/RPC + sanitized view 3종(content_clips_public·content_annotations_public·onboarding_cohorts_public) CREATE OR REPLACE(privacy-only filter add).
  - `supabase/tests/{profile-update,notification-pref,soft-delete,soft-delete-excludes-public}.sql` (신규 pgTAP).
  - 기존 0001~0012 마이그 · 기존 pgTAP 무변경(FROZEN 준수).
- 설계 노트:
  - 전 화면 [디자인 공백](전용 Figma 프레임 없음). 진입점 2종만 프레임 존재 = GNB 프로필 카드 `I2087:13351;1306:4235`(계정메뉴 진입) · 수신함 nav `I2087:13351;1613:10940`. 나머지는 u0 파운데이션 토큰·shared/ui로 1:1 구성.
  - u0b ADR-0002 #6(프로필 private/public 분리)·#9(soft-delete 30일 유예)·#3(sanitized public read) 계약 위 additive 배선.
  - 게이트 ⓐ 제외: AI·결제/구독/요금제/영수증/연간·대시보드 탭(FD1)·아티클 클리핑. 알림은 트렌드 등 비결제 카테고리 *설정 저장*만(발송 인프라 후속).
- 리스크: 디자인 공백 6건 결정 미확정(spec 하단 ESCALATION 후보) → 스폰 전 사용자/PM 게이트 권장.
- ESCALATION: spec.md §디자인 공백 & ESCALATION 후보 1~6 (계정메뉴 형태·설정 IA·수신함/알림 관계·soft-delete 컬럼·표시이름 수정·알림 카테고리).

STATUS = "BE 검증 GREEN: pgTAP pglite 172 ok / 0 not ok / 0 file-errors (exit 0) · 무회귀(derived-api-no-leak·rls-isolation·profile-rls·search-rls-isolation 전부) · 누출0(soft-delete-excludes-public 8/8: 유예중 user 공개집계/코호트/히트맵 노출0·cross-user 0) · additive 0013만(0001~0012·기존 pgTAP FROZEN 무변경) · 커밋❌ PM 통합 대기 · 보류 항목 없음"

---

## FE 구현 완료 (2026-06-16 · 워크트리 u11-settings-fe)

- 상태: FE 구현 완료 · 전 게이트 GREEN · 커밋❌(PM 통합/충실도 사인오프 대기).
- 검증 (clean 재실행):
  - `tsc -b --force` 0 · `eslint .` 0 · `steiger ./apps/web/src` 0 (FSD 하향임포트·배럴·크로스슬라이스 0) · `pnpm -C apps/web build` exit 0.
  - vitest **전체 178 ok / 0 fail (24 files)** — u11 신규 30(profile-api 16 + settings 11 + inbox 3) 포함, 기타 유닛 무회귀.
  - 하드코딩 색 리터럴 0건(신규 CSS 전부 `var(--token)`; #HEX 1건은 주석 내 토큰값 표기뿐).
- 신규/수정 파일(boundary 내):
  - entities/profile [확장]: types(deleted_at·ProfileEditInput·UpdateProfileArgs·NotificationPref) · options(NOTIFICATION_CATEGORIES 3종 비결제) · profile-api(toUpdateArgs·getMyProfile·updateProfile·softDeleteAccount·restoreAccount·get/setNotificationPref·mergeNotificationState + supabase null 목 폴백) · queries(useMyProfile·useUpdateProfile·useSoftDelete·useRestoreAccount·useNotificationPrefs·useSetNotificationPref) · index 배럴 · profile-api.test(+16).
  - widgets/account-menu [신규]: 프로필 카드 chevron 진입 팝오버(프로필설정·설정·로그아웃·탈퇴) — surface-100·radius10·border-subtle·shadow-popover(토큰만), 외부클릭/Esc 닫힘.
  - features/profile-edit [신규]: use-profile-edit(드래프트·검증·dirty·잠금) + ProfileEditSection(표시이름 Input·단일칩 직업/연차/상황·멀티칩 관심 1~5·public/private 시각분리·인라인 invalid·스켈레톤).
  - features/account-actions [신규]: useLogout(signOut→세션갱신) · useAccountLifecycle(soft_delete·restore·graceEndDate) · LogoutConfirm·WithdrawConfirm(30일유예+2단계 동의체크 오발화방지)·RecoveryBanner(Card+Button).
  - features/notification-settings [신규]: use-notification-prefs(카탈로그+prefs 병합·낙관/롤백) + NotificationSettingsSection(Toggle 행).
  - pages/settings [신규]: 단일 페이지 #profile/#notifications/#account 앵커 + AppShell+Sidebar(onProfileClick→AccountMenu)+Topbar + 복구배너 + 토스트 + 계약테스트.
  - pages/inbox [신규]: AppShell+Sidebar(activeMenu='inbox')+Topbar + 빈상태(파운데이션 EmptyState '받은 알림이 없어요')·스켈레톤 + 계약테스트.
  - app/app.tsx [수정]: /settings·/inbox 라우트 2개 추가(RequireOnboarded·기존 라우트/가드 미접촉).
- 카디널 룰 준수:
  - ① 진입점 2종 = widgets/sidebar·app-shell·topbar **1줄도 미수정**(git diff stat 빈 결과 확인) — pages 레이어에서 onProfileClick·onMenuSelect·activeMenu props만 와이어링.
  - ② 나머지 7화면 = 전용 프레임 없음 → tokens.css·shared/ui 1:1. 발명 0·하드코딩 HEX 0. danger 색 토큰 부재 → 탈퇴 위험은 색이 아닌 카피+2단계 확인(중립 secondary 버튼)으로 전달(ESCALATION 회피).
  - 인증(social-login·session signOut·route-guards)·온보딩·u0b 락·0013 마이그레이션 전부 미접촉(소비만).
- 0013 RPC 배선: get_my_profile→useMyProfile · update_profile→useUpdateProfile(23514 인라인·P0002 ACCOUNT_DELETED→폼잠금+복구유도·42501→로그인) · soft_delete_account/restore_account→useSoftDelete/useRestoreAccount(멱등) · set/get_notification_prefs→useSet/useNotificationPrefs(비결제 클라가드). supabase null 시 결정론 목 폴백.
- 디자인 공백 결정 6건: spec §ESCALATION 기본값대로 확정(팝오버·단일페이지 앵커·수신함목록↔알림설정 분리·deleted_at+복구배너·표시이름 수정필드·비결제 카테고리만). 전부 reversible — 게이트 ⓒ 충실도 사인오프 대기.
- 미완/리스크: (1) `/design-review`(Figma MCP 충실도 — 진입점 2종 1:1 회귀 + 파운데이션 일관)는 인터랙티브 워크트리 = **사용자 운전 대기**(headless 미실행). (2) 알림 실제 발송 인프라 부재 → 수신함 목록은 빈/시드만(게이트 ⓐ 후속). (3) 위 STATUS 라인의 BE는 별도 GREEN — FE는 소비만(미수정).

STATUS_FE = "FE 구현 완료 · tsc 0/eslint 0/steiger 0/build 0 · vitest 178 ok 0 fail(u11 신규 30) · 진입점 2종 위젯 미수정(props 와이어링만)·하드코딩 색 0(토큰만)·danger 색 발명회피(카피+2단계 확인) · 0013 RPC 6종 배선(목폴백) · 디자인 공백 6결정 spec 기본값(reversible) · 미완=/design-review 충실도(사용자 워크트리 운전 대기)·알림 발송 후속 · 커밋❌ PM 통합 대기"

---

## FE 검증 패스 (2026-06-16 · u11-settings-fe 검증·수정 에이전트)

- 결과: **전 게이트 GREEN · 수정 불필요(no-fake-done 통과 — spec L1-a~e·[state] 항목별 실측 확인)**.
- 게이트 (clean 재실행, exit 코드 실측):
  - GATE1 `tsc -b --force` = 0 · GATE2 `eslint .` = 0 · GATE3 `steiger ./apps/web/src` = PASS(✔ No problems found · FSD 하향임포트·배럴·크로스슬라이스 0) · GATE4 `apps/web build` = 0(vite 2200 modules · 청크경고만 — 비차단).
  - GATE5 vitest **178 ok / 0 fail (24 files)**. u11 신규 26(settings-page 11 + inbox-page 3 + profile-api +12) → **기존 152 무회귀 정확 확인**(178−26=152, prompt 기준치 일치. status 상단 "30"은 profile-api 16 전체 카운트). 콘솔 0(console.error/warn·act 경고 0건 — GATE6).
- contract 테스트 실측(요구 시나리오 전부 커버):
  - settings(11): 계정메뉴 오픈(팝오버 4항목) · 프로필 목값 렌더 · **빈 표시이름→invalid+저장차단** · **관심 0개→INTERESTS_MIN 차단** · **관심 5개→미선택 칩 disabled(MAX 경계)** · 저장→성공 토스트 · **로그아웃→확인모달→/login** · **탈퇴 확인모달(30일유예·복구안내)+2단계 동의 전 확정 disabled** · 알림 토글 ON/OFF 저장·결제 카테고리 부재 · 오발화방지(메뉴 선택만으로 soft_delete 미실행).
  - inbox(3): **빈상태 카피**("받은 알림이 없어요") · 수신함 nav active(aria-current) · 프로필카드→설정 라우팅.
  - 결정론: `vi.mock('@/shared/api')` supabase null → entities/profile·session 목 폴백 + `setMockSession(true)` 단일 본인 세션(본인만 단언, cross-user 미관여). MSW 대신 모듈목이나 결정론·외부목킹 충족(spec Validation FE "외부 목킹").
- spec 충족 실측(no-fake-done):
  - L1-a 계정메뉴: widgets/account-menu 팝오버 4항목 · 프로필카드 chevron(onProfileClick) 진입 ✓
  - L1-b 프로필 조회/수정: get_my_profile→useMyProfile · update_profile→useUpdateProfile · public(직업·연차=코호트 공개)/private(상황·관심·표시이름=나만 보기) **시각 분리 = ADR-0002 #6·#3·0013 주석(PRIVATE interests/goal/display_name; PUBLIC job/years) 정합 확인** · 관심 1~5·단일필수·빈 표시이름 클라 차단(toUpdateArgs + UI) ✓
  - L1-c 로그아웃: useLogout(signOut→세션캐시 갱신)→/login replace ✓
  - L1-d 탈퇴: WithdrawConfirm 2단계 동의+30일유예·복구 카피 → soft_delete_account(deleted_at) · RecoveryBanner(restore_account 1클릭) · graceEndDate(+30d) ✓
  - L1-e 수신함/알림: InboxPage 빈상태·스켈레톤 · NotificationSettingsSection 토글(낙관+롤백) · 비결제 3카테고리(0013 CHECK 정합) ✓
  - [state] 빈(EmptyState·관심 placeholder)·로딩(스켈레톤·버튼 펜딩)·에러(토스트+권한가드) 전부 파운데이션 패턴 확인.
  - 진입점 2종 비주얼 보존: `git diff --stat` widgets/sidebar·app-shell·topbar·app/styles **빈 결과(1줄도 미수정)** — props 와이어링만. 토큰 미정의 참조 0(전 var(--token) 정의 확인). 하드코딩 HEX 0(주석만).
  - 실 Supabase 에러경로 정합: PostgrestError extends Error(@supabase/postgrest-js 2.108.2 src 확인) → RAISE EXCEPTION 'ACCOUNT_DELETED/DISPLAY_NAME_REQUIRED' message가 err.message로 전달 → errorCopy 매핑 동작 · 42501 미인증은 RequireOnboarded 가드가 /login 선차단.
- 미완(범위 밖·후속): (1) `/design-review` Figma MCP 충실도(진입점 2종 1:1 회귀 + 파운데이션 일관)는 인터랙티브 워크트리=사용자 운전 대기(headless 미실행). (2) 알림 발송 인프라 부재→수신함 빈만(게이트 ⓐ 후속). 본 에이전트 단독·커밋 ❌·별도 design-review 없음.

STATUS_FE_VERIFY = "전 게이트 GREEN(tsc0/eslint0/steiger PASS/build0/vitest 178ok 0fail/콘솔0) · contract 요구 시나리오 전부 커버(계정메뉴·프로필 1~5경계·빈이름차단·로그아웃→/login·탈퇴 2단계→soft-delete·수신함 빈·알림 토글) · 기존152 무회귀 정확확인 · spec L1-a~e·[state] 실측 충족(no-fake-done) · 진입점 2종 미수정(git diff stat 빈)·토큰만·HEX0 · 실 에러경로 정합 확인 · 수정 불필요 · specMet=true · remaining=/design-review(사용자 운전)·알림 발송(후속) · 커밋❌ PM 통합·충실도 사인오프 대기"
