# u11-settings-account — plan.md (FE 구현 계획)

> Sprint 0 후행 · owner=both · **mode=인터랙티브 워크트리(사용자 운전)** · dep=u0(디자인시스템·shared/ui·앱셸/GNB) + u0b(데이터코어) 머지 후 · BE(0013) 머지·검증 GREEN(172 ok/0 not ok) — **FE는 0013 RPC 소비만**.
> 정본 = `spec.md`(이 디렉토리). 매 턴 spec + tokens.css + shared/ui + 진입점 2종 Figma(`figma/`) reload. status.md 매 턴 갱신.

---

## ★★ 카디널 룰 (이 단위의 최우선 제약 — 위반 시 즉시 STOP)

1. **진입점 2종 = 기존 Figma 프레임과 픽셀 1:1 (이미 u0c sidebar에 구현 — 훼손 금지·소비만)**
   - **GNB 프로필 카드** `I2087:13351;1306:4235` → 계정메뉴 진입점. 구현체 = `widgets/sidebar/ui/sidebar.tsx` L160–182 `profileCard`(226×50·pad8/12·radius10·stroke .08·아바타28·이름14/130%/-2.5% #FAFAFA·thunder12+Premium12 #199E41·chevron16). **미수정** — `onProfileClick` 콜백만 와이어링.
   - **GNB 수신함 nav** `I2087:13351;1613:10940` → 수신함 진입점. 구현체 = `sidebar.tsx` L65 `MENU` 4번째 `{ key:'inbox', label:'수신함', icon:<InboxIcon/> }`(h32·pad8/10·gap8·radius8·아이콘20·Body3 #B4B4B4). **미수정** — `onMenuSelect('inbox')`/`activeMenu='inbox'`만 와이어링.
   - sidebar `index.ts`는 `Sidebar` + props 타입만 공개(NavItem/icons 비노출). u11은 sidebar 내부 1줄도 건드리지 않고 **상위(pages 레이어)에서 props만 연결**. (figma/ 실측 §2: 두 진입점 모두 하드코딩 HEX 0건 · 전 속성 tokens.css 매핑 검증 완료.)
2. **나머지 7화면(계정메뉴·설정·프로필수정·로그아웃·탈퇴·수신함 본문·알림)은 전용 Figma 프레임 없음 = 디자인 공백**
   - **u0 파운데이션 tokens.css + shared/ui 컴포넌트와 1:1로만 조립. 새 비주얼 발명 ❌ · 하드코딩 HEX ❌ · 추측 비주얼 ❌.**
   - 시각 기준점 = 진입점 카드가 검증한 토큰 셋(아래 §2-3 토큰표)을 그대로 승계 → 파운데이션 일관.

---

## 1. 파일 트리 (FSD · 신규/수정 구분 · 모두 boundary 내)

> 타깃 디렉토리 6종 전부 **현재 부재**(greenfield) 확인. FSD 하향 임포트만(app→pages→widgets→features→entities→shared), 동일레이어 크로스슬라이스 ❌, 배럴 경유. blast radius = `feat/u11-settings-account`.

```
apps/web/src/
├─ app/
│  └─ app.tsx                                    [수정] /settings · /inbox 라우트 등록(RequireOnboarded 가드)
│                                                       — 라우트 2개 추가만. 기존 라우트/가드 미접촉.
│
├─ pages/
│  ├─ settings/                                  [신규] 설정 단일 페이지 + 앵커 섹션(프로필·알림·계정)
│  │  ├─ index.ts                                  배럴(SettingsPage export)
│  │  ├─ ui/
│  │  │  ├─ settings-page.tsx                       AppShell+Sidebar(activeMenu 없음/profile 와이어)+Topbar
│  │  │  │                                          본문 = 섹션 3개(#profile/#notifications/#account 앵커)
│  │  │  └─ settings-page.module.css                섹션 레이아웃·간격(토큰만)
│  │  └─ settings-page.contract.test.tsx            프로필 수정·알림 토글·로그아웃·탈퇴 플로우 계약 테스트
│  │
│  └─ inbox/                                     [신규] 수신함 목록 화면(알림 목록 + 빈상태)
│     ├─ index.ts                                  배럴(InboxPage export)
│     ├─ ui/
│     │  ├─ inbox-page.tsx                          AppShell+Sidebar(activeMenu='inbox')+Topbar + 알림 목록/빈상태
│     │  └─ inbox-page.module.css                   목록·빈상태·스켈레톤(토큰만)
│     └─ inbox-page.contract.test.tsx               빈상태·로딩·(목록 렌더) 계약 테스트
│
├─ widgets/
│  └─ account-menu/                              [신규] 프로필 카드 chevron → 팝오버 메뉴
│     ├─ index.ts                                  배럴(AccountMenu export)
│     └─ ui/
│        ├─ account-menu.tsx                        팝오버: [프로필 설정] [설정] [로그아웃] [회원 탈퇴]
│        │                                          앵커 = 프로필 카드 DOM · shared/ui Dropdown/Card 토큰 승계
│        └─ account-menu.module.css                 팝오버 면(surface-100 #1F1F1F·radius10·border-subtle)
│
├─ features/
│  ├─ profile-edit/                              [신규] 프로필 조회/수정 폼(L1-b)
│  │  ├─ index.ts                                  배럴(ProfileEditSection + useProfileEdit)
│  │  ├─ ui/
│  │  │  ├─ profile-edit-section.tsx                표시이름 Input + 직업/연차/상황 단일칩 + 관심분야 1~5 멀티칩
│  │  │  │                                          public(직업·연차) vs private(관심·상황·표시이름) 시각 분리
│  │  │  └─ profile-edit-section.module.css
│  │  └─ model/
│  │     └─ use-profile-edit.ts                     검증(빈/공백 표시이름·관심 1~5)·저장 뮤테이션·낙관/재조회
│  │
│  ├─ account-actions/                           [신규] 로그아웃 + 탈퇴(L1-c·d)
│  │  ├─ index.ts                                  배럴(LogoutConfirm·WithdrawConfirm·RecoveryBanner + 훅)
│  │  ├─ ui/
│  │  │  ├─ logout-confirm.tsx                       로그아웃 확인 모달(shared/ui Modal)
│  │  │  ├─ withdraw-confirm.tsx                     탈퇴 확인 모달(30일 유예·복구 안내 문구 포함)
│  │  │  ├─ recovery-banner.tsx                      재로그인 시 soft-delete 복구 배너(restore_account 1클릭)
│  │  │  └─ account-actions.module.css
│  │  └─ model/
│  │     ├─ use-logout.ts                            signOut → /login 리다이렉트
│  │     └─ use-account-lifecycle.ts                soft_delete_account / restore_account 뮤테이션
│  │
│  └─ notification-settings/                     [신규] 알림 ON/OFF 토글(L1-e, 설정 '알림' 섹션)
│     ├─ index.ts                                  배럴(NotificationSettingsSection + 훅)
│     ├─ ui/
│     │  ├─ notification-settings-section.tsx       카테고리별 Toggle 행(비결제 카테고리만)
│     │  └─ notification-settings-section.module.css
│     └─ model/
│        └─ use-notification-prefs.ts               get_notification_prefs/set_notification_pref 조회·저장
│
└─ entities/
   └─ profile/                                   [수정] soft-delete·display_name·수정 RPC 데이터 표면 확장
      ├─ index.ts                                  [수정] 신규 export 추가(아래 함수/훅/타입)
      ├─ model/
      │  └─ types.ts                               [수정] Profile에 deleted_at 필드 추가(현재 누락)
      └─ api/
         ├─ profile-api.ts                         [수정] getMyProfile·updateProfile·softDelete·restore·
         │                                          notification prefs 표면 추가(+ supabase null 목 폴백)
         ├─ queries.ts                             [수정] useMyProfile·useUpdateProfile·useSoftDelete·
         │                                          useRestoreAccount·useNotificationPrefs·useSetNotificationPref
         └─ profile-api.test.ts                    [수정] 신규 표면 단위 테스트 추가
```

### entities 확장이 profile에 들어가는 이유 (FSD 근거)
- 0013 RPC(`get_my_profile`/`update_profile`/`soft_delete_account`/`restore_account`)는 모두 **`profiles` 행** 위 자기-라이프사이클 = profile 엔티티의 자연 소유. 온보딩이 만든 `entities/profile`(options·Profile·complete_onboarding 패턴)을 **확장**한다(신규 엔티티 분기 ❌ = 안티-증식).
- `notification_settings`는 별도 도메인이나 per-user 설정 1테이블 + 2 RPC로 작아, 신규 `entities/notification`을 만들지 않고 `entities/profile/api`에 prefs 표면을 둔다(소비처가 설정 페이지 1곳). *대안(엔티티 분리)은 reversible — in-flight 비대화 시에만 검토, 기본은 profile 흡수.*

---

## 2. 컴포넌트 재사용 맵 + 토큰표

### 2-1. shared/ui 재사용 (전부 기존 — 신규 프리미티브 발명 ❌)
| 화면/요소 | shared/ui 컴포넌트 | 주요 prop | 비고 |
|---|---|---|---|
| 계정 메뉴(팝오버) | `Dropdown`(`items`/`onSelect`/`trigger`) 또는 `Card` 면 + 메뉴 항목 | `defaultOpen`·`items[{id,label}]` | 앵커=프로필 카드. 4항목(프로필/설정/로그아웃/탈퇴). |
| 표시이름 입력 | `Input`(`variant='default'`) | `invalid`·value/onChange | h42·bg surface-200·radius6(측정값 내장). 빈/공백 시 `invalid`. |
| 직업/연차/상황 칩 | `Chip`(`variant='default'`, `selected`) | `selected`·onClick | 온보딩과 동일 폼팩터(42h·radius6). 단일선택. |
| 관심분야 멀티칩 | `Chip`(`variant='default'`, `selected`) | `selected`·onClick | 1~5 멀티. (직접입력 칩은 온보딩 `interest-custom-input` 재사용 검토 — 범위 내라면 흡수.) |
| 로그아웃/탈퇴 확인 | `Modal`(`open`/`onClose`/`title`/`footer`) | `width`(sm=582)·`footer`(Button×2) | 탈퇴 footer = 위험 액션(취소+탈퇴). |
| 알림 토글 | `Toggle`(`checked`/`onCheckedChange`) | `aria-label`·disabled | 카테고리별 행. ★FD2 ON #2563EB·OFF surface-300(토큰). |
| 저장/탈퇴/로그아웃 버튼 | `Button`(`variant`/`size`/`neonLabel`) | pending=disabled | 주 CTA = primary+neonLabel(#66FF4B). 탈퇴 확정은 danger 스타일(아래 토큰표 참조). |
| Premium 배지(메뉴 헤더 선택사항) | `Badge` | — | 프로필 카드와 동일 #199E41(승계만). |
| 토스트(저장/탈퇴/로그아웃 결과) | `Toast`(`variant='success'|'error'`) | — | library-page 패턴(setTimeout 자동 닫힘)과 동일. |
| 복구 배너 | `Card` 면 + `Button` | — | 전용 배너 컴포넌트 없음 → Card+Button 토큰 조립. |
| 빈상태/스켈레톤 | **shared 컴포넌트 없음** → 페이지-local CSS | — | library-page `styles.empty`/`styles.sideSkeleton` 패턴 그대로 재현(토큰만). |

> ⚠ **EmptyState·Skeleton 공용 컴포넌트는 레포에 부재** — 기존 페이지(library/search)는 페이지-local module.css로 빈/로딩을 그린다. u11도 동일 패턴(신규 shared 프리미티브 추가 ❌ → 파운데이션 일관). 수신함 빈상태·프로필/수신함 로딩 스켈레톤은 inbox/settings 페이지 CSS에서 토큰으로 조립.

### 2-2. 셸/위젯 재사용 (앱셸 구조 미접촉 — 소비만)
| 요소 | 출처 | 와이어링 |
|---|---|---|
| `AppShell` | `widgets/app-shell` | sidebar/topbar/children 슬롯(미수정). |
| `Sidebar` | `widgets/sidebar` | `onProfileClick`→계정메뉴 오픈 · `onMenuSelect('inbox')`→`navigate('/inbox')` · `activeMenu` · `profile={{name,avatarSrc,premium}}`(useMyProfile에서). **위젯 내부 미수정.** |
| `Topbar` | `widgets/topbar` | breadcrumb 슬롯(설정/수신함 라벨). library-page 패턴. |

### 2-3. 토큰표 (디자인 공백 화면 — 진입점 카드가 검증한 토큰 승계, tokens.css 라인)
| 용도 | 토큰 | 값 | tokens.css |
|---|---|---|---|
| 페이지/패널 배경 | `--color-surface-100` | #1F1F1F (모달·팝오버 면) | L29 |
| 입력/칩 bg | `--color-surface-200` | #242424 | L30 |
| 메뉴 항목 hover | `--color-surface-hover` | rgba(255,255,255,.06) | L133 |
| 카드/섹션 보더·divider | `--color-border-subtle` | rgba(255,255,255,.08) | L122 |
| 입력 보더 | `--color-border-default` | rgba(255,255,255,.10) | L123 |
| 칩 보더 | `--color-border-chip` | rgba(255,255,255,.12) | L124 |
| 주 텍스트 | `--color-text-primary` | #FAFAFA | L49 |
| 보조 텍스트 | `--color-text-secondary` | #B4B4B4 | L50 |
| placeholder·메타 | `--color-text-tertiary` | #999999 | L51 |
| 주 CTA(저장) 네온 | `--color-point-green` (#66FF4B) | neonLabel | L66 주변 |
| Premium 배지(승계) | `--color-premium-green` | #199E41 | L72 |
| 토글 ON | (Toggle 내장) | #2563EB | toggle.tsx |
| 토글 OFF | `--color-toggle-off` | #313131(surface-300) | L129 |
| radius(팝오버/카드) | `--radius-10` / `--radius-md` | 10 / 8 | L244 / L242 |
| 섹션 간격 | `--space-7`/`--space-8` | 14 / 16 | L227 / L228 |
| Body3(본문) | `--text-body-3-*` | 14/160%/-2% | L178 |
| Body4(메타·태그) | `--text-body-4-*` | 13/18 | L179 |

> **위험 액션(탈퇴 확정) 색 = [디자인 공백 + 토큰 공백]**: tokens.css에 danger/destructive 색 토큰 미보유(검색 결과 0건). **추측 HEX 발명 ❌**. → 탈퇴 확정 버튼은 (a) Secondary/outline + 명시 문구("계정을 영구 삭제 대신 30일 유예") 또는 (b) 기존 `Button` 변형 중 위험 표현 가능한 것 재사용. **신규 danger 토큰 추가는 ESCALATION**(파운데이션 변경 = u0 영역). 기본값: 확인 모달 + 비-네온(중립) 버튼 + 명확 문구로 오발화 방지(색이 아닌 카피·2단계 확인으로 위험 전달).

---

## 3. 데이터 배선 (0013 RPC 계약 — FE 훅 매핑)

> 패턴: 기존 `entities/profile/api/profile-api.ts`(`if (!supabase) {목}` 폴백) + `queries.ts`(TanStack Query) 그대로 따른다. **MSW 미사용** — 결정론적 목 = `supabase` null 폴백 + 테스트는 `vi.mock('@/shared/api')`로 `supabase: null` 강제(library.contract.test.tsx 패턴). `isSupabaseReady` 사용.

### 3-1. RPC 계약 요약 (0013 — FE가 소비, 인자/반환 정확값)
| RPC | 인자 | 반환 | FE 훅 | 에러 코드 → UI |
|---|---|---|---|---|
| `get_my_profile()` | 없음 | `public.profiles`(display_name·job·years·goal·interests·onboarded_at·**deleted_at**) | `useMyProfile` | RLS self-only. deleted_at 비NULL → 복구 배너. |
| `update_profile(p_display_name, p_job, p_years, p_goal, p_interests)` | text·text·text·text·**text[]** | `public.profiles`(갱신 행) | `useUpdateProfile` | 42501→로그인 · 23514(DISPLAY_NAME_REQUIRED/JOB/YEARS/GOAL/INTERESTS_MIN/MAX)→인라인검증 · P0002 ACCOUNT_DELETED→복구 유도 · PROFILE_MISSING→온보딩 |
| `soft_delete_account()` | 없음 | `public.profiles`(deleted_at=now()) | `useSoftDelete` | 멱등(이미 deleted=무해 no-op). 42501→로그인. **hard-delete 아님**. |
| `restore_account()` | 없음 | `public.profiles`(deleted_at=null) | `useRestoreAccount` | 멱등(live 행 무해). 복구 배너 1클릭. |
| `set_notification_pref(p_category, p_enabled)` | text·boolean | `public.notification_settings`(upsert 행) | `useSetNotificationPref` | 23514 CATEGORY_REQUIRED/ENABLED_REQUIRED · **비결제 CHECK**(billing/subscription/receipt 거부=23514) |
| `get_notification_prefs()` | 없음 | setof `notification_settings`(category·enabled·…) | `useNotificationPrefs` | RLS self-only. 0건=빈→기본 카테고리 OFF/ON 표기. |
| 로그아웃 | — | — | `useLogout`(`entities/session.signOut`) | 기존 `signOut()` 재사용(supabase.auth.signOut + 목). → /login. |

### 3-2. 호출 규칙 (보안·본인만·폴백)
- **본인만**: 전 RPC가 SECURITY INVOKER + RLS self(`auth.uid()`) — FE는 id 인자를 넘기지 않음(타 user 도달 불가). `profiles`/`notification_settings` cross-user read 금지(자기 행만). user_id 직접 노출 ❌.
- **update_profile 인자 매핑**: 폼 → `{ p_display_name, p_job, p_years, p_goal, p_interests }`. **클라 사전 검증**(빈/공백 표시이름·관심 1~5·단일필수)은 `toCompleteArgs` 패턴을 미러한 `toUpdateArgs`로(차단 UI 보조 — BE가 재검증·무해화 = 이중 방어). 관심분야 trim+filter.
- **목 폴백(supabase null)**: `get_my_profile`=목 프로필(온보딩 목 상태 재사용 + display_name 초기값=OAuth 이름 placeholder) · `update_profile`=목 상태 갱신 + 동일 검증 throw(코드 보존) · `soft_delete_account`/`restore_account`=목 deleted_at 토글(멱등) · notification prefs=sessionStorage/메모리 목. **결정론 보장**(테스트·데모).
- **캐시 무효화**: update→`profileKeys.all` invalidate(낙관적 또는 재조회). soft_delete→세션/게이트 무효화(복구 배너 평가). restore→profile 무효화. 로그아웃→`sessionKeys.current` 갱신(onAuthStateChange) → 가드가 /login.
- **mutation pending → 버튼 disabled**(저장/탈퇴/로그아웃 오발화·중복 방지).

### 3-3. 진입점 와이어링 (카디널 ①)
- 설정/수신함 페이지가 `AppShell` 호스트로 `Sidebar` 렌더(library-page 패턴 동일). `Sidebar.profile`은 `useMyProfile()`의 display_name·avatar·premium에서. `onProfileClick`→계정메뉴 팝오버 state 토글(앵커=프로필 카드). `onMenuSelect`→home/search/library/inbox navigate. **sidebar.tsx 미수정**(props만).

---

## 4. 빈 / 로딩 / 에러 상태 (전부 파운데이션 — 프레임 공백이므로 파운데이션이 SoT)
| 화면 | 빈 | 로딩 | 에러 |
|---|---|---|---|
| 프로필 수정 | 관심분야 미설정=플레이스홀더 칩 비선택 | get_my_profile fetch 중 스켈레톤(page-local CSS) · 저장 버튼 pending | 저장 실패=Toast(error)+재시도 · 권한(42501)=로그인 리다이렉트 · 23514=인라인 invalid |
| 계정 메뉴 | — | — | — (정적 메뉴) |
| 로그아웃 | — | 버튼 pending | 실패=Toast(error)+재시도 |
| 탈퇴 | — | 확정 버튼 pending | 실패=Toast(error)+재시도 · 멱등(이미 deleted 무해) |
| 복구 배너 | — | restore pending | 실패=Toast(error)+재시도 |
| 수신함 | 알림 0건=빈상태(page-local EmptyState 카피 "받은 알림이 없어요") | 목록 fetch 중 스켈레톤 행 | fetch 실패=재시도 |
| 알림 설정 | prefs 0건=기본 카테고리 표기 | prefs fetch 중 | set 실패=Toast(error)+토글 롤백 |
| 미인증 접근 | — | 가드 로딩 스피너 | 미인증→/login(RequireOnboarded 가드 재사용) |

> 스켈레톤/빈상태 = library-page `styles.sideSkeleton`/`styles.empty` CSS 패턴 재현(토큰만 — surface-hover 펄스·text-secondary 카피). 신규 shared 프리미티브 ❌.

---

## 5. 테스트 계획 (Validation — QA가 clean checkout에서 재실행)

> FE = `vitest` 컴포넌트/플로우(외부 목킹 = `vi.mock('@/shared/api')` supabase null). 라우팅 = `MemoryRouter`+`Routes`(library.contract.test.tsx 패턴, app 레이어 import = 상향 금지 → 인라인 스텁). 세션 = `setMockSession(true)`.

### 5-1. settings-page.contract.test.tsx
- **계정 메뉴 오픈**: 프로필 카드(chevron) 클릭 → 팝오버 4항목(프로필 설정·설정·로그아웃·회원 탈퇴) 표시.
- **프로필 수정 검증**:
  - get_my_profile 목값 렌더(직업/연차/상황 단일 선택 상태·관심 칩·표시이름).
  - 관심분야 **0개 선택 → 저장 차단**(INTERESTS_MIN) · **6개 시도 → 차단**(INTERESTS_MAX) · **1~5 정상 → 저장 성공 Toast**.
  - **빈/공백 표시이름 → 저장 차단**(invalid 표시).
  - 단일필수(직업/연차/상황) 미선택 → 차단.
  - 저장 성공 → 재조회/낙관 반영(갱신값 화면 표시).
- **로그아웃 리다이렉트**: 메뉴 로그아웃 → 확인 모달 → 확정 → signOut → /login navigate(스텁 probe로 검증).
- **탈퇴 확인 모달**: 메뉴 탈퇴 → 확인 모달(30일 유예·복구 안내 문구 존재) → 명시 확정 없이는 soft_delete 미호출 → 확정 시 deleted_at 세팅·안내.
- **알림 토글**: '알림' 섹션 카테고리 토글 ON/OFF → set_notification_pref 호출·저장 반영. 결제 카테고리 부재 확인.
- **오발화 방지**: 탈퇴/로그아웃은 확인 없이 실행 안 됨.

### 5-2. inbox-page.contract.test.tsx
- **빈상태**: 알림 0건 → 빈상태 카피 렌더.
- **로딩**: fetch 중 스켈레톤.
- (목록 있을 때 행 렌더 — 발송 인프라 후속이므로 목 시드 기준.)
- 수신함 진입점(sidebar inbox nav) → /inbox 라우팅(MemoryRouter).

### 5-3. profile-api.test.ts (entities 확장)
- `toUpdateArgs`: 빈/공백 표시이름 throw · 관심 0/6개 경계 throw · 정상 매핑(p_*).
- 목 폴백: getMyProfile/updateProfile/softDelete(멱등)/restore/notification prefs 결정론.

### 5-4. 게이트
- `tsc -b` 0 · lint 0 · **lint:fsd 0**(하향임포트·배럴) · 콘솔 0.
- (UI) `/design-review`: **진입점 2종 프레임 1:1 PASS**(미훼손 회귀 확인) + 신규 화면이 u0 토큰/컴포넌트 일관(파운데이션 충실도) PASS · 스크린샷(계정메뉴·프로필·탈퇴모달·수신함·빈/로딩/에러).
- **BE contract(0013)는 이미 GREEN**(pgTAP pglite 172 ok/0 not ok — status.md) → FE는 재실행만 회귀 확인(소비 측 무변경).

---

## 6. Boundaries (do-not-touch / preserve)

### only edit (FE)
`src/pages/settings/**` · `src/pages/inbox/**` · `src/features/profile-edit/**` · `src/features/account-actions/**` · `src/features/notification-settings/**` · `src/entities/profile/**`(확장) · `src/widgets/account-menu/**` · `src/app/app.tsx`(라우트 2개 등록만).

### do not change (★ 카디널)
- **u0c sidebar 위젯**(`widgets/sidebar/**`) — 프로필 카드/수신함 nav 비주얼·구조 미접촉. **props 와이어링만**(상위 페이지에서).
- **u0b/앱셸 구조**: `widgets/app-shell`·`widgets/topbar` 미수정(슬롯 소비). FSD 레이어·하향임포트·배럴 보존.
- **인증(OAuth) 흐름 핵심**: `features/social-login`·`entities/session`(signOut 재사용만, 흐름 변경 ❌)·`app/guards/route-guards`(RequireOnboarded 재사용, 가드 로직 변경 ❌).
- **온보딩 최초 입력 플로우**: `features/onboarding-steps`·`pages/onboarding` 미접촉 — u11은 *기존 프로필 수정*만. (단일칩/멀티칩 폼팩터는 shared/ui `Chip` 재사용 — 온보딩 코드 import ❌.)
- **u0b 락 계약**: `clips`/`get_or_create_content`/sanitized view/히트맵 RPC·`entities/profile` options(직업/연차/상황/관심 카탈로그) 미변경. ADR-0002 #6(프로필 public/private 분리)·#9(soft-delete)·#3(sanitized read) 보존.
- **0013 마이그레이션**: FE는 **소비만** — `supabase/migrations/0013` 미수정(BE 머지·검증 완료).
- **tokens.css**: 신규 토큰 추가 ❌(특히 danger 색 — 부재 시 ESCALATION). 하드코딩 HEX ❌.

### preserve
- FSD 하향임포트·배럴 경유 · RLS 본인만 · supabase null 목 폴백(MSW 미사용) · 진입점 2종 픽셀 1:1.
- main 직접 푸시 ❌ · force-push ❌ · `.env` 커밋 ❌.

### out of scope (게이트 ⓐ — 화면에 없음)
AI 전면 · 구독/결제·요금제 모달·페이월·영수증·연간 플랜 · 대시보드 탭(FD1) · 아티클 클리핑 · 구독 만료 알림(결제계) · Naver 로그인 · 푸시 **실제 발송**(설정 토글만, 발송 파이프라인 후속). 범위 밖 발견 = PM 보고(새 티켓 ❌).

---

## 7. 결정(런북 §6·spec ESCALATION 기본값 — 전부 reversible)
1. **계정 메뉴 = 팝오버**(프로필 설정/설정/로그아웃/탈퇴). 프로필·설정은 페이지. → `widgets/account-menu`(앵커=프로필 카드).
2. **설정 = 단일 페이지 + 앵커 섹션**(#profile·#notifications·#account). 탭/서브라우트 아님.
3. **수신함 = 목록 화면**(`/inbox`, 빈상태) / **알림 토글 = 설정 '알림' 섹션**. 분리.
4. **soft-delete = `profiles.deleted_at`**(0013 additive 컬럼·존재 확인) + **재로그인 복구 배너**(restore_account 1클릭).
5. **표시이름 = 수정 가능 필드**(빈/공백 차단·`update_profile.p_display_name`). OAuth 이름이 초기값.
6. **알림 = 비결제 카테고리(트렌드 등) 설정 저장만**(0013 CHECK가 billing/subscription/receipt 거부). 발송 후속.

---

## 8. 리스크
| 리스크 | 영향 | 완화 |
|---|---|---|
| **위험 액션(탈퇴) 색 토큰 부재** | tokens.css에 danger/destructive HEX 없음 → 발명 유혹 | 색 발명 ❌. 2단계 확인 모달 + 명확 카피("30일 유예·복구 가능")로 위험 전달. 신규 danger 토큰 = ESCALATION(u0 영역). |
| **EmptyState/Skeleton 공용 컴포넌트 부재** | 빈/로딩 표면 일관성 | library/search 페이지-local CSS 패턴 재현(토큰만). 신규 shared 프리미티브 ❌. |
| **관심분야 직접입력 칩** | 온보딩 `interest-custom-input`이 features에 존재 — 재사용 시 크로스슬라이스 import 위험 | 동일레이어(features) import ❌ → shared/ui `Chip` + 페이지-local 입력으로 조립(또는 entities로 끌어내림은 범위 초과 → 기본은 칩 카탈로그만 멀티선택, 커스텀 입력은 in-flight 판단). |
| **`Profile` 타입에 `deleted_at` 누락** | get_my_profile 반환 타입 불일치 | `entities/profile/model/types.ts` Profile에 `deleted_at: string \| null` 추가(boundary 내 수정). |
| **계정 메뉴 팝오버 = Dropdown 재사용 적합성** | Dropdown은 폴더 select용(외부클릭 닫힘 phase②) | Dropdown 토큰 면 재사용하되 외부클릭/포커스 트랩은 페이지-local 처리(library-page folderDropdown overlay 패턴). 부적합 시 Card 면 + 메뉴 버튼 조립. |
| **soft-delete 후 update_profile 차단(ACCOUNT_DELETED P0002)** | 유예중 프로필 수정 시도 → 에러 | 복구 배너로 유도(수정 전 restore 필요) — UI에서 deleted_at 비NULL 시 수정 폼 잠금 + 배너 노출. |
| **mode=인터랙티브 워크트리** | FE는 headless 스폰 ❌ → 사용자가 Figma 연동·퍼블리싱 운전 | PM은 worktree·spec·plan 준비 후 핸드오프. 디자인 공백 결정 6건은 위 §7 기본값으로 확정(reversible) — 게이트 ⓒ(충실도)에서 사용자 사인오프. |

---

## 9. 진입 순서 (구현 권장 시퀀스)
1. `entities/profile` 확장(types.deleted_at·api 5표면·queries 훅·목 폴백·단위 테스트) — **데이터 기반 선행**.
2. `widgets/account-menu`(팝오버) + `app.tsx` /settings·/inbox 라우트.
3. `features/profile-edit`(폼·검증·저장) → settings-page 프로필 섹션.
4. `features/account-actions`(로그아웃·탈퇴·복구 배너) → settings-page 계정 섹션.
5. `features/notification-settings`(토글) → settings-page 알림 섹션.
6. `pages/inbox`(목록·빈상태).
7. 계약 테스트 3종 + tsc/lint/lint:fsd + `/design-review`(진입점 1:1 회귀 + 파운데이션 충실도).
