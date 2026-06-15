# u0c — Button 정밀 구현 값표 (Figma 실측 SoT)

> 측정 SoT: file `5GGyKsjXEOpjKMLtUodeSs` · page "프로토타이핑" 2087:5987 하위 실화면 프레임만.
> 컴포넌트 SECTION 2562:7927(비정준)은 미열람. 모든 값 = `get_figma_data` 실측(노드ID 출처 표기).
> 구현 대조: `apps/web/src/app/styles/tokens.css` + `apps/web/src/shared/ui/button/{button.module.css,button.tsx}`.
> ★FD 반영: FD1(GNB 4탭)은 shell 스펙 소관 / FD3(흰색=#FAFAFA) — 버튼 라벨의 '흰색'은 #FAFAFA로 통일하되, **네온 위 다크 라벨은 #000000·#121212·#242424 3종이 실재**(아래 §라벨색 매트릭스).

---

## 0. 요약 (한눈에)

- **★ 정준 small height = 34px** — 전 화면 반복(GNB CTA·톱바 pill·상세 액션툴바·검색 CTA·라이브러리 추가). 구현엔 **34px 부재**(lg 42 / sm 38만). → `--size-button-md: 34px` 신규 필수.
- 구현 사이즈 2종(42/38) → 실측은 **34 / 36(확장팝업) / 38 / 42 / 48(결제) 5종**.
- radius 측정 분포: **8(34px 액션·GNB CTA)**, 6(38/42 버튼), 7(작성), 80(검색하기), 100(pill·검색하기 외 톱바).
- **네온 위 라벨색 3종 실재**: #000000(Button/Box 컴포넌트·검색하기·확장팝업) / #121212(톱바 pill·GNB raw·다음) / #242424(설치하러 가기 lg). 구현 토큰은 #242424·#121212 2종뿐 → **#000000 누락**.
- gap 측정: 4(아이콘 small)·6(작성/원본링크)·10(pill·lg) — 구현은 일괄 10(.button), small만 6.
- 라벨 line-height 측정: **160%**(Button/Box Body3/Semibold) vs 130%(raw frame T2_Sb·톱바) — **혼재**. 구현 small=130%.

---

## 1. 사이즈별 정밀 값표

### [size=md(34px) · ★신규 정준 small] — 전 화면 1차 액션의 표준 높이
구현 `--size-button-lg/sm`(42/38)에 **34px 단 자체가 없음**. 아래 변형 전부가 h34.

| 속성 | 실측값 | 출처 노드 |
|---|---|---|
| height | **34px** (대부분 hug=lh160%×14+pad12 ≈34.4, 일부 fixed 34) | I2087:70381;1613:11280 외 다수 |
| 라벨(컴포넌트) | Body3/Semibold = Pretendard 600 / 14 / lh **160%** / ls **-2%** | I2087:70381;1613:11280 |
| 라벨(raw frame) | 600 / 14 / lh **130%** / ls **-2.5%** | 2087:69675·2087:40715 등 |

→ **신규 토큰 `--size-button-md: 34px`** + 라벨 lh 분기(컴포넌트 160% / raw 130%) 처리 필요.

### [size=36px · 확장 팝업 전용 — 별도]
| 속성 | 실측값 | 출처 |
|---|---|---|
| width × height | 136 × **36** (fixed) | 2074:88359 |
| padding / gap | 9px 14px / 10 | 2074:88359 |
| radius | 6 | 2074:88359 |
| bg / 라벨색 | #66FF4B / **#000000** | 2074:88359 |
| 라벨 | **SF Pro** Bold / 13 / lh130% / ls-2.5% | style_5HFM5N |
- [GAP→note] 브라우저 확장 팝업 native UI(SF Pro·13px·#000). 웹앱 토큰과 별개 — 확장 패키지에서 별도 정의. 웹앱 button엔 36px 미적용 권장.

### [size=sm(38px)] — 모달 footer nav · 댓글 작성
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 38 | 2087:33546 / 2117:22120 |
| padding / gap | 10px 18px / 6 | 2087:33546 |
| radius | 6 (다음) / **7** (작성 — 1px 오차 변형) | 2087:33546 / 2117:22120 |
| 라벨 | T2_Sb = 14 / 600 / lh130% / ls-2%(다음) ·130%(작성, ls 없음) | T2_Sb / style_IZ1E1E |
| width 변형 | **156** fixed(모달 다음) · 108(이전/다음 페어) | 2087:33546(156) |
- 구현 .small = h38·padX18·gap6·radius6·14/130% → **일치**. 단 width 156 변형·radius 7(작성) 미보유.

### [size=lg(42px)] — 모달 CTA 페어 · 소셜(근사)
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 42 | 2087:10972 / 2087:10973 |
| width(페어) | **128** fixed | 2087:10972/10973 |
| radius | 6 | 동상 |
| 라벨 | Bt1_Sb = 15 / 600 / lh **100%** / ls-2% | Bt1_Sb |
| 라벨색(primary) | **#242424** | fill_D9AQDF |
- 구현 .medium = h42·padX18·15/100% → **일치**. width 128 변형 미보유(108만 있음).

### [size=48px · 결제 CTA — mvp-out]
| 속성 | 실측 | 출처 |
|---|---|---|
| height | **48** | 2278:126233 (layout_BJZVR8) |
| radius / bg / 라벨색 | 8 / #66FF4B / #121212 | 감사 §HIGH |
- [GAP-mvp] 결제 주 CTA 48px. 구현 부재. mvp 범위 밖 — `--size-button-xl: 48px` 후보로만 기록.

---

## 2. 변형(variant)별 정밀 값표

### V1. Primary 솔리드 네온 (Button/Box 컴포넌트 — ★정준 GNB CTA)
온보딩·홈·검색·상세 GNB '컨텐츠 추가'가 동일 컴포넌트(Type=Primary,State=Default,Size=Small,Resizing=Fill).

| 속성 | 실측값 | 출처 노드 |
|---|---|---|
| height | hug ≈34 (lh160×14 + padY6×2) | I2087:70381;1613:11280 · I2074:87941;1613:11280 |
| padding | **6px 16px** | layout_OXTPK0 / layout_W06SQ5 |
| gap | **4px** | 동상 |
| radius | **8px** | 동상 |
| bg | #66FF4B | fill_28GJSZ / fill_SO11LK |
| 라벨 | Body 3/Semibold = 14 / 600 / lh **160%** / ls **-2%** | Body 3/Semibold |
| 라벨색 | **#000000** (순흑) | fill_0GZE1C / fill_7ZTQEF |
| icon | 16×16 (icon/add) | layout_Z4QHTE |
| sizing | horizontal: fill (Resizing=Fill) | layout_OXTPK0 |
- **구현 차이**: 구현 .primary는 radius6·라벨 #242424·lh130(sm)·gap10. → radius 8·라벨 #000000·lh160·gap4 전부 불일치. **신규 size-md(34) + on-primary-black(#000000) + lh160 분기 필요.**

### V1b. Primary 네온 — GNB 사이드바 raw frame (width 226)
| 속성 | 실측값 | 출처 |
|---|---|---|
| width × height | **226 × 34** (fixed) | 2087:40715 (layout_9PCRS4) |
| padding | **8px 10px 8px 6px** (비대칭) | layout_9PCRS4 |
| gap | 4 (내부 gap-2 래퍼) | layout_MERD02 |
| radius | 8 | 2087:40715 |
| bg / 라벨색 | #66FF4B / **#121212** | fill_AAGOV5 / fill_HLLWC4 |
| 라벨 | 14 / 600 / lh **130%** / ls-2.5% | style_IVF3ZS |
| icon | 16 | layout_64BRLG |
- 라이브러리 탭 '컨텐츠 추가'(2117:22127)도 동일 패턴: h34·radius8·pad8/16/8/13·라벨 #121212·130%. **GNB raw CTA**는 lh130·#121212로 V1(컴포넌트 lh160·#000000)과 미세 상이 → [GAP-design] 같은 버튼이 컴포넌트본/raw본에서 라벨색·lh 불일치(디자인 측 비정합). 토큰은 컴포넌트본(#000000·160%)을 1차 기준으로, raw값은 화면 구현 시 해당 프레임 우선.

### V2. Primary 네온 pill (radius 100) — 톱바 '로그인' filled / 라이브러리 '그랩 추가'
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 34 | 2087:69675 · 2087:13118 · 2117:21057 |
| padding | **8px 16px** | layout_RFY1UX / layout_QZZPO1 |
| gap | 4 | layout_Z0IHPA |
| radius | **100px** (pill) | 동상 |
| bg / 라벨색 | #66FF4B / **#121212** | fill_OJFUZZ / fill_5CZVDQ |
| 라벨 | 14 / 600 / lh130% / ls **-2.5%** | style_VQFUM8 |
- 그랩 추가(2117:21057): 동일 + 아이콘 16. 구현 .pill.medium/.small = 8/16·radius100 → 패딩/radius 일치하나 **h34 부재**·라벨색 #121212 미선택(primary 기본 #242424).

### V3. Secondary outline pill (radius 100, 보더 0.24) — 톱바 '확장 프로그램 설치'
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 34 | 2087:69673 · 2087:13116 · 2551:20025 |
| padding | 8px 16px | layout_HGRZA5 |
| radius | 100 | 동상 |
| bg | transparent | (fills 없음) |
| border | **rgba(255,255,255,0.24) 1px** | fill_3TNF4Z / fill_RKNSZ7 / fill_IWLEPB |
| 라벨 | 14 / 600 / lh130% / ls-2.5% | style_0S00BH |
| 라벨색 | **#FAFAFA** (FD3) | fill_3DQKMV |
- 구현 .pill.secondary border 0.24 → 일치. 단 **h34 부재**. (.secondary 기본 보더 0.12와 구별 OK.)

### V4. Secondary outline 사각 (radius 8, 보더 solid #363636) — 상세/라이브러리 액션 '원본 링크'·'좋아요'
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 34 | 2087:12635 · 2117:20175 |
| padding | **8px 14px 8px 11px** (비대칭) | layout_3S2ER8 / layout_NYTGKL |
| gap | 6 | layout_YCWERQ |
| radius | **8** | 동상 |
| bg | transparent | (fills 없음) |
| border | **solid #363636 1px** (≠ rgba white) | fill_8JIS8E / fill_P9HT2F |
| 라벨 | Medium 15 / 500 / lh130% / ls-2% | style_2OMWQU |
| 라벨색 | **#FFFFFF**(상세 2087:12635) / **#FAFAFA**(라이브러리 2117:20175) | fill_PGXRFI / fill_E5IWHO |
| icon | 18×18 | layout_MTIHKJ |
- **구현 차이**: 구현 Secondary 보더=rgba(white,0.12)·h42/38·radius6·라벨 600. 실측은 **solid #363636·h34·radius8·라벨 Medium 500·15px**. → 별개 변형('outline-strong' 또는 secondary on-content) 필요. [GAP-design] 라벨색 #FFFFFF(상세) vs #FAFAFA(라이브러리) — FD3에 따라 **#FAFAFA로 통일** 권장(상세 #FFFFFF는 비정합 1건).

### V5. 라이트 솔리드 (fill #EFEFEF, 다크 라벨) — 상세 '클립 추가' (★핵심 액션)
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 34 | 2087:12643 |
| padding | **8px 14px 8px 11px** | layout_8MM9B2 |
| gap | 6 | layout_J15H4N |
| radius | 8 | 2087:12643 |
| bg | **#EFEFEF** (밝은 회백) | fill_WCP9DQ |
| 라벨 | Medium 15 / 500 / lh130% / ls-2% | style_EGUT3A |
| 라벨색 | **#171717** | fill_60THF4 |
| icon | 20×20 (chromecast) | layout_H9NRJI |
- **구현 부재**: 밝은 채움(#EFEFEF) + 다크 글자(#171717) 변형 전혀 없음. 제품 핵심 액션 → HIGH. **신규 변형 'light-solid' + 토큰 #EFEFEF/#171717 필요.**

### V6. 소셜 솔리드 다크 (fill #242424) — 'Google로 계속하기'
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | hug (pad 18×2 + 14×1.6 ≈58; 감사 다른 인스턴스는 h42) | 2087:8450 |
| padding | 18px 14px | layout_BNPO1F |
| radius | 6 | 2087:8450 |
| bg | **#242424** (solid) | fill_ZPU8SW |
| 라벨 | **Regular 14** / 400 / lh160% / ls-2% (≠ 600) | style_IETPVN |
| 라벨색 | #FAFAFA | fill_D1TQG1 |
| icon | 22×22 | layout_N7F1QC |
| sizing | horizontal: fill (stretch) | layout_BNPO1F |
- **구현 부재**: 솔리드 다크(#242424) 채움 버튼 변형 없음(primary 네온/secondary 투명만). 라벨 weight도 **Regular 400**(구현 일괄 600). → 신규 변형 'solid-dark'. 단 폼이 이메일 인풋과 동형(인풋으로 볼 여지도). [GAP-note] height 측정 인스턴스별 상이(8450=hug58 vs 감사 8458/8461=42).

### V7. 솔리드 그레이 (fill #333333) — 댓글 '작성'
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 38 | 2117:22120 (componentId 802:713) |
| padding | 10px 18px | layout_6LW5V4 |
| gap | 6 | 동상 |
| radius | **7** (★비정준 1px) | 2117:22120 |
| bg | **#333333** (solid 회색) | fill_8NVMU4 |
| 라벨 | SemiBold 14 / 600 / lh130% (ls 없음) | style_IZ1E1E |
| 라벨색 | **#FAFAFA** (★감사 '#FFFFFF'는 오기 — 실측 #FAFAFA) | fill_FZIHR4 |
- **구현 부재**: #333333 솔리드 그레이 변형 없음. radius 7은 6에서 1px → radius8 또는 7 토큰. → 신규 변형 'solid-gray'.

### V8. 검색하기 (radius 80 네온, 라벨 #000000) — 검색바 임베드 CTA
| 속성 | 실측값 | 출처 |
|---|---|---|
| height | 34 | 2087:40411 |
| padding | **14px 16px** | layout_DA5XJR |
| gap | 10 | 동상 |
| radius | **80** (=`--radius-search`) | 2087:40411 |
| bg | #66FF4B | fill_QPY3W7 |
| 라벨 | SemiBold 14 / 600 / lh130% / ls **-2%** | style_L9M73P |
| 라벨색 | **#000000** · textAlign CENTER | fill_P9XPA0 |
- **구현 부재**: radius 80 버튼 미적용(토큰 --radius-search는 있으나 버튼 unused)·h34 부재·라벨 #000000 부재. → 'search-cta' 변형(radius80·pad14/16·#000000).

### V9. lg 페어 솔리드 (128 width) — 요금제 모달 '나중에 하기' / '설치하러 가기'
| 변형 | bg | border | 라벨색 | 공통 |
|---|---|---|---|---|
| 나중에 하기(secondary) | **#1F1F1F** (solid, ≠투명!) | rgba(255,255,255,0.12) | #FAFAFA | w128·h42·radius6·pad16.5/175(=센터)·gap10·Bt1_Sb 15/600/100%/-2% |
| 설치하러 가기(primary) | #66FF4B | none | #242424 | 동상 |
- 출처: 2087:10972(나중에)/10973(설치). **구현 차이**: secondary가 실측 **#1F1F1F 솔리드** 면(구현은 transparent). 별도 'solid-secondary(#1F1F1F)' 변형 필요. width 128 미보유(108만).

### V10. 결제 CTA 변형 (mvp-out) — 요약만
- 안전하게 결제하기: h48·radius8·#66FF4B·#121212 (2278:126233).
- 영수증 다운로드(secondary): **bg #242424 solid** + border rgba(255,255,255,0.1) + #FAFAFA (2278:126347) — 구현 .secondary 투명+0.12와 불일치.
- 홈으로 돌아가기(primary): radius8·#66FF4B·라벨 #121212 (2278:126354).
- [GAP-mvp] 결제 섹션 버튼 = radius **8 일관**(파운데이션 6). 라벨 **#121212** 일관.

---

## 3. 네온 위 라벨색 매트릭스 (★프롬프트 핵심 질문)

네온 #66FF4B bg 위 다크 라벨색이 **3종** 실재. 어디서 쓰이는지:

| 라벨색 | 사용처(실측 노드) |
|---|---|
| **#000000** (순흑) | • Button/Box 컴포넌트(GNB CTA) I2087:70381;1613:11280·I2074:87941;1613:11280 (fill_0GZE1C/7ZTQEF) · • 검색하기 2087:40411 (fill_P9XPA0) · • 확장팝업 CTA 2074:88359 (fill_93ZG0Y) |
| **#121212** | • 톱바 로그인 filled pill 2087:69675·2087:13118 (fill_48W7WX/5CZVDQ) · • GNB raw CTA 2087:40715·라이브러리 추가 2117:22127/21057 (fill_HLLWC4/304994/ZD5DW1) · • 모달 '다음' 2087:33546 (fill_K7D0X9) · • 결제 CTA(mvp) |
| **#242424** | • lg 페어 '설치하러 가기' 2087:10973 (fill_D9AQDF) |

→ 구현 토큰: `--color-text-on-primary: #242424` · `--color-text-on-primary-alt: #121212`. **#000000 미보유** → 신규 `--color-text-on-primary-black: #000000` 필요. 빈도상 **#000000(컴포넌트·검색·확장)** 과 **#121212(톱바·GNB raw·모달·결제)** 가 주류, #242424는 lg 페어 1건뿐.

[GAP-design] 같은 의미의 네온 CTA가 화면별로 #000000/#121212/#242424로 갈림 = 디자인 측 비정합. 무엇=Figma 원칙상 **프레임별 실측값 그대로** 구현(토큰 3종 보유). 단일화 원하면 사용자 결정 필요.

---

## 4. 신규 토큰 후보 목록

### SIZE
- `--size-button-md: 34px` ★ (정준 small — 전 화면 1차 액션. 최우선)
- `--size-button-xl: 48px` (결제 CTA, mvp-out)
- `--size-button-ext: 36px` (확장 팝업 전용 — 웹앱 외, 확장 패키지 권장)

### WIDTH (compact 페어)
- `--size-button-pair-w-sm: 108px` (이미 `--size-button-compact-w`=108 보유)
- `--size-button-pair-w-md: 128px` ★ (요금제 모달 lg 페어 — 누락)
- `--size-button-fixed-156: 156px` (모달 footer '다음' — 또는 fullWidth/grid 처리 가능)
- GNB CTA width 226 = 셸 레이아웃 폭(버튼 토큰 아님, shell 소관)

### COLOR (라벨/면)
- `--color-text-on-primary-black: #000000` ★ (네온 위 순흑 라벨 — 누락)
- `--color-btn-light-solid-bg: #EFEFEF` ★ + `--color-btn-light-solid-label: #171717` (클립 추가 — 누락)
- `--color-btn-solid-gray-bg: #333333` (작성 — 누락; 라벨 #FAFAFA)
- `--color-btn-solid-dark-bg: #242424` (=surface-200 재사용 가능; 소셜·영수증)
- `--color-btn-secondary-solid-bg: #1F1F1F` (=surface-100 재사용 가능; 나중에 하기)
- outline-strong 보더 = `--color-stroke-300`(#363636) 재사용 (V4 — 신규색 아님, 적용만)

### RADIUS
- radius 8(`--radius-md` 보유) 를 **34px 액션·GNB CTA에 적용**(현재 미적용)
- radius 80(`--radius-search` 보유) 를 **검색하기 버튼에 적용**(현재 미적용)
- `--radius-btn-write: 7px` (작성 — 1px 변형. 또는 8로 정규화)

### TYPO (라벨 line-height 분기)
- 현 `--text-button-sm-line: 130%` 외에 **160%(Body3/Semibold 컴포넌트본)** 변형 필요
- `--text-button-social-weight: 400` (소셜 라벨 Regular — 현 일괄 600)
- `--text-button-action-size: 15px`·`--text-button-action-weight: 500` (V4/V5 Medium 15 라벨 — 현 토큰 없음)

---

## 5. 발견한 [GAP] 목록

- **[GAP-impl] ★ 34px 사이즈 전면 누락** — 전 화면 1차 액션 높이가 34px인데 구현은 42/38만. 픽셀-퍼펙트 불가의 최대 원인.
- **[GAP-impl] #000000 라벨색 토큰 부재** — 네온 위 순흑 라벨(컴포넌트 CTA·검색·확장)이 토큰화 안 됨.
- **[GAP-impl] light-solid(#EFEFEF/#171717) 변형 부재** — 상세 핵심 '클립 추가' 미구현.
- **[GAP-impl] solid-gray(#333333) 변형 부재** — 댓글 '작성' 미구현.
- **[GAP-impl] solid-dark(#242424) / solid-secondary(#1F1F1F) 변형 부재** — 소셜·요금제 '나중에 하기'.
- **[GAP-impl] outline-strong(solid #363636 보더·radius8·h34) 부재** — 상세/라이브러리 액션 버튼.
- **[GAP-impl] radius 8·80 버튼 미적용** — 토큰은 있으나 버튼이 일괄 radius6.
- **[GAP-impl] 라벨 lh 160% / Medium 15 / Regular 14 미지원** — 구현은 600·lh100/130만.
- **[GAP-impl] width 128 / 156 변형 부재** — 구현은 compact 108만.
- **[GAP-design] 네온 위 라벨색 3종(#000/#121212/#242424) 화면별 비정합** — Figma 자체 불일치. 프레임별 실측 따르되 단일화는 사용자 결정.
- **[GAP-design] 같은 GNB CTA가 컴포넌트본(radius8·#000·lh160·pad6/16) vs raw본(radius8·#121212·lh130·pad8/10/8/6) 비정합** — 컴포넌트본을 토큰 1차 기준으로.
- **[GAP-design] V4 라벨색 #FFFFFF(상세) vs #FAFAFA(라이브러리)** — FD3에 따라 #FAFAFA 통일 권장(상세 1건이 비정합).
- **[GAP-audit정정] '작성' 라벨색 = #FAFAFA** (감사 본문 '#FFFFFF'는 오기. fill_FZIHR4 실측 #FAFAFA).
- **[GAP-design] radius 7(작성)** — 6에서 1px 이탈. 정규화(8) 또는 7 토큰 결정 필요.
- **[GAP-mvp] 48px 결제 CTA·결제 secondary(#242424 solid+0.1 보더)** — mvp 범위 밖, 토큰 후보로만 기록.
