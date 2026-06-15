# u3-clip-webapp — FE 측정표 (Figma MCP 전수 실측)

> 출처: Figma `5GGyKsjXEOpjKMLtUodeSs` · 페이지 "프로토타이핑" 2087:5987 하위.
> 대상 5프레임: Step1 링크모달 `2087:32073` · Step2 편집모달 `2087:33548` · 태그입력활성 `2087:35127` · 태그자동완성 `2087:36708` · 칩갱신 `2384:141451`.
> 모든 픽셀값·HEX는 globalVars 토큰 실측값(추측 0). u0c 매핑 = `apps/web/src/shared/ui/*` 실제 prop 시그니처 대조.
> ★ 컴포넌트는 발명 금지 — u0c 토큰/프리미티브만. 없으면 토큰 먼저 추가(하드코딩 HEX 금지).

---

## 0. 공통 모달 셸 (두 모달 공통)

| 항목 | 실측값 | u0c 매핑 / 비고 |
|---|---|---|
| 백드롭 | `position:fixed inset:0`, bg **rgba(0,0,0,0.6)** (fill_S0J4DQ/fill_F1DS2Y) | `Modal` `.backdrop` = `--color-overlay-black-60` ✔ 일치 |
| 패널 bg | **#1F1F1F** (fill_PR6NEC/fill_JUQT6T) | `Modal` `.panel` = `--color-surface-modal` ✔ |
| 패널 radius | **12px** | `--radius-lg` ✔ |
| 패널 그림자(effects "모달") | `0px 20px 48px -8px rgba(17,17,17,.24), 0px 4px 12px -1px rgba(0,0,0,.12), 0px 0px 0px 1px rgba(84,72,49,.1)` | `--shadow-modal` ✔ (3레이어·hairline 포함) |
| 헤더 닫기 아이콘 | IMAGE-SVG componentId **1230:5853** (Dismiss/Size=20), 20×20 | `Modal` `.close` 슬롯 (onClose) — Dismiss 20px 아이콘 주입 |
| 헤더 보더 | 하단 1px **rgba(255,255,255,0.08)** (fill_9QU4LJ/fill_68VWFG), radius 12 12 0 0 | `Modal` 헤더 (foundation hairline) |

> ⚠ Figma 모달 내부는 **절대배치**(auto-layout 아님). `Modal` 프리미티브는 표준 inset(28 좌/24 우) 컴포넌트화. Step2 좌측 영상/타임라인은 절대좌표를 그대로 따라 배치(아래 §3).

---

## 1. Step1 — 링크 입력 모달 `2087:32073` (modal node `모달_검색` 2087:33536)

전체 패널 **582×364** (layout_T8PXPC, x=669 y=366 = 1920뷰 중앙).

### 1.1 영역 목록 (위→아래)
| # | 영역 | node | 레이아웃(실측) | 텍스트/내용 |
|---|---|---|---|---|
| H | 헤더 "새 클립 추가" | 2087:33543 | row space-between, padding **24 24 24 28**, 582×66, 하단보더 1px rgba(255,255,255,.08) | 타이틀 + 닫기(20px) |
| H-t | 타이틀 | 2087:33544 | — | "새 클립 추가" · **Bold 20 / lh130 / ls-2%** (style_0LQRIR) · #FAFAFA |
| H-x | 닫기 | 2087:33545 | 20×20 | componentId 1230:5853 |
| L | 라벨블록 | 2087:33538 | column gap **4**, x=28 y=90, w=313 | |
| L-1 | "링크 붙여넣기" | 2087:33539 | fill | **SemiBold 15 / lh130 / ls-2%** (style_R4B12L) · #FAFAFA |
| L-2 | 헬퍼 | 2087:33540 | hug | "YouTube 등 컨텐츠를 불러올 웹사이트의 링크를 입력해 주세요." · **Regular 13 / lh130 / ls-2%** (style_FH8HBP) · **#B4B4B4** |
| I | URL 입력 박스 | 2087:33541 | column gap10, padding **14**, x=28 y=142, w=**530**, border **1px #363636**, radius **6** | 멀티라인 textarea |
| I-t | (placeholder/값) | 2087:33542 | fill | Cap1_Rg (Regular 13) · 값 색 #FAFAFA |
| B | [다음] 버튼 | 2087:33546 | row center, gap6, padding **10 18**, x=402 y=294, **156×38**, bg **#66FF4B**, radius **6** | |
| B-t | "다음" | 2087:33547 | — | **SemiBold 14 / lh130** (T2_Sb) · 라벨 **#121212** |

