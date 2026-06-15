# u1-auth-onboarding — FE 측정표 (Figma 전수 실측)

> ★카디널 룰: Figma MCP 픽셀 실측 → 1:1 구현. 추측·근사 금지.
> SoT file=`5GGyKsjXEOpjKMLtUodeSs` · 페이지 "프로토타이핑" 2087:5987 하위 프레임만.
> 모든 px/HEX/폰트 = Figma `get_figma_data` 실측값(레이아웃/스타일 ID 해석 후 기재).
> 토큰·shared/ui만 사용(하드코딩 HEX 금지). 측정 HEX → 우측에 u0c 토큰 매핑.
> 참고 스크린샷: `docs/units/u1-auth-onboarding/figma-refs/{01-login,02-job,04-interests,06-extension-modal}.png`(scale 1).

데스크톱 캔버스 = **1920×1080**(전 프레임). 모바일 프레임 부재(데스크톱 only).

---

## 0. 측정 HEX → 토큰 매핑 (전 프레임 공통)

| 측정 HEX/값 | 의미 | tokens.css 토큰 |
|---|---|---|
| `#121212` | 페이지/셸 배경 | `--color-shell-bg` (온보딩 프레임 fill_8BE5WH=#121212) |
| `#66FF4B` | 네온 brand(주 CTA·stepper active) | `--color-brand-primary` |
| `#FAFAFA` | 흰색(제목·칩글자·이전버튼글자) | `--color-white` / `--color-text-primary` |
| `#CECECE` | 서브텍스트(부제·직접입력 헬퍼·모달 부제) | `--color-gray-550` (`--color-text-secondary`는 #B4B4B4이니 주의) |
| `#999999` | placeholder | `--color-gray-450` / `--color-text-tertiary` |
| `#434343` | stepper inactive | `--color-stepper-inactive` |
| `#242424` | 소셜버튼 bg·네온 위 글자·이메일 인풋 bg·모달 우CTA 글자 | `--color-surface-200` / `--color-text-on-primary` |
| `#1F1F1F` | 모달 카드 면색·모달 좌CTA bg | `--color-surface-modal`(=surface-100) |
| `#363636` | 직접입력 박스 보더(Dark-Stroke-300) | `--color-stroke-300` |
| `#FFFFFF` | 칩 글자(직업/연차/관심) — Figma 원시값 | ★실측 #FFFFFF지만 사용자결정 "흰색=#FAFAFA"(FD3) → `--color-white`(#FAFAFA)로 통일 |
| `rgba(255,255,255,0.12)` | 칩 보더·이전(secondary)버튼 보더·모달 좌CTA 보더 | `--color-border-chip` |
| `rgba(255,255,255,0.08)` | divider(관심분야 구분선)·이메일인풋 보더 | `--color-border-subtle` |
| `rgba(255,255,255,0.16)` | 로그인 "또는" divider 선 | `--color-border-breadcrumb-sep`(0.16 스케일) |
| `rgba(0,0,0,0.6)` | 모달 백드롭 scrim | `--color-overlay-black-60` |
| `#B4B4B4` | 로그인 약관 문구 | `--color-text-secondary`(gray-500) |

**타이포 매핑**

| 측정 textStyle | size/weight/lh/ls | 토큰/처리 |
|---|---|---|
| 온보딩 제목 style_JU9BCR | 36 / 600 / 130% / -2% | ⚠ **토큰 부재**(최대 title-1=32) → `--text-onboarding-title:36px` 신규 추가 후 사용 |
| 온보딩 부제 style_CX49YX | 16 / 400 / 160% / -2% | `--text-body-1`(16) |
| 칩 글자 style_78H04B/JFTBZD/A65K76 | 15 / 600 / 130% / -2% | `--text-chip`(15/600/130%) = Chip default 내장 |
| 버튼(이전/다음/완료) Bt1_Sb | 15 / 600 / 100% / -2% | `--text-button-lg`(15/600/100%) = Button 내장 |
| 직접입력 헬퍼 style_TCNH13 | 14 / 400 / 130% / -2% | `--text-body-3`(14) 변형(130%) |
| 직접입력 placeholder B1_Rg | 14 / 400 / 160% / -2% | Textarea lg 내장(14/160%) |
| 로그인 heading Display 2/Semibold | 30 / 600 / 130% / -2% | ⚠ 토큰 부재(title-2=28/title-1=32) → 30px 신규 또는 가장 근접 매핑 결정 필요 |
| 로그인 소셜버튼 글자 style_4159VO | 14 / 400 / 160% / -2% | `--text-button-social`(14/400/160%) = Button socialSolidDark 내장 |
| 로그인 약관 style_OBSKUC | 13 / 400 / 130% / -2% | `--text-body-4`(13)/caption-1 |
| 모달 제목 style_WAM4MG | 28 / **700(Bold)** / 130% / -2% | `--text-title-2`(28) + weight bold |
| 모달 부제 style_N7HRVS | 16 / 400 / 130% / -2% | `--text-body-1`(16) 변형(130%) |
| 모달 섹션라벨 style_E5HZSM | 14 / 400 / 130% / -2% | `--text-body-3`(14) |
| 모달 체크행 텍스트 style_B8KN77 | 16 / **500(Medium)** / 130% / -2% | `--text-body-1`(16) + medium |

**radius**: 버튼/칩/인풋/직접입력박스 = **6px**(`--radius-sm`) · 모달 카드 = **12px**(`--radius-lg`) · stepper 세그먼트 = **100px**(`--radius-pill`).

---

## 1. 로그인 진입 `2087:8221` ("온보딩_회원가입 01")

> ⚠ **E1 스코프 컷**(PM 2026-06-15): Naver 버튼 · 이메일 입력 · "또는" divider · "계속" CTA · (이메일 헬퍼)는 **렌더 제외**. Google + Kakao 버튼만 렌더. ADR-0001 준수. 픽셀 충실도는 게이트 ⓒ '스코프 컷'으로 사인오프. (아래 표는 Figma 원본 측정 — 컷 항목은 비고에 표기.)

**레이아웃 골격**: 프레임 1920×1080, bg `#121212`. 좌측 컬럼(`Frame 2085669065` layout_4QPFG8) **x=276 y=251, width=414, column, gap 24, hug**. 우측 프로모(`Component 31`) **x=966 y=8, 946×1064**(스코프 외 — 일러스트 패널, u0c 외·렌더는 정적 이미지/플레이스홀더).

| 영역 | 노드 | 측정값 (px/스타일) | u0c 매핑 | 비고 |
|---|---|---|---|---|
| 로고 헤더 | 2087:8223 | row, x=32 y=28, w=902, space-between, center | (앱셸 외부 — 온보딩 전용 헤더) | 로고 91×24.75 |
| 헤딩 블록 | 2087:8441 | column gap 6, w=339 | — | |
| · 제목 | 2087:8442 | "Grab your growth, Together" · 30/600/130%/-2% · #FAFAFA | `--color-white` | ⚠ 30px 토큰 부재 |
| · 부제 | 2087:8443 | "당신의 성장 여정을 함께 합니다." · 16/400/160% · #B4B4B4 | `--color-text-secondary` | |
| "또는" divider | 2087:8444 | row center gap10, 양쪽 선 186.5w stroke rgba(255,255,255,0.16) 1px, "또는" 12/400/130% #B4B4B4 | `--color-border-breadcrumb-sep` | ✂ **컷**(이메일 섹션과 함께) |
| 소셜 버튼 그룹 | 2087:8449 | column gap 12, w=414 | — | |
| · Google 버튼 | 2087:8450 | **row, fill #242424, radius 6, padding 18/14, h=42, fill width** · 아이콘 22×22 + "Google로 계속하기" 14/400/160% #FAFAFA(center) | **Button `variant=socialSolidDark` `fullWidth`** + leadingIcon(Google 22px) | ✅ 렌더 |
| · Naver 버튼 | 2087:8458 | 동일(아이콘 20×20, "Naver로 계속하기") | Button socialSolidDark | ✂ **컷**(E1) |
| · Kakao 버튼 | 2087:8461 | 동일(아이콘 20×20, "Kakao로 계속하기") | **Button socialSolidDark fullWidth** + leadingIcon(Kakao 20px) | ✅ 렌더 |
| 이메일 섹션 | 2087:8464 | column gap 48, w=414 (라벨"이메일"14·인풋·헬퍼·"계속"버튼) | — | ✂ **컷**(E1) |
| · 이메일 인풋 | 2087:8469 | row, fill #242424, stroke rgba(255,255,255,0.08) 1px, radius 6, pad 18/14, h=42, w=414 · placeholder "이메일 주소를 입력하세요." 14/400/160% #999999 | Input `variant=default` | ✂ 컷 |
| · "계속" CTA | 2087:8474 | INSTANCE 버튼_48px, fill **#66FF4B**, radius 6, pad 16.5/175, h=42, fill width · "계속" 15/600/100% #242424 | Button `variant=primary` fullWidth | ✂ 컷 |
| 약관 문구 | 2087:8475 | "계속하면 [이용약관] 및 [개인정보처리방침]을…" · 13/400/130% center · #B4B4B4(링크 강조 ts2) | `--color-text-secondary` | ✅ 렌더(링크 목적지=E6 플레이스홀더) |

**컷 후 좌측 컬럼 구성(렌더 대상)**: 로고헤더 → 헤딩블록(제목+부제) → 소셜버튼 그룹(Google·Kakao 2개, gap 12) → 약관 문구. (gap 24 column 유지, 이메일/divider/계속 제거.)

**상태(파운데이션으로 채움)**: OAuth 진행 중 = 버튼 펜딩/스피너(Button disabled+spinner) · 콜백 처리 중 = 로딩 · OAuth 실패/취소 = 토스트(toast) + 재시도(로그인 복귀). 전용 프레임 없음(E6).

---

## 2. 온보딩 공통 골격 (직업/연차/관심/목표 4프레임 동일)

> 4프레임 전부 동일 그리드. 좌표·구조 1:1 동일, **칩 목록·stepper active·버튼 라벨만 다름**.

| 영역 | 위치(px) | 측정 레이아웃 | u0c 매핑 |
|---|---|---|---|
| 로고 헤더 | x=32 y=28, w=902, space-between | row center | 온보딩 전용 헤더(앱셸 외) |
| **Stepper** | **x=164 y=230**, row, gap **4**, hug | 세그먼트 **40×4** each, radius 100 · active #66FF4B / inactive #434343 | **Stepper `total=4` `current=N`** (N=단계) |
| 제목+부제 | **x=162 y=340**, column gap 6, hug | 제목 36/600/130% #FAFAFA · 부제 16/400/160% #CECECE | `--text-onboarding-title`(신규 36) · `--color-gray-550` |
| 칩 그리드 | **x=162 y=461**, row **wrap**, gap **14**, align center, w=**609(직업)/642(연차·관심·목표)** | 칩 = hug w, h **42**, pad **10/18**, gap10, radius 6 | **Chip `variant=default`** (선택 시 `selected`) |
| 버튼 행(이전/다음·완료) | **x=162 y=850**, row, gap **12**, hug(관심은 align center) | 버튼 w **108 고정**, h 42, pad 16.5/175, radius 6 | **Button `compact`** (이전=secondary / 다음·완료=primary) |
| 프로모 패널(우) | x≈966, ~946×1064 | 정적 일러스트(스코프 외) | 정적 이미지/플레이스홀더 |

**칩 측정(공통)**: unselected = 투명 bg + stroke `rgba(255,255,255,0.12)` 1px + radius 6 + 글자 15/600/130%/-2% #FFFFFF(→#FAFAFA 통일). h42 pad10/18.
**버튼 측정(공통)**: 이전 = bg #121212(=프레임색, 투명효과) + stroke rgba(255,255,255,0.12) 1px + 글자 #FAFAFA → **Button secondary compact**. 다음/완료 = bg #66FF4B + 글자 #242424 → **Button primary compact**.

⚠ **칩 selected 채움 = 디자인 공백**: 4프레임 정적 export에 selected 칩 예시 **없음**(전 칩 unselected). u0c Chip default의 selected도 동일 gap(주석 "브랜드 보더 강조, 추측 채움 ❌"). → **PM/디자인 결정 필요**(아래 §공백 G1).

---

### 2-① 직업 (단일선택) `2087:8476` ("…03")

- stepper: **current=1** (rect 8489 #66FF4B / 8490·8491·8492 #434343).
- 제목 "어떤 일을 하고 계신가요?" / 부제 "비슷한 동료들과 연결해 드려요."
- 버튼: 이전(secondary) / 다음(primary).
- 칩 **10개**(단일선택) — 칩 그리드 w=**609**:
  기획 · PM / 디자이너 / 개발자 / 마케터 / HR · 인사 / 데이터 분석가 / 영업 · 세일즈 / 취준생 · 학생 / 창업가 / 기타.
  > ⚠ **spec 불일치**: spec L18은 11개(데이터 분석가 추가로 11 표기)였으나 **Figma 실측 = 10개**. Figma=SoT → 10개. (PM 확인: §공백 G2.)

### 2-② 연차 (단일선택) `2087:8726` ("…04")

- stepper: **current=2** (8489·8490 #66FF4B / 8491·8492 #434343).
- 제목 "경력이 어떻게 되시나요?" (부제 없음 — 측정상 부제 텍스트 부재).
- 버튼: 이전(secondary) / 다음(primary).
- 칩 그리드 w=**642**.
- 칩 **6개**(단일선택): 취준생 · 학생 / 0~1년차 / 2~3년차 / 4~6년차 / 7~9년차 / 10년차 이상.

### 2-③ 관심분야 (복수선택 + 직접입력) `2087:8968` ("…05")

- stepper: **current=3** (8489·8490·8491 #66FF4B / 8492 #434343).
- 제목 "관심 분야가 어떻게 되시나요?" / 부제 "선택하신 관심 분야를 바탕으로 맞춤 컨텐츠를 추천해 드려요."
- 버튼: 이전(secondary) / 다음(primary). 버튼 행 align center.
- 칩 그리드 w=**642**.
- 칩 **12개**(복수선택): 면접 · 자소서 / 포트폴리오 / 프로덕트 · 서비스 기획 / 디자인 / 프로그래밍 / 커리어 / 리더십 / 협업 · 커뮤니케이션 / 마케팅 · 그로스 / 업무 생산성 / 마인드셋 / 창업 · 스타트업.
- **divider**(Vector 452): x=162 y=643, w=642, stroke rgba(255,255,255,0.08) 1px (칩↔직접입력 구분).
- **직접입력 섹션**(Row 7, x=162 y=667, column gap 10, w=642):
  - 헬퍼 텍스트: "또는 관심 분야를 직접 입력하여 더 정확한 추천을 받을 수 있어요." 14/400/130%/-2% #CECECE.
  - 입력박스(마크다운_콜아웃 2087:9224): **h=64**, pad **10/12**, stroke **#363636** 1px, radius 6, fill width · placeholder "예) UX 리서치, 사이드 프로젝트, 스타트업 취업, 디자인 시스템 등" 14/400/160% #999999.
  → **Textarea `mode=lg`** (u0c 주석에 "온보딩 관심분야 2087:9224 h64" 명시 — 정확 매칭).

### 2-④ 목표 (단일선택) `2087:9228` ("…06") ★ = PRD '현재 상황'(단일·필수)

- stepper: **current=4** (8489~8492 전부 #66FF4B).
- 제목 "지금 어떤 목표를 향해 가고 있나요?" / 부제 "같은 방향의 동료들과 함께 성장할 수 있게 해 드려요."
- 버튼: 이전(secondary) / **완료(primary, "완료")** — 완료 버튼 fill #66FF4B 글자 #242424.
- 칩 그리드 w=**642**.
- 칩 **5개**(단일선택): 취업 · 이직 / 역량 강화 · 스킬업 / 승진 · 직급 상승 / 직무 · 업종 전환 / 업무 외 자기계발.

---

## 3. 확장 설치 모달 `2087:9468` (홈 오버레이)

**구조**: scrim(`Rectangle 3466205` 2087:10930, 1920×1080, fill rgba(0,0,0,0.6)) + 다이얼로그 카드(`모달_검색` 2087:10931).

| 영역 | 노드 | 측정값 | u0c 매핑 |
|---|---|---|---|
| Scrim | 2087:10930 | 1920×1080 (x=0 y=-1), rgba(0,0,0,0.6) | Modal backdrop |
| 다이얼로그 카드 | 2087:10931 | **x=461 y=188, 998×702** · bg `#1F1F1F` radius **12** · shadow(0px 20px 48px -8px rgba(17,17,17,.24) + 2레이어) | **Modal `width=998`(lg)** |
| · bg rect | 2087:10932 | 998×702 fill #1F1F1F radius 12 | (Modal panel) |
| · 좌 일러스트 | 2087:10933 | 브라우저/확장 SVG 그룹(좌측 ~절반) | 정적 SVG/이미지(스코프 외 일러스트) |
| **우 컬럼 콘텐츠 (x=525~)** | | | (Modal body, 2단 우측) |
| · 섹션 라벨 | 2087:10977 | x=525 y=116, 102×18 · "확장 프로그램 설치" 14/400/130% **#66FF4B** | `--color-brand-primary` |
| · 제목 블록 | 2087:10974 | x=525 y=150, column gap 8, w=347 | Modal title 영역 |
| ·· 제목 | 2087:10975 | "크롬 확장 프로그램 설치 안내" 28/**700**/130% #FAFAFA | `--text-title-2` bold |
| ·· 부제 | 2087:10976 | "크롬 확장 프로그램을 설치하고\n빠르고 편리하게 인사이트를 기록하세요." 16/400/130% #CECECE | `--color-gray-550` |
| · 체크 리스트 | 2087:10978 | x=525 y=278, column hug | — |
| ·· 체크 행 ×3 | 10979/10982/10985 | row, align center, gap 6, pad **20/0**, w=383 · 앞2행 bottom border rgba(255,255,255,0.08) 1px | (체크아이콘 20px + 텍스트) |
| ··· 체크 아이콘 | 10980/10983/10986 | 20×20 componentId 1626:14399(체크박스, 그린 체크) | 정적 SVG(20px) |
| ··· 텍스트 | 10981/10984/10987 | 16/**500**/130% #FAFAFA — "탭 전환이 필요없는 논스톱 컨텐츠 등록" / "영상 또는 아티클 시청 중 즉각적인 클리핑" / "빠르고 접근성 좋은 인사이트 기록 환경" | `--text-body-1` medium |
| · 버튼 행 | 2087:10971 | x=525 y=576, row, gap 12, hug | Modal footer |
| ·· "나중에 하기" | 2087:10972 | **w 128 고정**, h42, pad16.5/175, radius6 · bg #1F1F1F + stroke rgba(255,255,255,0.12) 1px · 글자 15/600 #FAFAFA | **Button `variant=secondary` `compactMd`** |
| ·· "설치하러 가기" | 2087:10973 | **w 128 고정**, h42, radius6 · bg **#66FF4B** · 글자 15/600 #242424 | **Button `variant=primary` `compactMd`** |

**모달 동작**: 홈 진입 직후 1회 자동 노출(E5) · "설치하러 가기" = 크롬 웹스토어 새 탭(URL=E4 env 플레이스홀더) · "나중에 하기" = 닫고 홈. 펜딩(설치 이동 중)·표시/숨김 = 파운데이션.

---

## 4. 데이터 표면 (RPC/필드 의존 — BE 헤드리스와 계약)

> FE가 소비/배선하는 데이터(상세는 BE 소관, FE는 입력값 누적·완료 호출만).

| 단계 | 입력 | 카디널리티 | 프로필 필드(코호트 분리 ADR-0002 #6) | 검증 |
|---|---|---|---|---|
| 로그인 | OAuth(Google/Kakao) | — | Supabase Auth 세션(u0b/ADR-0001) | 미인증/만료=401·콜백 실패 라우팅 |
| ① 직업 | 단일칩(10중 1) | 단일·필수 | **public 코호트**(직업) | 미선택 시 다음 차단 |
| ② 연차 | 단일칩(6중 1) | 단일·필수 | **public 코호트**(연차) | 미선택 시 다음 차단 |
| ③ 관심분야 | 복수칩(12) + 직접입력 | 복수 **1~5**(직접입력 포함) | **private**(관심사) | 0개=차단 · 6번째=차단(E2) · 직접입력 빈/공백/중복/길이/XSS 무해화 |
| ④ 목표 | 단일칩(5중 1) | 단일·필수 | **private**(목표≈현재상황, E3) | 미선택 시 완료 차단 |
| 완료 | — | — | 온보딩 완료 플래그(또는 코호트 NOT NULL) | 완료=홈+모달 · 미완료=온보딩 게이팅 |

- **저장 RPC**: 온보딩 "완료" 시 본인 `profiles`에 직업·연차·목표(단일·필수) + 관심분야(복수 1~5, 직접입력 포함) 저장(additive RPC, BE 정의). RLS=본인 쓰기.
- **게이팅**: 인증 후 미완료=온보딩 라우트, 완료=홈 직행(L1-e). 재로그인 시 온보딩 스킵.
- **enum/컬럼명**: 직업·연차·목표·관심분야 enum 값 = Figma 라벨 SoT(E3 매핑). 정확 컬럼명/enum = BE 헤드리스(u0b profiles 위 additive)와 동기화 필요.
- 칩 selected 채움색 외 모든 측정값 확정 → BE 계약(필드/카디널리티)과 FE 입력 규칙 정렬됨.

---

## 5. u0c 컴포넌트 매핑 요약 (새 컴포넌트 발명 ❌)

| 화면 요소 | u0c 컴포넌트 | props |
|---|---|---|
| 소셜 버튼(Google/Kakao) | `Button` | `variant=socialSolidDark` `fullWidth` + leadingIcon |
| 다음/완료/계속(주 CTA) | `Button` | `variant=primary` (`compact`=온보딩 108 / `compactMd`=모달 128 / `fullWidth`=로그인) |
| 이전(보조) | `Button` | `variant=secondary` `compact` |
| 나중에 하기(모달 보조) | `Button` | `variant=secondary` `compactMd` |
| 단계 칩(직업/연차/관심/목표) | `Chip` | `variant=default` (`selected` — ⚠ 채움 gap G1) |
| 진행 인디케이터 | `Stepper` | `total=4` `current={1..4}` |
| 직접입력 박스(관심분야) | `Textarea` | `mode=lg` (h64) |
| 이메일 인풋(컷) | `Input` | `variant=default` (E1 컷) |
| 확장 설치 모달 | `Modal` | `width=998` (lg) + footer 2버튼 |
| 토스트(에러/제한) | `Toast`(u0c) | OAuth 실패·관심분야 5개 초과 안내(E2/E6) |
| 온보딩 stepper 래퍼 | `widgets/onboarding-stepper` | u0c Stepper 래핑(boundaries) |

**전부 u0c 기존 컴포넌트로 커버됨.** 신규 컴포넌트 불요. 신규 토큰 1~2개만 필요(아래).

---

## 6. 디자인 공백 / 결정 필요 (PM 게이트)

- **G1 — 칩 selected 채움색(공백, 영향 큼):** 4단계 칩 전부 onboarding 정적 export에 unselected만 존재. selected 채움색 부재(u0c Chip default도 동일 gap). 다른 화면 selected 패턴(filter/source 칩)은 `#FAFAFA bg + #111111 글자`이나 default 칩엔 미적용. → **결정: default 칩 selected = (a) 흰 채움 #FAFAFA/글자 #111111 패턴 차용 vs (b) 브랜드 보더 #66FF4B 강조 vs (c) bg #2E2E2E(surface-tag)**. 추측 채움 금지 — PM/디자인 확정.
- **G2 — 직업 칩 개수 spec↔Figma 불일치:** spec L18=11개, **Figma 실측=10개**. Figma=SoT로 10개 채택(기획·PM/디자이너/개발자/마케터/HR·인사/데이터 분석가/영업·세일즈/취준생·학생/창업가/기타). PM 확인만 필요.
- **G3 — 신규 토큰 필요:** ① `--text-onboarding-title` = 36px/600/130%/-2%(온보딩 제목, 현 최대 title-1=32 부재). ② 로그인 heading 30px(Display2) — title-2=28/title-1=32 사이, 부재. → 토큰 먼저 추가 후 사용(하드코딩 금지).
- **G4 — 연차 단계 부제 부재:** ②연차 프레임에 부제 텍스트 없음(직업/관심/목표는 있음). 의도된 공백 → 부제 미렌더(추측 추가 ❌).
- **G5 — 관심분야 5개 초과 차단 UI(E2, 공백):** 6번째 선택 차단 UI 부재 → 제안: 6번째 비활성 + 토스트("최대 5개"). PM 확정(spec E2).
- **G6 — 에러/로딩/약관 전용 프레임 부재(E6):** OAuth 실패·취소·네트워크·약관 거부 전용 프레임 없음 → 파운데이션(toast+재시도, 로그인 복귀)으로 일관 채움. 약관/개인정보 링크 목적지(2087:8475) 미정 → 정적 법무 페이지/외부 플레이스홀더.
- **G7 — 프로모 패널·모달 일러스트:** 로그인 우측 프로모(946×1064)·모달 좌측 확장 일러스트는 복잡 SVG 그룹(스코프 외 정적 자산). 정적 이미지/SVG export로 처리(픽셀 충실도 책임은 콘텐츠 영역 한정, 일러스트 자체는 정적 자산).
