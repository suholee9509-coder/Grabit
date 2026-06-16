# 충실도 감사 — u11 settings-inbox (설정 · 수신함)

> 감사일 2026-06-16 · read-only(코드 변경 ❌) · fileKey `5GGyKsjXEOpjKMLtUodeSs`
> PNG: `state/fidelity-audit/u11-settings-inbox/profile-card-I2087-13351-1306-4235.png` · `…/inbox-nav-I2087-13351-1613-10940.png`

## 0. 범위·전제 (정직한 프레이밍)

이 유닛에는 **실프레임이 2개뿐**이고, 둘 다 **GNB 사이드바 위젯의 진입점 컴포넌트**다:
- `I2087:13351;1306:4235` = GNB 프로필 카드 (chevron 진입점)
- `I2087:13351;1613:10940` = 수신함 nav 항목 (`Selected=False` = inactive 상태)

**설정 화면 전체 · 계정/탈퇴/복구 · 수신함 목록 화면 = 디자인 공백(전용 프레임 없음)**.
→ 이 화면들은 픽셀 SoT가 존재하지 않으므로 **u0 파운데이션 토큰·shared/ui 일관성**과 **발명/추측 여부**만 평가했다(누락이라도 severity med 이하). 픽셀-퍼펙트 판정은 진입점 2종에만 적용.

**충실도 추정:**
- 진입점 2종(픽셀 SoT 있음): **~92%** — 프로필 카드·수신함 nav 모두 sidebar 위젯과 1:1, 측정값 일치. 감점은 (a) 프로필 카드 Premium 배지가 페이지에서 props 미와이어링이라 프레임의 Premium 표시가 렌더 안 됨, (b) 수신함 nav를 InboxPage가 active 상태로 띄워 제공된 inactive 프레임과 시각이 다름(단 active는 현재 페이지에 맞는 올바른 상태이고 widget에 자체 SoT 있음).
- 디자인 공백 화면(SoT 없음): **N/A(픽셀)** · 토큰 일관성 **높음** — 하드코딩 HEX 0건, 전부 토큰 참조, 발명 색 없음.

---

## 1. 진입점 ① — GNB 프로필 카드 `I2087:13351;1306:4235`

### Figma 실측 (풀깊이 drill)
| 요소 | nodeId | 측정 정확값 |
|---|---|---|
| 카드 프레임 (Frame 5) | I2087:13351;1306:4235 | row · space-between · align center · pad **8/12** · w **226** · h **50** · radius **10** · stroke rgba(255,255,255,0.08) 1px |
| 좌측 묶음 (Frame 2085667589) | …;1306:4236 | row · align center · gap **8** · hug |
| 아바타 (Ellipse 148) | …;1306:4237 | **28×28** · IMAGE fill (cover) |
| 텍스트 묶음 (Frame 2085667585) | …;1306:4238 | column · gap **-1** · padTop **1** · w 57 |
| 이름 "Leesuho" | …;1306:4239 | Pretendard Regular **14** / lh **130%** / ls **-2.5%** · **#FAFAFA** |
| Premium 묶음 | …;1306:4240 | row · align center · (thunder + 텍스트) |
| thunder 아이콘 (mdi:thunder) | …;1306:4241 | **12×12** |
| "Premium" 텍스트 | …;1306:4243 | Regular **12** / lh **130%** / ls **-2.5%** · **#199E41** |
| 화살표 (아이콘_화살표) | …;1306:4244 | **16×16** · chevron(675:718) · #505050 |

