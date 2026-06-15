# u0c 정밀 구현 값표 — Tabs

> SoT: Figma file `5GGyKsjXEOpjKMLtUodeSs` · 페이지 "프로토타이핑" 2087:5987 하위 실화면 프레임.
> 모든 값은 Figma MCP `get_figma_data` 실측. 추측·근사 없음. 디자인 공백은 `[GAP]`.
> 대조 구현: `apps/web/src/shared/ui/tabs/tabs.module.css` · `tabs.tsx` · `apps/web/src/app/styles/tokens.css`.
>
> ★결론 요약: tabs 컴포넌트는 **3개 변형**이 필요(현재 2개). ① `segment`(pill) ② `underline` ③ `list`(검색 카테고리 세로 텍스트탭, 신규).
> 가장 큰 충실도 결함 2건: (A) underline active 색 = 구현 네온 `#66FF4B` → **실측 흰색 `#FAFAFA`** (실화면 4프레임 전수 흰색, 네온 아님). (B) segment 컨테이너 bg = 구현 ghost `rgba(255,255,255,0.04)` → **실측 solid `#1B1B1B`**, item fontSize 13 → **실측 15**.

---

## 변형 1 — `segment` (세그먼트 pill 컨트롤)

홈 1차 내비 토글(취향관/피드). selected = 채움 pill. 출처: 홈 `2173:124313` (Control/Segmented, INSTANCE).

### 컨테이너 (`.segment`)
| 속성 | 실측값 (출처) | 현 구현 | 차이 |
|---|---|---|---|
| layout | row→실은 `mode: column` gap10 (단일 행 래퍼 `2173:124313`/layout_LAT0BT). 내부 아이템 행은 `I…1613:11574`/layout_PHE7WK gap **4** | flex row, gap **10** (`--space-5`) | ★ 아이템 간 gap = **4**(`--space-2`), 구현 10 → **틀림** (LOW 항목 `2087:12541` itemSpacing 4와 일치) |
| padding | **4px** 전방향 (layout_LAT0BT padding 4) | 4 (`--space-2`) | ✅ |
| border-radius | **100px** (`2173:124313` borderRadius) | 100 (`--radius-pill`) | ✅ |
| background | **#1B1B1B (solid)** (fill_0QSI6H) | `rgba(255,255,255,0.04)` (`--color-surface-ghost`) | ★ **틀림** — solid #1B1B1B. 토큰 미등재 |
| height | hug (고정값 없음 — 아이템+pad로 결정) | `36px` 고정 (`--size-tab`) | layout-diff: Figma는 hug. 36 고정은 실측 아이템(28)+pad(4·2)=36과 우연히 일치하므로 시각상 OK이나 정본은 hug |

