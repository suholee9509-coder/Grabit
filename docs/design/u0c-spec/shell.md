# u0c 정밀 구현 값표 — 앱 셸 (GNB / 톱바 / 브레드크럼 / 프로필카드)

> SoT = Figma 5GGyKsjXEOpjKMLtUodeSs, 페이지 "프로토타이핑" 2087:5987 하위 실화면 프레임 전수 실측.
> 현 구현 = `apps/web/src/app/styles/tokens.css` + `apps/web/src/shared/ui/*`. **widgets/ 는 .gitkeep만 → 셸 전체 미구현(신규).**
> ★FD1 반영: GNB 메뉴 = 홈·검색·라이브러리·**수신함** 4탭. **대시보드 탭 제거**(Figma엔 존재하나 스코프 결정으로 제외).
> ★FD3 반영: 모든 흰색 = `#FAFAFA`. 브레드크럼 active 칩 라벨 Figma `#FFFFFF` → 구현 `#FAFAFA`로 통일.
> 측정 출처 프레임: 홈 GNB 2087:70381 (★auto-layout 정준) · 홈 톱바 2087:69671 · 상세 톱바 2087:13114 · 검색 GNB 2087:40714 (active=검색 변형 확인) · 라이브러리 브레드크럼 2117:21046.

---

## 0. 측정 요약
- **측정 변형/사이즈/상태 = 26개** (아래 표 행 기준).
- **신규 토큰 후보 = 18개** (§8 집계).
- **[GAP] = 6건** (§9 집계).

---

## 1. GNB 컨테이너 (Sidebar)

| 속성 | 실측값 | 출처 노드 |
|---|---|---|
| 컨테이너 width | **254px** (height = 뷰포트, 1072~1080 가변) | 2087:70381 layout_QAS19A / 검색 2087:40714 layout_UZ0GRK |
| 컨테이너 fill | **#121212** | fill_91K381 / fill_6O47YW |
| 컨테이너 radius | **8px** | borderRadius (Sidebar 루트) |
| 내부 콘텐츠 패널 width | **226px** (= 254 − 좌우 14 inset) | layout_XUE31H / 검색 GVR9IV x:14 |
| 패널 좌우 inset | **14px** (Logo Frame padding 14, x:14 위치) | layout_BFNERN padding:14 / layout_JKG4ZU x:14 |
| 로고 영역 | height 24, padding 14, gap10(아래 CTA와) | layout_BFNERN / layout_R87PSQ h24 |
| 패널 세로 구성 gap | **16px** (로고블록 ↔ Container 내부 묶음) | layout_XUE31H gap:16 |
| nav묶음↔divider↔폴더↔divider↔최근 gap | **18px** | layout_TD5UTB gap:18 |