### 1.2 u0c 매핑
| 영역 | u0c 컴포넌트 | props |
|---|---|---|
| 패널/백드롭/헤더/닫기 | **`Modal`** | `open` · `onClose` · `title="새 클립 추가"` · `width={582}` (기본값=582) |
| 라벨 "링크 붙여넣기" | (텍스트) | 토큰 `--text-*` 15/SemiBold — Modal body 내 라벨 |
| 헬퍼 텍스트 | (텍스트) | 13/Regular · `--color-text-tertiary`(#B4B4B4) |
| URL 입력 | **`Textarea`** | `mode="link"` (★ 정확히 이 케이스용 — 13px/pad14 hug 2087:33541), `invalid` (잘못된 URL 상태), `placeholder` |
| [다음] | **`Button`** | `variant="lightSolid"`(#66FF4B/#121212 라벨), `size="md"`(34px) — ⚠치수 검증 아래 |

> ⚠ **[다음] 버튼 치수 불일치 후보**: 프레임 버튼은 **38px 높이**(`버튼_38px_Short`, padding 10 18, 156×38). u0c `Button size="md"`는 34px(spec 카디널룰 "34px md"). → **38px short 변형 필요 여부 확인**. 버튼명이 `버튼_38px_Short`이고 padding 10×18(=lh20+pad20≈40 hug). **디자인 공백/충돌 → §6 보고.** 잠정: `lightSolid` 색 토큰은 일치, 높이만 38 vs 34.

---

## 2. Step2 — 편집 모달 `2087:33548` (modal node `모달_검색` 2087:35011) — 우측 패널

전체 패널 **998×702** (layout_N7VQIC, x=461 y=197). 좌(영상·타임라인) + 우(인사이트·공개·폴더·태그) 2단.

### 2.0 헤더 (998 풀폭)
| 영역 | node | 레이아웃 | 내용 |
|---|---|---|---|
| 헤더 | 2087:35078 | row space-between, padding **20 24 20 28**, w=998, 하단보더 1px rgba(255,255,255,.08), radius 12 12 0 0 | 좌(썸네일+타이틀) + 닫기 |
| 썸네일 | 2087:35080 | 44×44 | 채널 아바타(IMAGE-SVG) |
| 타이틀블록 | 2087:35090 | column gap4, w=347 | |
| · "컨텐츠 추가" | 2087:35091 | — | **Bold 20 / lh130** (style_4ENZSP) · #FAFAFA |
| · 영상 제목 | 2087:35092 | hug | "최선을 다했지만…\| 스탠포드 돌돌콩" · **Regular 13** (style_4MFONU) · #CECECE |
| 닫기 | 2087:35093 | 20×20 | componentId 1230:5853 |

### 2.1 우측 — 인사이트 (메모) `Row 7` 2087:35013 (x=461 y=111, w=499)
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 라벨 "인사이트" | 247×16, **Medium 14 / lh130** (style_PDSMT8) · #FAFAFA | (라벨 텍스트) |
| 콜아웃 textarea | 2087:35015 — row, padding **10 12**, **509×174**, border **1px #363636**, radius **6** | **`Textarea`** `mode="lg"`(h≥64) — 단 실측 h174 고정. body 텍스트 **B1_Rg(Regular 14 / lh160)** · #FAFAFA |
| 메모 본문(샘플) | "성공 사례보다 실패를 견디는 회복 탄력성…" 475×154 | (사용자 입력값) |
| ★ AI 요약 자리 | **프레임엔 '인사이트' 라벨만 존재** (AI 표기 없음) | spec대로 사용자 직접 메모. 추가 제거 작업 불필요 — 이미 순수 메모 입력 |

> wrap row gap **10 12** — 라벨과 입력이 세로 누적되는 wrap 컨테이너(layout_1W44RB).

### 2.2 우측 — 공개 범위 설정 (2087:35024~35030)
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 행 | row space-between, fill | (라벨블록 + 토글) |
| 라벨 "공개 범위 설정" | **Medium 14 / lh130** (style_MCU5X6) · #FAFAFA, 블록 w=194 gap5 | (텍스트) |
| 설명 "해당 컨텐츠의 공개 여부를 설정합니다." | **Regular 14 / lh130** (T2_Rg) · **#B4B4B4** (fill_EAULWQ) | (텍스트) |
| 토글(ON) | track **44×22** radius 1000(pill), padding **2 2 2 8**, bg **#2563EB**(Light-Primary); knob **18×18** #FAFAFA, stroke 0.5px rgba(0,0,0,.24), 그림자 2레이어 | **`Toggle`** `checked` · `onCheckedChange` — ✔ CSS가 바로 이 노드(2087:35027~30)에서 측정됨. 100% 일치 |

### 2.3 우측 — 저장 폴더 `Row 6` 2087:35043 (w=499)
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 라벨 "저장 폴더" | Medium 14 (style_PDSMT8) · #FAFAFA | (텍스트) |
| 셀렉트 박스 | 2087:35045 — column center, padding **12 10 12 14**, **509×38**, border **1px rgba(255,255,255,.08)**, radius **6** | **`Dropdown`** trigger=셀렉트박스 |
| 현재값 "창업가 정신" | row space-between fill, **Medium 14**(style_MCU5X6) · #FAFAFA | `value`/현재 라벨 |
| 화살표(▾) | 2087:35048 IMAGE-SVG 18×18 (layout_KD7ACE) | trigger trailing |
| 드롭다운 메뉴(열림) | **프레임에 닫힘 상태만** | `Dropdown` `items`(folders) — 열림/빈 상태는 u0c dropdown으로 채움(§6) |

### 2.4 우측 — 태그 `Row 8` 2087:35052 (w=499) [기본 상태]
컨테이너 2087:35054 = row gap **8** hug (layout_GH6CFI). 칩 나열.
| 칩 | node | 실측 | u0c 매핑 |
|---|---|---|---|
| [추가] 칩 | 2384:141372 (INSTANCE, componentId **2384:141363**) | row center, gap10, padding **6 10 6 8**, **h28**, bg **#242424**, border **1px rgba(255,255,255,.08)**, radius **6** | **`Chip` variant="add"** |
| · "+" 아이콘 | I…;2384:141333 | 16×16, componentId 1579:7082 | `Chip` leadingIcon(16) |
| · "추가" | I…;2384:141334 | **Cap1_Md(Medium 13 / lh130)** · #FAFAFA | add 라벨 |
| 태그칩 ×3 | 2087:35059/35064/35069 | row center, gap **2**, padding **10 8 10 10**, **h28**, bg **rgba(255,255,255,.06)**(fill_EHTBVO), radius **6** | **`Chip` variant="tag" removable** |
| · 라벨 | "업무생산성"/"창업"/"마인드셋" | **style_SJT7BX(Regular 13 / lh160)** · **#CECECE**(fill_I0M3EO) | tag 라벨 (ceceTone) |
| · [취소] x | …61/66/71 | 16×16 IMAGE-SVG | `Chip` removeIcon(16) + `onRemove` |

### 2.5 [완료] 버튼 2087:35094
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 버튼 | `버튼_38px_Short`, row center gap6, padding **75 18**(⚠X=18·Y=75는 절대배치 잔여—실효 **156×38**), x=814 y=632, **156×38**, bg **#66FF4B**, radius **6** | **`Button` variant="lightSolid"** size=md(높이 38 검증·§6) |
| "완료" | 2087:35095 | **T2_Sb(SemiBold 14 / lh130)** · **#121212** | 라벨 |

---

## 3. Step2 좌측 — 영상 플레이어 + 트림 타임라인 (절대배치, modal-relative 좌표)

> 모두 모달(998×702) 기준 절대좌표. **auto-layout 아님** → 좌표 그대로 배치.

| # | 영역 | node | 좌표(x,y) | 치수 | 색/스타일 |
|---|---|---|---|---|---|
| V | 영상 프리뷰 | 2087:35096 (TEST 1) | 28, 111 | **405×228** (16:9) | IMAGE FILL, radius **8** → **YouTube iframe** 자리 |
| TL-bg | 타임라인 트랙(썸네일 스트립) | 2087:35097 | 28, 353 | 405×52 | IMAGE FILL, 하단보더 1px #434343 |
| TL-sel | 선택구간 스트립(밝은) | 2087:35098 | 28, 353 | **187×52** | IMAGE STRETCH (선택 영역만 강조) |
| 눈금선 ×4 | 2087:35099~35102 | x=28/159/290/402, y=403~405 | 1×30 / 1×28 | rgba(255,255,255,.16)(fill_QWC4BY) |
| 눈금 라벨 "0:32" | 2087:35074 | 33, 415 | 24×16 | **Regular 12**(style_MD15TX) · #FAFAFA |
| 눈금 라벨 "0:52" | 2087:35075 | 164, 415 | 24×16 | Regular 12 · #FAFAFA |
| 눈금 라벨 "1:12" | 2087:35076 | 295, 415 | 20×16 | Regular 12 · **#B4B4B4** |
| 눈금 라벨 "1:32" | 2087:35077 | 407, 415 | 23×16 | Regular 12 · #B4B4B4 |
| TR | 트림 핸들 그룹 | 2087:35119 (Group) | 28, 349 | **187×60** | 선택구간 오버레이 |
| · 좌핸들 | 2087:35122 | 0, 0 | **14×60**, padding 8 3 | bg **#7FC573**(fill_ZWETUE), radius 0 4 4 0; 내부 grip 2×24 #FAFAFA radius100 |
| · 우핸들 | 2087:35120 | 173, 0 | **14×60**, padding 8 3 | bg #7FC573, radius 0 4 4 0; grip 2×24 #FAFAFA |
| · 상단 테두리바 | 2087:35124 | 8, 0 | 171×4 | #7FC573 |
| · 하단 테두리바 | 2087:35125 | 8, 56 | 171×4 | #7FC573 |
| PH | 재생헤드 | 2087:35126 | 59, 353 | **3×52** | bg **#BE1616**(fill_J7AZJG), radius 100 |
| CTL | 구간 컨트롤 행 | 2087:35103 | 28, 453 | row gap16, w=405 | 시작칩 / 화살표 / 끝칩 / 길이 |
| · 시작칩 "0:32" | 2087:35105 | — | 82×38, padding 10 26, border 1px rgba(255,255,255,.08), radius **4** | **Regular 14**(style_VRA8WR) · #FAFAFA |
| · 화살표 → | 2087:35107 | — | 8×0 stroke rgba(255,255,255,.16) | 구분선 |
| · 끝칩 "1:01" | 2087:35108 | — | 82×38, 동일 | Regular 14 · #FAFAFA |
| · 길이 "29초" | 2087:35110/35118 | — | row gap2 (아이콘+텍스트) | Regular 14 · #FAFAFA |

> 트림 의미: `[start=0:32(32s), end=1:01(61s))` → 길이 **29초**(spec L1-b 끝배타 일치, 61−32=29). 핸들 좌=start, 우=end.
> u0c 매핑: 트림 타임라인은 **신규 feature(`clip-trim`)** — u0c에 트랙/핸들 프리미티브 없음 → **토큰만으로 구현**(#7FC573·#BE1616·rgba(255,255,255,.16)·grip #FAFAFA). 시작/끝칩은 작은 보더박스(토큰: border rgba(255,255,255,.08)·radius4). **새 shared/ui 발명 ❌, feature 내부 마크업+토큰**.

---

## 4. 태그 상태 3프레임 (Row 8 영역만 변화 — 나머지 동일)

### 4.1 태그 입력 활성 `2087:35127` (node 2384:141378, componentId **2384:141362**)
[추가] 칩이 **입력 필드로 확장**.
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 입력칩 | row center, gap10, padding **6 10 6 8**, **193×28**, bg **#242424**, border 1px rgba(255,255,255,.08), radius **6** | `Chip variant="add"` → **입력 모드** (feature 상태로 `Input` 인라인 또는 확장 칩) |
| "+" 아이콘 | 16×16, componentId 1579:7082 | 유지 |
| 캐럿 | Rectangle 34719, **1.25×16**, **#FAFAFA** | 텍스트 캐럿(인라인 input 자연 캐럿으로 대체 가능) |
| placeholder | "입력 후 Enter로 추가해 보세요." · **Cap1_Rg(Regular 13 / lh130)** · **#999999**(fill_5DIY8N) | input placeholder |
| 기존 칩 3개 | 그대로 유지(업무생산성/창업/마인드셋) | 변화 없음 |

### 4.2 태그 자동완성 `2087:36708` (node 2384:141427, componentId **2384:141361**)
입력("개발") + **드롭다운 추천 3건**.
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 입력칩 컨테이너 | column gap **4**, w=193 (입력 + 드롭다운 세로 스택) | feature 컴포지션 |
| · 입력칩 | row center, gap10, padding 6 10 6 8, **193×28**, bg #242424, border 1px rgba(255,255,255,.08), radius 6 | 입력 상태 |
| · 입력값 "개발" | Cap1_Rg(13) · #FAFAFA + 캐럿 1.25×16 #FAFAFA | input value |
| 드롭다운 패널 | 2384:141352, column, padding **4**, w=193, bg **rgba(255,255,255,.04)**(fill_J6ZKNI), border 1px rgba(255,255,255,.08), radius **6**, 그림자 **Dropdown-100**(`0 0 8 0 rgba(0,0,0,.07)`) | `Dropdown` 스타일 차용 또는 feature 자동완성 패널 (토큰) |
| 추천 행 | row gap3, padding **2 6**, **h28**, fill | 각 추천 |
| · 1행 "개발자"(선택/호버) | bg **rgba(255,255,255,.06)**(fill_X49SVO), radius4 | 하이라이트 행 |
| · 2/3행 "클라우드 개발"/"백엔드 개발" | bg 없음, radius3 | 일반 행 |
| ★ 하이라이트 규칙 | base 텍스트 #FAFAFA(Cap1_Rg), **ts2 span = #999999**(dim). 매칭 쿼리부는 **#FAFAFA 유지**, 비매칭부는 **#999999로 디밍**. 예: "개발자" = `개발`(흰)+`자`(회), "클라우드 개발" = `클라우드 `(회)+`개발`(흰) | feature: 부분 강조 = 매칭=#FAFAFA / 비매칭=#999999. **밑줄/볼드/색상강조 아님 — 비매칭 디밍** |

> ★중요: spec [fidelity] "자동완성 하이라이트"의 정확한 의미 = **매칭 부분을 흰색 유지 + 나머지를 회색(#999999)으로 약화**. (네온 강조 아님.)

### 4.3 칩 갱신 `2384:141451` (node 2384:142957)
추천 선택 후 → 입력칩 **[추가] 칩으로 복귀** + 새 칩 **앞쪽에 삽입**.
| 항목 | 실측값 | u0c 매핑 |
|---|---|---|
| 컨테이너 | row gap **8** hug (layout_TUH7XS) | tag 영역 |
| [추가] 칩 | 2384:143085 (componentId **2384:141363** = 기본 add칩 복귀), padding 6 10 6 8, h28, bg #242424, border 1px rgba(255,255,255,.08), radius6 | `Chip variant="add"` (기본 복귀) |
| **새 칩 "개발자"** | 2384:142959, padding **10 8 10 10**, h28, bg **rgba(255,255,255,.06)**, radius6, 라벨 Regular13/lh160 · **#CECECE** | `Chip variant="tag" removable` + onRemove |
| 기존 칩 | 업무생산성/창업/마인드셋 (동일 tag 칩) | 변화 없음 |
| **삽입 순서** | **[추가] → 개발자(신규) → 업무생산성 → 창업 → 마인드셋** | 신규 칩은 [추가] 칩 **바로 뒤**(기존 칩들 앞)에 삽입 |

---

## 5. u0c 컴포넌트 매핑 요약 (전 영역)

| u0c 컴포넌트 | 사용처 | 핵심 props | 충실도 |
|---|---|---|---|
| **`Modal`** | Step1(582)·Step2(998) 셸 | `open·onClose·title·width` (582 / 998) | ✔ bg/radius/그림자/백드롭 측정 일치 |
| **`Textarea`** | Step1 URL입력(`mode="link"`)·Step2 인사이트 메모(`mode="lg"`) | `mode·invalid·placeholder` | ✔ `mode="link"`가 정확히 2087:33541용으로 존재 |
| **`Button`** | [다음]·[완료] | `variant="lightSolid"` (#66FF4B/#121212) | ⚠ **높이 38 vs md 34** — §6 |
| **`Toggle`** | 공개 범위 | `checked·onCheckedChange` | ✔ 본 노드(2087:35027~30)에서 측정 — 100% |
| **`Dropdown`** | 저장 폴더 셀렉트 | `trigger·items·value·onSelect` | ✔ 닫힘=trigger / 열림·빈상태=u0c |
| **`Chip` variant="add"** | [추가] 칩 / 입력모드 | `variant="add"·leadingIcon(16)` | ✔ #242424/border/radius6 일치 |
| **`Chip` variant="tag" removable** | 태그칩(업무생산성 등·신규) | `variant="tag"·removable·removeIcon·onRemove·ceceTone` | ✔ rgba(255,255,255,.06)/#CECECE/radius6/h28 일치 |
| **(토큰만, 신규 feature)** | 트림 타임라인·핸들·재생헤드·시작/끝칩·자동완성패널·하이라이트 | — | u0c 프리미티브 없음 → 토큰으로 구현(발명❌) |

### 신규 토큰 필요 후보 (하드코딩 금지 → tokens.css 먼저 추가 확인)
- 트림 선택바/핸들 **#7FC573** · 재생헤드 **#BE1616** · 눈금선 **rgba(255,255,255,.16)** · 자동완성 패널 bg **rgba(255,255,255,.04)** + 그림자 Dropdown-100 **0 0 8 0 rgba(0,0,0,.07)** · 자동완성 비매칭 디밍 **#999999** · placeholder **#999999** · 시작/끝칩 보더 rgba(255,255,255,.08)·radius4.
- (대부분 기존 토큰 재사용 가능 추정 — tokens.css 실재 여부는 구현 단계에서 grep 후 없으면 추가.)

---

## 6. 데이터 의존 (RPC / 필드) — u0b 계약 (read-only, 호출만)

> 정본: `supabase/migrations/0009_ingest.sql`(ingest_clip)·0006(get_or_create_content/extract_video_ref)·0003(folders·tags)·0004(clips·clip_tags). **변경 ❌**.

### 6.1 쓰기 — `supabase.rpc('ingest_clip', {...})` (단일 호출, [완료] 시)
인자(0009 시그니처 정확순):
| 인자 | 타입 | FE 소스 | 비고 |
|---|---|---|---|
| `p_url` | text | Step1 URL textarea | extract_video_ref가 정준화(YouTube watch/youtu.be/shorts/mobile). 미지원 → **errcode 22023** |
| `p_start_sec` | integer | 트림 좌핸들(초 정수) | start≥0 필수 |
| `p_end_sec` | integer | 트림 우핸들(초 정수) | end>start 필수, 위반 시 **22023** "invalid interval" |
| `p_memo` | text(null) | 인사이트 textarea | 재클립 시 RPC가 메모 병합(중복 substring 무시 / 줄바꿈 append) |
| `p_is_public` | boolean(false) | 공개 토글 | 재클립 시 OR 병합 |
| `p_folder_id` | uuid(null) | 저장 폴더 드롭다운 선택 id | 재클립 시 coalesce(신규, 기존) |
| `p_tags` | text[](null) | 태그칩 라벨 배열 | RPC가 btrim·빈문자 skip·per-user get-or-create·중복 nothing |
| `p_title` `p_channel` `p_duration_sec` `p_thumbnail_url` | text/int(null) | 영상 메타 fetch 결과(없으면 null 허용) | dedup은 url 기준이라 메타 null 무방 |

반환: `public.clips` 1행. 동작: content dedup(url) → clips upsert(`on conflict (user_id,content_id,start_sec,end_sec)` → 메모/공개/폴더 병합) → tags get-or-create + clip_tags 부착.
에러코드 매핑(FE→토스트/인풋):
| errcode | 의미 | FE 처리 |
|---|---|---|
| `22023` | unsupported url / invalid interval | URL 인풋 에러 텍스트 or [완료] 차단+피드백 |
| `28000` | unauthenticated | 로그인 유도(진입 차단) |
| `23514` | folder limit (max 20) — *폴더 생성 시* | 이 단위는 폴더 **선택만**(생성=u7) → 해당 없음/안내만 |

### 6.2 읽기 (select, 본인 RLS)
| 목적 | 쿼리 | 테이블/필드 | 상태 |
|---|---|---|---|
| 폴더 목록(드롭다운) | `select id, name from folders where user_id=auth.uid()` | folders(0003) max20 | 0개 → "폴더 없음" 빈상태(§5) |
| 태그 자동완성 | `select name from tags where user_id=auth.uid() and lower(name) like lower($1)||'%'` | tags(0003) per-user, `tags_user_lower_name_uq` | 0건 → 빈 드롭다운(그대로 Enter=신규생성) |

> ⚠ shared/api는 현재 **빈 폴더**(`apps/web/src/shared/api` 비어있음) → supabase 클라이언트 + `ingest_clip` 래퍼 **신규 작성**(Boundaries 허용 영역).

---

## 7. 디자인 공백 (프레임 부재 → u0c 파운데이션으로 채움 · 추측 금지)

| 공백 | 프레임 상태 | 채움 방안(u0c) |
|---|---|---|
| [다음] 버튼 **높이 38 vs u0c md 34** | 프레임=`버튼_38px_Short` 38px | **확인 필요**: lightSolid 색은 일치, 높이만 상이. 38px short 변형 추가 or 38 높이 적용. → **PM 게이트 판단** |
| URL 검증/실패 텍스트 | 없음 | `Textarea invalid` + 에러 텍스트(토큰 에러색) |
| [다음] 후 메타 fetch 로딩 | 없음 | 스켈레톤/스피너(u0) + [다음] 로딩 |
| [완료] RPC 로딩/중복제출 | 없음 | `Button` 로딩 상태·disabled |
| 완료 토스트 / 실패 토스트 | 없음 | **`Toast`** variant=success / error |
| 폴더 드롭다운 **열림** 상태 | 닫힘만 | `Dropdown` 열림 메뉴(u0c 스타일) |
| 폴더 **0개** 빈상태 | 없음 | dropdown "폴더 없음/새 폴더" 안내 |
| 트림 **0길이/start≥end** 차단 | 없음 | [완료] 차단 + 피드백(토큰 에러) |
| 자동완성 **0건** 빈상태 | 없음 | 빈 드롭다운(추천 없음 → 그대로 Enter 신규생성) |
| 빈 영상(메타 fetch 실패) | 없음 | 제목/길이 null 허용해 진행(iframe만 로드) |
| 미인증 진입 | 없음 | 로그인 유도(진입 차단) |

---

## 8. 진입점 (홈 [컨텐츠 추가] → Step1)

- 현재 트리거: `apps/web/src/widgets/sidebar/ui/sidebar.tsx` L95 "컨텐츠 추가" CTA (`Button` md + neonLabel) + sidebar prop "CTA 클릭"(L49 onClick).
- ⚠ **앱은 아직 라우팅/홈 페이지 미구현** (pages/ 비어있음, `app/app.tsx`만). [컨텐츠 추가] 클릭 → Step1 모달 오픈 배선 필요(Boundaries: "홈 [컨텐츠 추가] 트리거 배선 — widgets/sidebar 또는 pages/home 진입점만").
- ui-preview에 `Modal title="콘텐츠 추가"` 데모 존재(app/ui-preview L569) — 실 모달은 신규 pages/features로 구현.

---

## 부록: 텍스트 스타일 토큰 (실측)
| 스타일 | family/weight/size/lh/ls | 용도 |
|---|---|---|
| style_0LQRIR / style_4ENZSP | Pretendard Bold 20 / 130% / -2% | 모달 타이틀 |
| style_R4B12L | Pretendard SemiBold 15 / 130% / -2% | "링크 붙여넣기" |
| style_PDSMT8 | Pretendard Medium 14 / 130% / -2% (vCenter) | 섹션 라벨(인사이트/저장폴더/태그) |
| style_MCU5X6 | Pretendard Medium 14 / 130% / -2% | 공개라벨·폴더현재값 |
| T2_Sb | Pretendard SemiBold 14 / 130% / -2% | 버튼 라벨(다음/완료) |
| T2_Rg | Pretendard Regular 14 / 130% / -2% | 공개 설명 |
| B1_Rg | Pretendard Regular 14 / 160% / -2% | 메모 본문 |
| style_VRA8WR | Pretendard Regular 14 / 130% / -2% | 시작/끝칩·길이 |
| style_FH8HBP | Pretendard Regular 13 / 130% / -2% | Step1 헬퍼 |
| style_4MFONU | Pretendard Regular 13 / 130% / -2% | 헤더 영상 제목 |
| Cap1_Md | Pretendard Medium 13 / 130% / -2% | [추가] 칩 라벨 |
| Cap1_Rg | Pretendard Regular 13 / 130% / -2% | URL 값·placeholder·자동완성·입력값 |
| style_SJT7BX / style_RH8T7M | Pretendard Regular 13 / 160% / -2% | 태그칩 라벨 |
| style_MD15TX | Pretendard Regular 12 / 130% / -2% | 타임라인 눈금 라벨 |

## 부록: 색 토큰 (실측)
| HEX/rgba | 용도 |
|---|---|
| #1F1F1F | 모달 패널 bg |
| #FAFAFA | 기본 텍스트/메모/캐럿/grip |
| #B4B4B4 | 헬퍼·설명·먼 눈금 라벨 |
| #CECECE | 태그칩 라벨·헤더 영상제목 |
| #999999 | placeholder·자동완성 비매칭 디밍 |
| #777777 | (fill_5W3YO9, 보조 — 자동완성 프레임 잔여) |
| #363636 | URL입력/메모 보더 |
| rgba(255,255,255,.08) | 헤더 하단보더·셀렉트/시작끝칩/add칩 보더 |
| rgba(255,255,255,.06) | 태그칩 bg·자동완성 선택행 bg |
| rgba(255,255,255,.04) | 자동완성 패널 bg |
| rgba(255,255,255,.16) | 타임라인 눈금선 |
| #242424 | [추가]/입력 칩 bg |
| #66FF4B | [다음]/[완료] 버튼 bg (lightSolid) |
| #121212 | 버튼 라벨 |
| #2563EB | 공개 토글 ON (Light-Primary) |
| #7FC573 | 트림 선택바/핸들 |
| #BE1616 | 재생헤드 |
| #434343 | 타임라인 하단 보더 |
| rgba(0,0,0,.6) | 백드롭 |
| rgba(0,0,0,.24) | 토글 knob 보더 |