### 아이템 (`.segment .tab`) — selected (취향관)
node `I2173:124313;1613:11575` / layout_60EXDM
| 속성 | 실측값 (출처) | 현 구현 | 차이 |
|---|---|---|---|
| padding | **4px 12px 4px 10px** (T/R/B/L — 비대칭, 아이콘 동반) (layout_60EXDM) | `8px 12px` 대칭 (`--space-4` / `--space-6`) | ★ **틀림** — 상하 4(현 8)·좌 10·우 12 |
| gap (아이콘↔라벨) | **4px** (내부 layout_PHE7WK gap4) ※컨테이너 layout_60EXDM 자체 gap은 10이나 단일 child라 무효 | (아이콘 슬롯 없음) | [GAP] 구현 tabs에 아이콘 슬롯 없음 → 라벨 only. 아이콘 도입 시 gap4 |
| border-radius | **100px** (borderRadius) | 100 (`--radius-pill`) | ✅ |
| background (selected) | **#363636** (fill_JOM5QA) | `#363636` (`--color-surface-tab-selected`) | ✅ |
| font | **Body 2/Semibold = Pretendard 15 / 600 / lh160% / ls-2%** (취향관 Label, fill #FAFAFA) | `13` (`--text-caption-1-size`) / 600 / lh **130%** | ★ **틀림** — fontSize 15(현 13)·line-height 160%(현 130%)·ls-2%(현 -2.5%) |
| color (selected) | **#FAFAFA** (fill_OXE2DH) | `#FAFAFA` (`--color-text-primary`) | ✅ |
| height | hug (라벨+pad) → 실측 라벨lh(15×1.6≈24)+pad8 ≈ 32 | `28px` 고정 (`--size-tab-item`) | layout-diff: hug 권장. 28 고정 시 15px·160% 라벨이 안 들어감 → **높이 재산정 필요** |

### 아이템 — unselected (피드)
node `I2173:124313;1613:11578` / `…1613:11580` Label
| 속성 | 실측값 (출처) | 현 구현 | 차이 |
|---|---|---|---|
| background | 없음(투명) — fill 없음, borderRadius 100 | transparent | ✅ |
| font | **Body 2/Medium = Pretendard 15 / 500 / lh160% / ls-2%** | `13` / 500 / 130% | ★ fontSize·line-height 동일 결함(15/160%) |
| color (unselected) | **#999999** (fill_14Z2J1) | `#999999` (`--color-text-tertiary`) | ✅ |

> ⚠ 검증: 다른 segment 화면(라이브러리 `2117:25117`, 대시보드 `2557:34597`, content-detail `2087:12541`)에서는 selected `#363636` 글자 13/600·unselected #999999 13/500로 **fontSize 13**이 실측됨(LOW 감사). 즉 **세그먼트는 화면별로 두 사이즈가 존재**:
> - **`segment` 기본(소형) = fontSize 13** (라이브러리/대시보드/상세 — 보조 토글)
> - **`segment-lg`(대형) = fontSize 15** (홈 취향관/피드 — 1차 내비 토글 `2173:124313`)
> → HIGH 감사(line 92)가 "이 세그먼트는 1차 내비라 15가 정답"이라 했으나, 13짜리 화면도 실존하므로 **두 사이즈 변형(size=sm 13 / lg 15)로 분기**가 픽셀-퍼펙트 정답. lg만 컨테이너 bg #1B1B1B(홈), sm은 ghost 0.04(라이브러리·대시보드, LOW line 371 fill 0.04 실측)로 컨테이너 배경도 분기됨.

---

## 변형 2 — `underline` (밑줄 인디케이터 탭, 상세 사이드바)

상세(콘텐츠 디테일) 본문/소셜 사이드바 탭. active = **흰 밑줄 2px + 흰 글자**(★네온 아님). border-bottom 컨테이너 hairline.

### 출처 프레임 전수 (active state 모두 흰색)
| 프레임 | item height | item padding | active 글자/밑줄 색 | font | 비고 |
|---|---|---|---|---|---|
| `2117:20311` (라이브러리 상세 "인사이트" active) | **52** (layout_E1N9YO) | **10px 20px** | **#FAFAFA** (fill_KVB573, 글자) · 컨테이너 stroke-bottom **#FFFFFF 2px** (fill_4MKAVR, strokeWeight 0 0 2) | **16 / 600 / lh130% / ls-2%** (style_21HYDN) | 단일 active 탭 프레임 |
| `2557:23067` (콘텐츠 디테일 탭 행: 인사이트 active + AI노트 inactive) | **56** (layout_PAO8VM/PCDX2Q) | **10px 20px** | active "인사이트" **#FFFFFF** (fill_WRX7NM) · 밑줄 stroke **#FFFFFF 2px** | active 16/**600**(style_ZGAR2X), count "16" 16/400 #B4B4B4(fill_W1YHRT) | inactive "AI 노트" **#B4B4B4** (fill_W1YHRT) 16/**500**(style_L7OPQA) |
| `2117:20312`/`2557:23076` (inactive) | 동일 행 | 10/20 | inactive **#B4B4B4** | 16/500 | active와 같은 행 |

### 정밀값 (정본)
| 속성 | 실측값 (출처) | 현 구현 (`.underline`) | 차이 |
|---|---|---|---|
| container border-bottom | **2px** 솔리드 (트랙 자체가 2px stroke) — 단, 컨테이너 하단 구분선은 별도로 **#2D2D2D 1px** (감사 HIGH line 280: `2557:23067` 컨테이너 하단 border #2D2D2D 1px) | `1px solid` `--color-stroke-200`(#2E2E2E) | ★ active 밑줄(2px 흰)과 컨테이너 구분선(1px #2D2D2D)은 **다른 레이어**. 구현은 컨테이너에 1px #2E2E2E만 → active 2px 흰 밑줄 색이 네온이라 틀림. 또 구분선 색 #2E2E2E vs 실측 #2D2D2D (미세差, GAP) |
| item height | **52~56** (라이브러리 52 / 콘텐츠디테일 56) | (고정 없음, pad12/0로 결정 ≈ 라벨18×1.3+24) | ★ Figma는 고정 height 52 또는 56. 화면별 상이 → 아래 [GAP] |
| item padding | **10px 20px** (상하10·좌우20) | `12px 0` (`--space-6` / 0) | ★ **틀림** — 좌우 20(현 0)·상하 10(현 12) |
| item gap (아이콘/카운트) | **4px** (layout_1I8W8L / OUOKUL gap4) | — | 아이콘+카운트 동반 시 gap4 |
| font | **16 / active 600 · inactive 500 / lh130% / ls-2%** (style_ZGAR2X·21HYDN / L7OPQA) | `18px` (`--text-title-5-size`), weight semibold(active만) | ★ **틀림** — fontSize 16(현 18). active 600·inactive 500 |
| active color (글자) | **#FAFAFA / #FFFFFF** (실측 흰색) | `#66FF4B` (`--color-brand-primary` 네온) | ★★ **틀림(핵심 결함)** — 흰색이 정답 |
| active 밑줄 색 | **#FFFFFF 2px** | `#66FF4B` 2px | ★★ **틀림** — 흰 밑줄 |
| inactive color | **#B4B4B4** (fill_W1YHRT) | `#B4B4B4` (`--color-gray-500`) | ✅ |
| count 텍스트(인사이트 옆 "16") | **16 / 400 / #B4B4B4** (style_402D20, fill_W1YHRT) | (count 슬롯 없음) | [GAP] 구현 underline에 카운트 슬롯 없음 |

> [GAP] item height가 라이브러리 상세=52, 콘텐츠디테일=56으로 **화면별 2px 상이**(둘 다 pad 10/20·font16 동일인데 높이만 다름 → Figma 내 비일관). 디자인 공백. 권장: **52를 정본**(라이브러리가 단일 active 정의 프레임이고, 56은 동일 pad/font에서 4px 더 큰 outlier). 토큰 `--size-tab-underline: 52` + 노트로 56 outlier 기록. 또는 height hug 채택.

> #FFFFFF vs #FAFAFA: 프레임마다 active 글자 fill이 `#FFFFFF`(2557:23067, 2117:20311 밑줄) / `#FAFAFA`(2117:20311 글자 fill_KVB573)로 혼재. **★FD3 결정 = 흰색 #FAFAFA 통일** → underline active 글자·밑줄 모두 **#FAFAFA**(`--color-white`)로 채택.

---

## 변형 3 — `list` (검색 카테고리 세로 텍스트탭) — **신규, 구현 MISSING**

검색 좌측 카테고리 사이드바. **세로 리스트**, 선택은 **색(#FAFAFA)+굵기(Medium)만**으로 표현. 밑줄·border·브랜드그린 **없음**. 출처: 검색 `2557:7615`(전체=selected) · `2557:7617`(면접·자소서) · `2557:7620`(포트폴리오).

### 아이템 래퍼 (`.list .tab`)
node `2557:7615` / layout_L6GVXQ (selected "전체"), `2557:7617` / layout_LWXKSM (unselected)
| 속성 | 실측값 (출처) | 현 구현 | 차이 |
|---|---|---|---|
| layout | row, alignItems center, **gap 10** | MISSING | 신규 |
| width | **197px (fixed)** (layout_L6GVXQ/LWXKSM sizing horizontal fixed, width 197) | — | 사이드바 칼럼 폭. [GAP] 컨테이너 폭 의존 — 토큰화보다 부모 fill 권장 |
| height | **32px (fixed)** | — | `--size-tab-list-item: 32` 후보 (= 기존 `--size-folder-item` 32와 동일값) |
| padding | **6px 0px** (상하6·좌우0) (layout_L6GVXQ) | — | 신규 |
| border / 밑줄 / 인디케이터 | **없음** (border-bottom 없음, 밑줄 없음) | — | ★ underline 변형과 명확히 구분 |

### 라벨 — selected ("전체")
node `2557:7616` / style_O7H1IY, fill_ALCMFH
| 속성 | 실측값 | 현 구현 | 차이 |
|---|---|---|---|
| font | **Pretendard 15 / Medium 500 / lh130% / ls-2.5%** (style_O7H1IY) | MISSING | 신규 |
| color (selected) | **#FAFAFA** (fill_ALCMFH) | — | `--color-text-primary` |

### 라벨 — unselected ("면접·자소서", "포트폴리오")
node `2557:7618` / style_LA60P0 · `2557:7620` / style_1XWYMY
| 속성 | 실측값 | 현 구현 | 차이 |
|---|---|---|---|
| font | **Pretendard 15 / Regular 400 / lh130% / ls-2.5%** (style_LA60P0 / 1XWYMY) | MISSING | 신규 |
| color (unselected) | **#999999** (fill_KAZGVX / fill_44TEQ9) | — | `--color-text-tertiary` |

> ★ selected↔unselected 차이 = **굵기(500↔400) + 색(#FAFAFA↔#999999)만**. fontSize 15 동일, 밑줄/배경 없음. ls는 -2.5%(`--letter-spacing-tight`)로 다른 변형(-2%)과 다름 — 실측 그대로 반영.

---

## 신규 토큰 후보 (정리)

| 토큰명 | 값 | 근거 (출처) | 비고 |
|---|---|---|---|
| `--color-surface-segment` | `#1B1B1B` | 홈 segment 컨테이너 fill_0QSI6H (`2173:124313`) | tokens.css에 #1B1B1B 미등재(surface #171717 ↔ surface-100 #1F1F1F 사이). LOW 감사 line 277·HIGH 90도 동일 요구 |
| `--text-segment-lg-size` | `15px` | 홈 취향관/피드 라벨 Body2 (`I2173:124313;1613:11577`) | segment 대형(1차 내비) 전용. lh160%·ls-2% |
| `--text-tab-underline-size` | `16px` | 상세 underline 탭 (style_ZGAR2X/21HYDN/L7OPQA) | 현 underline은 `--text-title-5`(18) 오용 |
| `--size-tab-underline` | `52px` | 라이브러리 상세 active (`2117:20311` layout_E1N9YO) | 56(콘텐츠디테일) outlier — 노트 기록. 또는 hug |
| `--color-tab-underline-active` | `#FAFAFA` | underline active 글자/밑줄 (FD3 흰색 통일; 실측 #FFFFFF/#FAFAFA) | = `--color-white`(#FAFAFA) 재사용 가능 → 별도 토큰 불필요, 의미 alias만 |
| `--size-tab-list-item` | `32px` | 검색 세로리스트 item (`2557:7615` layout_L6GVXQ) | = 기존 `--size-folder-item`(32)과 동일값 → 재사용 권장 |
| `--text-tab-list-size` | `15px` | 검색 세로리스트 라벨 (style_O7H1IY) | lh130%·ls-2.5% |

> 색 재사용: underline active = `--color-white`(#FAFAFA), inactive = `--color-gray-500`(#B4B4B4), list selected = `--color-text-primary`(#FAFAFA) / unselected = `--color-text-tertiary`(#999999), segment selected bg = `--color-surface-tab-selected`(#363636) — **모두 기존 토큰 재사용 가능**. 신규 색 토큰은 `--color-surface-segment(#1B1B1B)` 1건뿐.

---

## [GAP] 디자인 공백 목록

1. **underline item height 52 vs 56**: 라이브러리 상세=52, 콘텐츠디테일=56 — 동일 pad(10/20)·font(16)인데 높이만 4px 상이(Figma 내 비일관). 정본 52 권장(+56 노트) 또는 hug.
2. **underline active 색 #FFFFFF vs #FAFAFA 혼재**: 프레임별 fill 상이 → FD3(흰색 #FAFAFA 통일)로 해소.
3. **underline 컨테이너 하단 구분선 #2D2D2D 1px**: 감사(line 280)는 #2D2D2D, 토큰 `--color-stroke-200`은 #2E2E2E — 1단계 미세差. 실측 재확인 필요(본 측정 프레임 2557:23067의 트랙 stroke는 active 밑줄 #FFFFFF 2px만 노출, 컨테이너 1px 구분선은 별 프레임). 잠정 `--color-stroke-200`(#2E2E2E) 사용, 노트로 #2D2D2D gap 기록.
4. **segment 두 사이즈(13/15) 분기**: 홈=15(컨테이너 #1B1B1B)·라이브러리/대시보드/상세=13(컨테이너 ghost 0.04). 단일 변형으로 안 됨 → size 분기 필요. 어느 쪽이 "기본"인지는 사용 화면 수 기준 sm(13)이 다수.
5. **segment height 28/36 고정 vs hug**: 15px·160% 라벨(라인박스≈24)+pad8 = 약 32px로, 현 item 28 고정에 안 들어감 → lg는 height hug 또는 32+로 재산정.
6. **아이콘/카운트 슬롯 부재**: segment(아이콘 16×16, gap4)·underline(아이콘 20·24, 카운트 텍스트 16/400 #B4B4B4) 모두 leading/trailing 슬롯이 Figma에 존재하나 구현 `TabItem`은 `label`만 → API 확장 필요(MVP 스코프 판단은 PM).

---

## 현 구현 대비 수정 요약 (frontend 착수용)

`tabs.tsx`: `variant`에 `'list'` 추가, (선택) segment `size?: 'sm'|'lg'`, `TabItem`에 leading/trailing(count) 슬롯(스코프 판단).

`tabs.module.css`:
- `.segment` gap 10 → **4**; bg ghost → **lg는 #1B1B1B(--color-surface-segment)** / sm은 ghost 유지.
- `.segment .tab` padding 8/12 → **4/12/4/10**; (lg) font 13 → **15·lh160%·ls-2%**; height 고정 28 → hug/재산정.
- `.underline` border-bottom 1px #2E2E2E 유지(노트 #2D2D2D); active 색 #66FF4B → **#FAFAFA**(글자+밑줄 2px).
- `.underline .tab` padding 12/0 → **10/20**; font 18 → **16**; active 600·inactive 500.
- **신규 `.list`**: 세로(flex column 권장)·item h32·pad 6/0·gap10; selected #FAFAFA/500 · unselected #999999/400; font 15/lh130%/ls-2.5%; 밑줄·border 없음.

`tokens.css`: `--color-surface-segment:#1B1B1B` 추가. (나머지 신규 토큰 후보는 위 표 — 색은 대부분 기존 재사용.)
