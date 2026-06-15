# u11-settings-account — 성공조건 (/goal)

> Sprint 0 · Wave (후행, 파운데이션·앱셸·u0b 머지 후) · owner=both · **mode=인터랙티브 워크트리(사용자 운전)**
> · Issue #TBD(게이트 ⓑ에서 PM 발급) · dep=u0(디자인시스템·shared/ui·앱셸/GNB) + u0b(데이터코어·ADR-0002 락) 머지 후 · migration **유(프로필 수정·soft-delete 경로 — u0b 스키마 위 additive RPC/policy만)**
> ★ **전 화면이 [디자인 공백]**(전용 Figma 프레임 없음) → 매 턴 spec + u0 파운데이션(토큰·shared/ui·앱셸) + GNB 프로필카드/수신함 nav(아래 Figma frames) reload. 추측 금지 — 프레임에 없는 표면은 파운데이션으로 *일관* 채움.

## L1 User Story  (검증의 north star — 각 인수기준이 여기로 추적된다)
- **L1-a** As a 회원, GNB 프로필 카드(아바타·이름·플랜배지·chevron)를 클릭하면 내 계정 메뉴/설정 진입점이 열려, 거기서 프로필·로그아웃·탈퇴로 갈 수 있다.
- **L1-b** As a 회원, 설정의 프로필 화면에서 내 프로필(직업·연차·상황·관심분야 = public 코호트 입력)을 **조회**하고, 표시 이름/관심분야 등 수정 가능한 항목을 **수정·저장**할 수 있다. (private auth 정보와 public 코호트는 분리 노출 — ADR-0002 #6)
- **L1-c** As a 회원, 로그아웃하면 세션이 끝나고 비인증 진입점(로그인)으로 돌아간다.
- **L1-d** As a 회원, 회원 탈퇴를 요청하면 **30일 유예 soft-delete**(즉시 hard-delete ❌)가 적용되고, 재로그인 시 복구 안내가 보이며, 유예 기간 동안 내 데이터는 sanitized 공개집계에서 제외된다. (ADR-0002 #9 soft-delete)
- **L1-e** As a 회원, GNB **수신함(inbox)** 항목에 들어가 내 알림(수신함)을 보고, 알림 수신 ON/OFF(설정)를 토글할 수 있다. (결제/구독 만료·영수증 계열 알림은 제외 — 게이트 ⓐ)

**Production acceptance (관찰가능):** prod-like 환경에서 로그인한 사용자가 ① GNB 프로필 카드 → 계정 메뉴를 열고 ② 프로필 화면에서 public 코호트(직업·연차·상황·관심분야)를 보고 수정·저장하면 DB 반영 + 화면 갱신, ③ 로그아웃하면 세션 종료·로그인으로 리다이렉트, ④ 탈퇴 요청 시 `deleted_at`이 세팅되고(soft) 재로그인하면 복구 배너가 뜨며 유예 중 공개집계에서 내 클립이 제외, ⑤ 수신함에서 알림 목록/빈상태를 보고 알림 토글이 저장된다. QA가 e2e로 각 L1을 재현. **AI·결제·구독관리·영수증·연간플랜·대시보드 탭은 화면에 존재하지 않는다.**

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- **★전용 프레임 없음 = [디자인 공백]** — 본 단위의 모든 화면(계정 메뉴·프로필 조회/수정·로그아웃 확인·탈퇴 확인·수신함·알림설정)은 Figma "프로토타이핑"(2087:5987)에 프레임이 없다.
- 참조(픽셀 기준의 *유일* 출처):
  - **GNB 프로필 카드** `I2087:13351;1306:4235` (Sidebar 내) — 아바타 Ellipse 28×28(`;1306:4237`) · 이름 "Leesuho" 텍스트(`;1306:4239`, `#FAFAFA`, Pretendard 14/130%/-2.5%) · 플랜배지 thunder+"Premium"(`;1306:4240`, `#199E41`, 12px) · chevron `아이콘_화살표`(`;1306:4244`, 675:718). 카드: padding 8/12, radius 10, stroke `rgba(255,255,255,0.08)`, w226·h50. → **이 카드가 계정 메뉴 진입점 (L1-a)**.
  - **GNB 수신함 nav 항목** `I2087:13351;1613:10940` — `icon/inbox`(1613:11091) + 라벨 "수신함", `_Child/Menu` 컴포넌트(1613:10862), 행 padding 8/10·h32·radius8·라벨 Body 3/Regular `#B4B4B4`. → **수신함 진입점 (L1-e)**.
- **[디자인 공백] 채움 원칙**: 위 두 진입점 *외*의 모든 화면은 u0 파운데이션 토큰(`#121212` 배경 · `rgba(255,255,255,0.08)` 보더 · `#FAFAFA`/`#B4B4B4` 텍스트 · `#66FF4B` 주 CTA · Pretendard · radius 8 · Body 3/Regular 14·160%·-2% / Body 4/Medium 13)과 `shared/ui` 컴포넌트(버튼·인풋·모달·토스트·칩·메뉴)로 구성. 새 비주얼 발명 ❌ → 파운데이션 1:1.

---
/goal --tokens <예산>  계정 메뉴(프로필카드 chevron 진입) · 프로필 조회/수정(public 코호트) · 로그아웃 · 탈퇴 30일 유예 soft-delete + 복구 안내 · 수신함 + 알림 ON/OFF 를, u0 파운데이션 토큰·shared/ui로 픽셀-일관 구현하고 u0b 데이터계약(ADR-0002 #6 프로필분리·#9 soft-delete) 위에 배선해 contract/e2e 로 증명한다. 형용사 금지.

### Source of truth (매 턴 reload)
- read   docs/units/u11-settings-account/spec.md (이 파일) · follow plan.md · update status.md
- view   GNB 프로필 카드 `I2087:13351;1306:4235` · 수신함 nav `I2087:13351;1613:10940` (Figma MCP — 토큰·간격·타이포 정확 값) · u0 파운데이션 `src/app/styles` + `shared/ui`
- 참조: state/decisions.md **ADR-0001(스택·FSD)** / **ADR-0002(#6 프로필 private/public 분리 · #9 라이프사이클 soft-delete · #3 sanitized public read)** · config/quality_standards.md · u0b가 락한 `profiles`/`clips`/sanitized view 계약 · docs/source/기능명세서.md(1.2 온보딩 항목규칙·1.3.2 탈퇴 30일 유예·5.3.2 알림설정)

### Acceptance criteria  (스토리에서 도출 · 관찰가능 · 각 항목 → L1-x 추적)
**BE** (owner=both — u0b 위 additive)
- [behavior] **프로필 조회/수정 RPC/정책**: 본인 `profiles` 행의 public 코호트(직업·연차·상황·관심분야)·표시이름 조회·수정. 관심분야 최소1·최대5, 직업/연차/상황 단일·필수(기능명세서 1.2.1). private(auth) 필드는 수정 경로에서 분리(ADR-0002 #6). RLS=본인만 쓰기. → L1-b
- [behavior] **soft-delete RPC**: 탈퇴 요청 = `profiles.deleted_at`(또는 동등 컬럼) 세팅(hard-delete ❌). 유예 30일. 유예 중 sanitized 공개집계/코호트에서 해당 user 클립 제외(ADR-0002 #3·#9). 재로그인 시 복구 가능 상태 노출. → L1-d
- [behavior] **로그아웃**: Supabase 세션 종료(서버 측 무효화 경계 명시). → L1-c
- [behavior] **알림 설정 저장**: 알림 ON/OFF 플래그를 본인 프로필/설정 테이블에 저장·조회(RLS 본인). 트렌드 등 *비결제* 알림 카테고리만. → L1-e
- [negative] 미인증 호출 401 · 타 user 프로필 수정/탈퇴 차단(RLS) · 관심분야 0개/6개+ 거부 · 빈 표시이름/공백·XSS 페이로드 무해화 · soft-delete 멱등(이미 deleted 재요청 무해) · 이미 탈퇴 유예중 사용자의 공개집계 노출 0.
**FE** (owner=both)
- [behavior] GNB 프로필 카드 클릭 → 계정 메뉴(프로필·로그아웃·탈퇴 항목) 오픈, 프로필 화면 진입 가능. → L1-a
- [behavior] 프로필 화면에서 public 코호트 조회 → 수정폼(직업/연차/상황 단일선택, 관심분야 멀티 1~5, 표시이름) → 저장 → 낙관적/재조회 반영. private vs public 시각 분리. → L1-b
- [behavior] 로그아웃 클릭 → 확인 → 세션종료 → 로그인 진입점 리다이렉트. → L1-c
- [behavior] 탈퇴 클릭 → 30일 유예·복구 안내가 포함된 확인 모달 → 확정 시 soft-delete → 안내. 재로그인 시 복구 배너. → L1-d
- [behavior] 수신함 진입 → 알림 목록 + 알림 ON/OFF 토글(설정), 저장. → L1-e
- [negative] 빈/공백 표시이름 차단 · 관심분야 1~5 강제(클라 검증) · 탈퇴/로그아웃은 명시적 확인 없이는 실행 안 됨(오발화 방지) · 미인증 접근 시 로그인으로.
- [non-regression] u0 앱셸/GNB(홈·검색·라이브러리·수신함 nav)·기존 라우팅·u0b RLS·sanitized view 계약 안 깨짐. 프로필 카드 비주얼(이름·배지·아바타·chevron) 보존.
- [state] **빈**: 알림 0건=빈상태(파운데이션 EmptyState) · 관심분야 미설정=플레이스홀더. **로딩**: 프로필/수신함 fetch 중 스켈레톤·버튼 펜딩(저장/탈퇴/로그아웃). **에러**: 저장/탈퇴/로그아웃 실패=토스트+재시도, 권한오류=로그인. (전부 u0 shared/ui 파운데이션 패턴 — *프레임 공백이므로 파운데이션이 SoT*)
- [fidelity] **진입점 2종은 기존 프레임과 1:1**: GNB 프로필 카드 `I2087:13351;1306:4235`(아바타·이름·Premium 배지·chevron·padding/radius/stroke) + 수신함 nav `I2087:13351;1613:10940`(아이콘·라벨·행 메트릭) 변경/훼손 ❌. **그 외 화면은 u0 토큰/컴포넌트와 1:1**(발명 금지) → L1-a/e

### Validation  (증명 명령 — QA가 clean checkout에서 그대로 재실행)
- **BE contract** (pgTAP / deno, AI·외부 목킹·결정론적): `profile-update`(public 코호트 수정·관심분야 1~5 경계·private 분리) · `profile-rls`(타 user 수정/탈퇴 차단·미인증 401) · `soft-delete`(deleted_at 세팅·멱등·hard-delete 아님) · `soft-delete-excludes-public`(유예중 user가 sanitized 집계/코호트에서 제외 = cross-user 누출/노출 0) · `notification-pref`(ON/OFF 저장·RLS 본인).
- **FE**: `vitest` 컴포넌트/플로우 테스트(계정메뉴 오픈·프로필 수정 검증·로그아웃 리다이렉트·탈퇴 확인모달·수신함 빈/로딩/에러) — 외부 목킹.
- `tsc -b` 0 · lint 0 · **lint:fsd 0** · 콘솔 0.
- (UI) `/design-review`: 진입점 2종 프레임 1:1 PASS + 신규 화면이 u0 토큰/컴포넌트 일관(파운데이션 충실도) PASS · 스크린샷(계정메뉴·프로필·탈퇴모달·수신함·빈/로딩/에러).

### Boundaries
- only edit (FE): `src/pages/settings/**` · `src/pages/inbox/**`(수신함) · `src/features/profile-edit/**` · `src/features/account-actions/**`(로그아웃·탈퇴) · `src/features/notification-settings/**` · `src/entities/profile/**` · `src/widgets/account-menu/**`(프로필카드 chevron 메뉴) · GNB에 메뉴 연결만(앱셸 구조 변경 ❌).
- only edit (BE): `supabase/migrations/**`(additive: 프로필수정·soft-delete·알림설정 RPC/policy) · `supabase/tests/**`(pgTAP) · 필요 시 `supabase/functions/_shared` 재사용(신규 곁다리 지양).
- do not change: u0b가 락한 `clips`/`get_or_create_content`/sanitized view·히트맵 RPC 계약 · u0 토큰/앱셸 구조 · 인증(OAuth) 흐름 핵심 · GNB 프로필카드/수신함 비주얼. preserve: FSD 하향임포트·배럴·RLS·ADR-0002 계약.
- 정적 유지: 온보딩 *최초* 입력 플로우(별도 단위)는 건드리지 않음 — 본 단위는 *기존 프로필 수정*만.
- out of scope (게이트 ⓐ 제외 — 화면에 없음): **AI 전면** · **구독/결제·요금제 모달·페이월·영수증·연간 플랜** · **대시보드 탭(FD1 제거)** · **아티클 클리핑/하이라이트**(영상 전용) · 구독 만료 알림(결제계) · Naver 로그인(후순위) · 푸시(웹 푸시 인프라) 실제 발송(설정 토글만, 발송 파이프라인은 후속).
- main 직접 푸시 ❌ · force-push ❌ · `.env` 커밋 ❌ · blast radius = `feat/u11-settings-account`.

### Loop behavior
- 의미있는 변경마다 validation(pgTAP/vitest/tsc/lint:fsd) 실행 · status.md 갱신(변경·검증결과·디자인공백 결정 기록).
- ⚠ **goal = 모든 L1-a~e의 production acceptance가 관찰가능하게 충족될 때까지 루프.** 미충족 기준에 done ❌ → ESCALATION(§C no-fake-done).
- in-flight 발견은 이 유닛이 흡수, 범위 밖(결제·AI·대시보드)은 PM 보고(새 티켓 ❌) · [디자인 공백] 관련 핵심 결정(아래)은 사용자/PM 게이트로 ESCALATION 후 진행 · 토큰/턴 예산 초과 시 차단 사유 기록 후 정지.

---

### ⚠ 디자인 공백 & ESCALATION 후보 (PM/사용자 결정 필요)
1. **계정 메뉴 형태**: 프로필 카드 chevron 클릭 시 — (a) 팝오버 메뉴(프로필/로그아웃/탈퇴) vs (b) 전용 설정 페이지 라우트. *제안: (a) 팝오버 + 프로필/설정은 페이지.* 프레임 없음 → 파운데이션 메뉴 컴포넌트로.
2. **설정 페이지 IA**: 단일 설정 페이지(섹션: 프로필·알림·계정) vs 탭/서브라우트. *제안: 단일 페이지 + 앵커 섹션(파운데이션).*
3. **수신함 vs 알림설정 관계**: 수신함(목록)과 알림 ON/OFF(설정)를 같은 화면(탭) vs 분리. *제안: 수신함=목록 화면, 알림 토글=설정 페이지 '알림' 섹션.*
4. **soft-delete 컬럼/복구 UX**: u0b 스키마에 `profiles.deleted_at`이 이미 있는지 — 없으면 additive 마이그레이션. 복구 = 재로그인 배너 '계정 복구' 1클릭 vs 별도 플로우. *제안: `deleted_at` additive + 재로그인 복구 배너.*
5. **표시 이름(닉네임) 수정 가능 여부**: 프로필 카드의 "Leesuho"가 OAuth 제공 이름인지/수정 가능한 별도 표시이름인지 — 기획 미명시. *제안: 수정 가능한 표시이름 필드(빈/공백 차단) 추가, OAuth 이름은 초기값.*
6. **알림 카테고리**: 게이트 ⓐ에서 결제(구독 만료) 제외 → 남는 알림 카테고리(트렌드 등)만 토글. 실제 발송 인프라 부재 → *설정 저장만* 스코프(발송은 후속) 확인.