> 신규 토큰: `--size-gnb: 254px`, `--size-gnb-panel: 226px`, `--space-gnb-inset: 14px`(=space-7 재사용 가능), `--color-shell-bg: #121212`.
> 현 구현 차이: 셸 자체 미구현. `#121212`는 토큰 미보유(가장 근접 `--color-surface`=#171717). 신규 필요.

---

## 2. nav item (메뉴 항목) — ★핵심: 2상태

공통(양 상태): h32 · pad **8px 10px** · gap8(아이콘↔라벨) · radius8 · 아이콘 20×20 · list gap4(항목 간) · 컨테이너 width fill(226).
출처: 홈 GNB layout_HRNGWZ(h32/pad8·10/gap8) · layout_8Y8WHD(list gap4) · layout_0F7XMM(아이콘20).

| 상태 | bg | 텍스트 색 | 텍스트 스타일 | 아이콘 | 출처 |
|---|---|---|---|---|---|
| **active(선택)** | **#242424** | **#FAFAFA** | Body3/**Medium** (14/500/lh160%/ls-2%) | solid(채움) variant, 20px | 홈 '홈' I2087:70381;1613:10923 fill_RR5PVO + style "Body 3/Medium" + fill_S4ZELY ‖ 검색 '검색' 2087:40734 fill_09B1G8(#242424)+style_WGYJUP(Medium) |
| **inactive(비선택)** | transparent | **#B4B4B4** | Body3/**Regular** (14/400/lh160%/ls-2%) | outline variant, 20px | 비선택 항목 fill_UGM5W6(#B4B4B4) + "Body 3/Regular" |

> ⚠ 타이포 주의: **홈 GNB(2087:70381)는 lineHeight 160%**("Body 3/Medium"·"Body 3/Regular" = 14/160%/ls-2%). 검색 GNB(2087:40714)는 동일 항목이 lh130%(style_WGYJUP/style_J1RRAH). **정준 = 홈 auto-layout 프레임의 160%** 채택(나머지는 절대배치 임포트 잔재). gap으로 기록.
> 신규 토큰: `--color-nav-active-bg: #242424`(=surface-200 재사용 가능, #242424 동일) · `--size-nav-item: 32px` · nav item은 button/tabs와 무관한 **신규 nav-item 컴포넌트** 필요.
> 현 구현 차이: tabs는 segment/underline 변형만 → sidebar-nav 변형 없음. active가 brand green 아닌 **#242424 채움**인 점 핵심. `#242424`는 `--color-surface-200`에 존재(재사용 가능). 신규 컴포넌트 `widgets/app-shell/` 또는 `shared/ui/nav-item` 신설.

### 2-1. 메뉴 항목 목록 (★FD1)
홈 · 검색 · 라이브러리 · 수신함 (4탭). **대시보드 제외**(Figma 원본엔 라이브러리·수신함 사이에 '대시보드' 존재 = icon/dashboard, componentId 675:643/1613:10388 — 스코프 결정으로 미구현).
아이콘: 홈=icon/home(1306:5229) · 검색=icon/search(1613:10244) · 라이브러리=icon/library(1613:10349) · 수신함=icon/inbox(1613:11091).

---

## 3. '컨텐츠 추가' CTA (GNB 상단 풀폭 버튼)

| 속성 | 실측값 | 출처 |
|---|---|---|
| width | full-width(226 stretch) | 홈 layout_JP0QAG alignSelf:stretch / 검색 layout_JKG4ZU w226 |
| height | **34px** | layout_JP0QAG h34 / layout_JKG4ZU h34 |
| bg | **#66FF4B** | fill_FK5VA3 / fill_NMOZCM |
| radius | **8px** | borderRadius |
| padding | 홈=**6px 16px** ‖ 라이브러리/검색=**8px 10px 8px 6px** (비대칭) | 홈 layout_JP0QAG pad 6/16 ‖ 검색 layout_JKG4ZU pad 8/10/8/6 |
| gap (아이콘↔라벨) | **4px** | layout_7NEB15 gap4 / layout_JP0QAG gap4 |
| 아이콘 | + (icon/add 1613:11139 또는 아이콘_더하기 675:520), **16×16** | layout_E4VDP5 / layout_PVEUMB 16 |
| 라벨 | '컨텐츠 추가' Body3/Semibold = 14/**SemiBold(600)**/lh160%/ls-2% (홈) | "Body 3/Semibold" |
| 라벨 색 | **홈 = #000000**(순흑 fill_7BL0VJ) ‖ 검색/라이브러리 = **#121212**(fill_6O47YW) | ⚠ 화면별 상이 |

> ★프롬프트 지정값(h34·bg#66FF4B·radius8·pad8/10/8/6·글자#121212)은 검색/라이브러리 변형과 일치. 홈은 pad6/16·글자#000000으로 미세 상이.
> **권장 정준**: height 34 · radius 8 · bg #66FF4B · gap4 · 아이콘16. padding은 비대칭 `8 10 8 6`(아이콘 좌측 여백 보정용 → 시각 센터) 채택. 라벨색은 FD3/토큰 일관성 위해 **#121212(--color-text-on-primary-alt)** 채택, #000000은 [GAP]로 기록.
> 신규 토큰: `--size-button-md: 34px` (★다수 프레임 반복 — 톱바 pill·GNB CTA·본문 액션 전반의 정준 액션 높이). `--text-button-md`(14/600/lh160%/ls-2%) 또는 기존 button-sm(lh130) 대비 lh160 별도.
> 현 구현 차이: button에 h34 없음(42/38만). radius6 고정(8 없음 → `--radius-md`=8 존재하나 .button 미적용). gap 측정10인데 CTA는 4. 라벨 lh 130(button-sm) ≠ 160. → button에 size=md(34)·radius8·lh160·gap4 변형 신설 필요.

---

## 4. 프로필 카드 (GNB 하단 사용자 카드)

| 속성 | 실측값 | 출처 |
|---|---|---|
| width × height | **226 × 50** | 홈 layout_E0LIWM 226×50 / 검색 layout_U6NMA4 226×50 |
| padding | **8px 12px** | layout_E0LIWM / layout_U6NMA4 |
| layout | row · space-between · align center | layout_E0LIWM |
| radius | **10px** | borderRadius:10 |
| border | **1px rgba(255,255,255,0.08)** | strokes fill_0MDEUF / 검색 fill_WTLK57(0.1) ⚠ |
| 위치 | x:14, y:1008(=하단 고정, bottom inset 14) | layout_E0LIWM location |
| 아바타 | **28×28** 원형(ELLIPSE, IMAGE fill) | layout_GPEQ1V 28 / fill_SZUW6L |
| 아바타↔텍스트 gap | **8px** | layout_O90GVU gap8 |
| 이름 | 'Leesuho' 14/**Regular(400)**/lh130%/ls-2.5% **#FAFAFA** | style_53BAFV / fill_S4ZELY |
| Premium 인라인 | mdi:thunder 아이콘 **12×12** + 텍스트 'Premium' **12/Regular(400)/lh130%/ls-2.5%** 색 **#199E41** | layout_469TZV 12 / style_RCLU8W / fill_IK9M1I(#199E41) |
| 이름↔Premium 묶음 | column, gap -1px, padTop 1 (밀착) | layout_C9J3QA |
| 펼침 화살표 | 우측, **16×16**(아이콘_화살표 675:718) | layout_E4VDP5 |

> 신규 토큰: `--size-profile-card-h: 50px` · `--radius-card-profile: 10px`(토큰엔 md=8/lg=12뿐 → 10 신규) · `--size-avatar-profile: 28px`(avatar-sm=24/md=32 사이 → 28 신규).
> 현 구현 차이: Premium 인라인 색 #199E41 = `--color-premium-green` 일치(우수). 카드 자체 미구현. radius10·아바타28 토큰 부재. border는 홈=0.08(=`--color-border-subtle`) / 검색=0.1 상이 → **0.08 채택**(홈 auto-layout 정준).

---

## 5. 내 폴더 / 최근 본 컨텐츠 섹션

| 속성 | 실측값 | 출처 |
|---|---|---|
| 섹션 라벨('내 폴더'/'최근 본 컨텐츠') | Body4/Medium = **13/Medium(500)/lh150%/ls-2.5%** 색 **#B4B4B4** | "Body 4/Medium" / fill_UGM5W6 ⚠ 검색은 lh130(style_96QY5S) |
| 섹션 라벨 위치 | 그룹 상단(폴더리스트 y:25 → 라벨이 위 25px 영역) | layout_U5TF94 / layout_B4Y2YL y:25 |
| 폴더/최근 항목 | nav item과 동일 셸(h32·pad8/10·gap8·radius8) inactive #B4B4B4 | layout_HRNGWZ 재사용 |
| 폴더 아이콘 | icon/folder(1613:11196), 20×20 | layout_0F7XMM |
| 최근 항목 텍스트 | Body3/Regular, **width 178**(말줄임), 썸네일 20×20(radius4) | layout_L63AR7 w178 / 썸네일 layout_O7IP75 radius4 |
| 항목 간 gap | **4px** | layout_B4Y2YL gap4 |
| divider (섹션 구분선) | width 226~227 · height 0 · **1px rgba(255,255,255,0.08)** | layout_AUM9MI / fill_0MDEUF |

> 신규 토큰: `--text-section-label`(13/500/lh150%/ls-2.5%) — 기존 caption-1(13/130)과 lh 상이. `--color-divider-shell: rgba(255,255,255,0.08)`(=border-subtle 재사용).
> 현 구현 차이: 섹션 라벨 lh 홈=150% vs 검색=130%. **홈 150% 채택**. 폴더/최근 항목은 nav-item 컴포넌트 재사용.

---

## 6. 톱바 (Top bar)

| 속성 | 홈 톱바 (2087:69671) | 상세 톱바 (2087:13114) | 출처 |
|---|---|---|---|
| height | **56px** | **56px** | layout_O14NM6 / layout_GPEDFU |
| fill | **#121212** | **#121212** | fill_9BSMUV / fill_QBA2UO |
| radius | **8 8 0 0** | **8 8 0 0** | borderRadius |
| **border-bottom** | **없음**(strokeWeight 미설정) | **1px rgba(255,255,255,0.12)** (strokeWeight 0 0 1) | ⚠ 홈=무 / 상세=하단보더 fill_0JVVLF |
| 우측 버튼페어 gap | **12px** | **12px** | layout_M8VU36 / layout_CZ5117 |
| 우측 정렬 | 우측 고정(x≈1370~1411, y:11) | 동일 | location |
| 좌측 브레드크럼 | 없음(홈) | x:10 y:15 (§7) | layout_E7Y0AX |

> ★FD3/충돌: border-bottom이 홈엔 없고 상세엔 있음. **정준 = 상세의 `1px rgba(255,255,255,0.12)`**(셸 일관성 — 콘텐츠 영역 구분). 홈 미설정은 [GAP] 기록(홈 히어로가 풀블리드라 시각상 생략됐을 수 있음).
> 신규 토큰: `--size-topbar: 56px` · `--radius-topbar: 8px 8px 0 0`(토큰화는 선택) · `--color-topbar-border: rgba(255,255,255,0.12)`(=border-chip 재사용).
> 현 구현 차이: 톱바 미구현. 라운드 8/8/0/0은 토큰 조합으로 표현.

### 6-1. 톱바 우측 pill 버튼 페어
공통: **height 34** · padding **8px 16px** · radius **100(pill)** · 텍스트 14/**SemiBold(600)**/lh130%/ls-2.5%.
출처: layout_XGSLET(h34/pad8·16) · layout_WXQ5S7(상세 동일) · style_XEWY9M/style_SX2I9N(14/600/130/-2.5%).

| 버튼 | bg | border | 텍스트 색 | gap(내부) | 출처 |
|---|---|---|---|---|---|
| **확장 프로그램 설치** (outline) | transparent | **1px rgba(255,255,255,0.24)** | **#FAFAFA** | — | fill_CR20FH(0.24) / fill_K0F3QU(#FAFAFA) |
| **로그인** (filled) | **#66FF4B** | none | **#121212** | 내부 Frame3 gap4(아이콘 대비) | fill_VWDZ4B / fill_9BSMUV(#121212) |

> 신규 토큰: `--size-button-md: 34px`(§3과 공유). pill 버튼 lh130(여기) vs GNB CTA lh160 — 같은 14/600이나 lh 상이 주의.
> 현 구현 차이: button pill 변형은 pad8/16·radius100 일치 ✔, **단 h34 없음**(42/38만) → md(34) 추가 시 해소. outline 보더 0.24 = `--color-border-strong` 일치 ✔(Secondary 기본 0.12와 다름 — pill.secondary가 0.24로 이미 처리됨). 로그인 글자 #121212 = `--color-text-on-primary-alt` 일치 ✔.

---

## 7. 브레드크럼 (톱바 좌측 셀렉트박스)

공통: 칩 컨테이너 row · align center · 칩 간 gap **2px**. 칩 = h26 · pad **6px 8px** · radius **6** · gap10(내부). 텍스트 Cap1_Rg = **13/Regular(400)/lh130%/ls-2%**.
출처: 상세 톱바 layout_E7Y0AX(gap2) + layout_04UPQY(h26/pad6·8/r6) · 라이브러리 layout_VATOL2(gap2) + layout_VF2G05(h26/pad6·8/r6).

| 요소 | 색 | 텍스트 | 출처 |
|---|---|---|---|
| 비활성 크럼 (홈/전체폴더/창업가 정신) | **#767676** | Cap1_Rg 13/400/lh130/ls-2% | fill_Z6QRYH / fill_PUIYGO(#767676) |
| 활성 크럼 (마지막=현재 위치) | Figma **#FFFFFF** → 구현 **#FAFAFA**(FD3) | Cap1_Rg 13/400 ‖ 라이브러리는 동일 #FAFAFA(fill_VXMF3T) | 상세 fill_OKQKMF(#FFFFFF) ‖ 라이브러리 fill_VXMF3T(#FAFAFA) |
| 구분자 '/' | **rgba(255,255,255,0.16)** | 13/**SemiBold(600)**/lh130/ls-2% | fill_8H66CW / fill_PYOW1O(0.16) + style_0YMO49/style_9SIMLY |

> ★FD3: 라이브러리 활성 크럼은 이미 #FAFAFA. 상세 톱바는 #FFFFFF → **#FAFAFA로 통일**.
> 신규 토큰: `--size-breadcrumb-chip: 26px` · `--color-breadcrumb-sep: rgba(255,255,255,0.16)`(신규 — 기존 overlay-white 스케일에 0.16 없음) · `--color-breadcrumb-inactive: #767676`(신규 — gray-400=#898989와 다름, gray-450=#999999와도 다름).
> 현 구현 차이: 브레드크럼 미구현. **#767676**·**rgba(white,0.16)** 둘 다 토큰 부재 → 신규. 칩 radius6=`--radius-sm` 재사용. Cap1_Rg ls -2%(토큰 caption-1은 130/별도 ls 미정 — snug -2% 적용).

---

## 8. 신규 토큰 후보 (집계 18)

| 토큰 | 값 | 용도 | 비고 |
|---|---|---|---|
| `--size-gnb` | 254px | GNB 컨테이너 width | 신규 |
| `--size-gnb-panel` | 226px | GNB 내부 패널 width | 신규 |
| `--color-shell-bg` | #121212 | GNB·톱바 bg | 신규(토큰 미보유 색) |
| `--size-nav-item` | 32px | nav item height | 신규 |
| `--color-nav-active-bg` | #242424 | active nav bg | = surface-200 재사용 가능 |
| `--size-button-md` | 34px | ★CTA·톱바pill·본문액션 정준 높이 | 신규(최우선 — 다수 프레임) |
| `--size-profile-card-h` | 50px | 프로필 카드 height | 신규 |
| `--radius-card-profile` | 10px | 프로필 카드 radius | 신규(md8/lg12 사이) |
| `--size-avatar-profile` | 28px | 프로필 아바타 | 신규(sm24/md32 사이) |
| `--text-section-label` | 13/500/lh150%/ls-2.5% | 내폴더·최근 라벨 | 신규(caption-1과 lh 상이) |
| `--text-button-md` | 14/600/lh160%/ls-2% | GNB CTA 라벨 | 신규(button-sm lh130과 상이) |
| `--size-topbar` | 56px | 톱바 height | 신규 |
| `--color-topbar-border` | rgba(255,255,255,0.12) | 톱바 하단보더 | = border-chip 재사용 |
| `--size-breadcrumb-chip` | 26px | 브레드크럼 칩 height | 신규 |
| `--color-breadcrumb-inactive` | #767676 | 비활성 크럼 | 신규(기존 gray 스케일에 없음) |
| `--color-breadcrumb-sep` | rgba(255,255,255,0.16) | 구분자 '/' | 신규(overlay-white 0.16 없음) |
| `--color-divider-shell` | rgba(255,255,255,0.08) | 섹션 divider | = border-subtle 재사용 |
| `--space-gnb-inset` | 14px | 패널 좌우/하단 inset | = space-7 재사용 |

> 재사용 가능(이미 존재): #242424=surface-200 · 0.12=border-chip · 0.08=border-subtle · 0.24=border-strong · #199E41=premium-green · #FAFAFA=white · #121212=text-on-primary-alt · radius6=radius-sm · radius8=radius-md.

---

## 9. [GAP] 디자인 공백 (집계 6)

1. **[GAP] GNB CTA 라벨 색 화면별 상이** — 홈=#000000(순흑) vs 검색/라이브러리=#121212. 토큰 #000000 미보유. → **#121212(text-on-primary-alt) 통일** 권장, 홈 #000000은 디자인 일관성 위해 무시.
2. **[GAP] 톱바 border-bottom 화면별 상이** — 홈=없음 vs 상세=1px rgba(white,0.12). → **상세값(0.12) 통일** 채택. 홈은 히어로 풀블리드 맥락.
3. **[GAP] nav/섹션라벨 lineHeight 상이** — 홈 auto-layout=160%/150% vs 검색 절대배치=130%. → **홈 auto-layout 정준(160/150)** 채택(검색은 임포트 잔재).
4. **[GAP] 프로필카드 border 상이** — 홈=0.08 vs 검색=0.1. → **0.08(border-subtle)** 채택.
5. **[GAP] GNB CTA padding 상이** — 홈=6/16(대칭) vs 검색·라이브러리=8/10/8/6(비대칭, 아이콘 좌측 보정). → **8/10/8/6** 채택(아이콘 시각 센터).
6. **[GAP] 대시보드 탭(FD1 결정)** — Figma 전 화면 GNB에 '대시보드'(icon/dashboard 675:643) 존재하나 ★FD1로 **구현 제외**. 무엇=Figma vs 스코프=문서 충돌 → 문서(제외) 우선. 기록만.

### 추가 구조 노트 (u4 이관 — 구현 안 함)
- **상세 우측 소셜 사이드바 2상태**(450px 펼침 / 60px 접힘): 프롬프트 지시대로 **구조만 기록**. 본 u0c(셸/디자인시스템) 범위 밖, u4에서 구현. 측정 미수행(대상 프레임 미판독).