### 대조표
| Figma 섹션/요소(nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 카드 프레임 (…4235) | 226×50 · pad8/12 · r10 · border .08 | ✅완전 | `widgets/sidebar/ui/sidebar.module.css` `.profileCard` | 없음 |
| 아바타 (…4237) | 28×28 IMAGE | ✅완전 | `sidebar.tsx` `<Avatar size="profile">` (`--size-avatar-profile:28`) | 없음 |
| 이름 "Leesuho" (…4239) | 14/Reg/130%/-2.5% #FAFAFA | ✅완전 | `sidebar.module.css` `.profileName` | 없음 |
| Premium 묶음 (…4240) thunder12 + "Premium"12/Reg/130%/-2.5% #199E41 | thunder12 #199E41 | 🟡부분 | `sidebar.tsx` `.profilePremium`+`ThunderIcon` 구현됨 — **단 SettingsPage/InboxPage가 `profile={{ name }}`만 전달, `premium` 미와이어링** → 배지 영구 미표시 | **med**: 프레임은 Premium 표시. `settings-page.tsx:73`·`inbox-page.tsx:61`에 `premium: …`(엔티티 tier 확인 후) 와이어링 필요 |
| 화살표 (…4244) | 16×16 chevron · #505050 | ✅완전(색 미세差) | `sidebar.tsx` `.profileArrow`+`ChevronIcon` (16×16) | chevron 색이 text-secondary(#B4B4B4), Figma #505050 — low |
| gap -1 / padTop 1 (…4238) | column gap-1 padTop1 | ✅완전 | `.profileText` padTop1 + `.profilePremium` margin-top:-1 | 음수 gap 재현 정확 |

**판정: 위젯 자체는 1:1. 페이지 측 Premium props 누락이 유일한 시각 gap.**

---

## 2. 진입점 ② — 수신함 nav `I2087:13351;1613:10940`

### Figma 실측
| 요소 | nodeId | 측정 정확값 |
|---|---|---|
| nav 인스턴스 (수신함, `Selected=False`) | I2087:13351;1613:10940 | row · align center · alignSelf stretch · gap **8** · pad **8/10** · radius **8** · sizing fill |
| icon/inbox | …;1613:10863 | **20×20** SVG |
| 라벨 "수신함" | …;1613:10864 | Body 3/Regular = Pretendard Reg **14** / lh **160%** / ls **-2%** · **#B4B4B4** (fill_HL5EPB) |

### 대조표
| Figma 섹션/요소(nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| nav 인스턴스 inactive (…10940) | pad8/10 · gap8 · r8 · fill | ✅완전 | `widgets/sidebar/ui/nav-item.module.css` `.navItem`+`.inactive` | 없음 |
| icon/inbox (…10863) | 20×20 | ✅완전 | `.icon` 20×20 + `sidebar/ui/icons.tsx InboxIcon` | 없음 |
| 라벨 (…10864) | 14/Reg/160%/-2% #B4B4B4 | ✅완전 | `.navItem`(14/160%/-2%) + `.inactive`(Reg·#B4B4B4) | 없음 |
| **상태** | 프레임 = `Selected=False`(inactive) | ⚠️상태差 | `inbox-page.tsx:58` `activeMenu="inbox"` → **active(#242424·#FAFAFA·Medium) 렌더** | **low**: InboxPage에서 수신함 활성은 올바른 UX이고 active 상태는 홈 GNB 측정 기반 widget SoT로 처리. 제공 프레임은 비활성 변형 캡처 — 의도된 차이 |

**판정: 위젯 1:1. 제공 프레임(inactive)과 페이지 렌더(active)의 상태 차이는 의도된 것.**

---

## 3. 디자인 공백 화면 — 토큰/컴포넌트 일관성 (픽셀 SoT 없음)

### 3-1. 설정 페이지 본문 (`pages/settings/ui/settings-page.*`)
| 요소 | 구현 상태 | impl | 평가 |
|---|---|---|---|
| 헤더(제목28/서브15) | ✅토큰일관 | `.pageTitle`(title-2 28·#FFF) `.pageSub`(15·#CECECE) | library-page 패턴 승계 |
| 프로필/알림/계정 섹션 + divider | ✅토큰일관 | `.section`·`.sectionDivider`(border-subtle) | 앵커 + scroll-margin-top 처리 양호 |
| 계정 액션 버튼 2개 | ✅토큰일관 | `Button secondary` ×2 | shared/ui 재사용 |
| 제목 #FFFFFF vs 섹션제목 #FAFAFA | 🟡혼용 | `.pageTitle` white-pure / `.sectionTitle` text-primary | FD3(흰=#FAFAFA) 관점 미세 비일관(low) |

### 3-2. 프로필 수정 (`features/profile-edit/ui/*`)
표시이름 Input · 직업/연차/상황/관심 Chip(shared/ui·온보딩 폼팩터) ✅ · privacy 태그(surface-200/publicTag=#199E41 승계) ✅ · 관심 1~5 카운터·비활성 ✅ · 로딩 스켈레톤·로드에러·저장 펜딩·인라인 invalid ✅ · deleted_at 유예중 폼 잠금 ✅. **발명/추측 없음.**

### 3-3. 알림 설정 (`features/notification-settings/ui/*`)
카테고리 행(라벨+설명+토글) ✅ · `Toggle`=★FD2 파랑(#2563EB·44×22·knob18·이중그림자) 정밀 ✅ · 낙관 토글+롤백+pending disabled ✅ · 로딩/로드에러 ✅. **빈 카테고리(rows=[])** = 빈 `<ul>`만, 빈 안내 없음(🟡 med 이하 — 카탈로그가 채움).

### 3-4. 계정 액션 (`features/account-actions/ui/*`)
로그아웃 모달 ✅ · 탈퇴 2단계(체크+확정) 모달 ✅(30일 유예 카피·위험은 색 발명 ❌) · 복구 배너(deleted_at 비NULL, Card+Button, 종료일 계산) ✅ · danger 색 토큰 부재 → 중립 약화 + 카피(의도된 결정).

### 3-5. 계정 메뉴 팝오버 (`widgets/account-menu/ui/*`)
면(surface-100·r10·border·shadow-popover) ✅ · 항목4(프로필설정·설정·로그아웃·회원탈퇴) ✅ · Esc/외부클릭 닫힘 ✅ · hover(surface-hover) ✅. **앵커 위치** = GNB 좌하단 고정 좌표(`left:14`·`bottom:calc(14+50+8)`)로 **하드 배치**(프로필 카드 DOM 기준 anchor 아님) → 사이드바 위치/폭 변형 시 어긋남 가능(🟡 med).

---

## 4. 인터랙션 체크리스트
| 인터랙션 | 존재 | 동작 |
|---|---|---|
| 프로필 카드 chevron → 계정 메뉴 토글 | ✅ | `setMenuOpen((o)=>!o)` |
| 계정 메뉴 외부클릭/Esc 닫힘 | ✅ | overlay·keydown Escape |
| 계정 메뉴 항목 선택 → 액션 | ✅ | profile/settings→스크롤·navigate, logout/withdraw→모달 |
| 알림 토글 ON/OFF | ✅ | 낙관+롤백+pending disabled |
| 프로필 칩 단일/멀티 선택 | ✅ | selectJob/Years/Goal·toggleInterest |
| 관심 5개 초과 비활성 | ✅ | isInterestDisabled |
| 되돌리기/저장 | ✅ | reset·save(canSave gate) |
| 로그아웃 모달 확정 | ✅ | logout→/login |
| 탈퇴 2단계 확인 | ✅ | 체크박스→확정버튼 활성 |
| 복구 배너 1클릭 복구 | ✅ | restoreAccount |
| 설정 앵커 스무스 스크롤 | ✅ | scrollIntoView(jsdom 가드) |
| 토스트 자동 소멸(2.6s) | ✅ | setTimeout |
| 수신함 알림 항목 클릭/읽음 | ❌ | 발송 인프라 부재 → 목록 항상 빈상태, 항목 인터랙션 미구현(SoT 없음, med 이하) |

## 5. 상태 체크리스트
| 상태 | 프로필수정 | 알림 | 수신함 | 계정메뉴 |
|---|---|---|---|---|
| 기본 | ✅ | ✅ | ✅(빈) | ✅ |
| hover | (칩/버튼) | (토글) | — | ✅ |
| active/selected | ✅(칩) | ✅(토글 ON) | — | — |
| 빈 | — | 🟡(빈ul 무안내) | ✅(EmptyState) | — |
| 로딩 | ✅ | ✅ | ✅ | — |
| 에러 | ✅ | ✅ | 🟡(로드에러 미표시) | — |
| 잠금(유예중) | ✅(locked) | — | — | — |

---

## 6. High severity 보완점
**즉시 수정 대상 high(핵심 섹션/인터랙션 누락) 0건.**
- 진입점 2종은 sidebar 위젯과 1:1(픽셀 일치) — 핵심 누락 없음.
- 나머지 화면은 디자인 공백이라 픽셀 누락을 high로 올릴 SoT가 없음 → 전부 med 이하.

가장 영향 큰 med(픽셀 SoT 있는 곳):
1. **프로필 카드 Premium 배지 props 미와이어링** — Figma 프레임은 Premium 표시. `settings-page.tsx:73` / `inbox-page.tsx:61`이 `profile={{ name: displayName }}`만 전달 → `premium` 누락으로 thunder+#199E41 배지 영구 미표시. profile 엔티티 tier/premium 필드 확인 후 `premium: …` 와이어링.

## 7. PNG 참조
- `state/fidelity-audit/u11-settings-inbox/profile-card-I2087-13351-1306-4235.png` (678×150)
- `state/fidelity-audit/u11-settings-inbox/inbox-nav-I2087-13351-1613-10940.png` (678×96)
