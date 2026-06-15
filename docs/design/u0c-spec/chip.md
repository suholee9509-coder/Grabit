# u0c 정밀 구현 값표 — Chip

> SoT: Figma file `5GGyKsjXEOpjKMLtUodeSs` · 페이지 "프로토타이핑" 2087:5987 하위 실화면 프레임 전수 실측.
> 카디널 룰: 모든 값은 MCP `get_figma_data` 픽셀 실측. 추측 ❌.
> 현재 구현: `apps/web/src/shared/ui/chip/{chip.tsx,chip.module.css}` + `apps/web/src/app/styles/tokens.css`.
> 측정일 2026-06-15. 측정 변형/사이즈 = **9종** (아래 §1~§9).

---

## 측정 요약 (구현 vs 실측)

현재 구현 chip은 `default`(h42·투명·보더.12·15/600·radius6) + `recommend`(h32·pill·.04/.08·14/500) **2변형**뿐.
실화면에는 **9개의 칩 폼팩터**가 존재하며, 그중 default(온보딩)·recommend는 별도 측정 단위.
이 문서가 다루는 9종은 **모두 신규/수정 대상**이며 현 구현과 1개도 1:1 매칭되지 않는다.

핵심 발견:
- **selected 채움색 실측 확정**: 홈 필터칩·라이브러리 출처필터 선택 = **bg #FAFAFA + 글자 #111111** (구현은 "미측정 gap"으로 브랜드 보더만 → 불일치).
- 칩 글자 회색이 **#CECECE**(토큰 미보유)와 **#B4B4B4**(=`--color-gray-500`) 두 가지로 갈림. removable 태그칩·홈 카드태그 = #CECECE, 라이브러리/대시보드/상세 카드태그 = #B4B4B4.
- **출처 필터칩이 화면별로 radius가 다름**: 검색 = radius **100(pill)**, 라이브러리 = radius **6** + bg가 더 진함(.06 vs .04). 같은 "출처필터"여도 화면별 변형.
- 트레일링 슬롯 2종: **카운트(숫자)**(출처필터) / **취소(x) 16px**(removable 태그칩). 현 chip엔 둘 다 없음.

---

## §1. filter-chip / selected (홈 카테고리 필터 — 선택)
- 출처: `home 2087:71871` (text 2087:71872 fill_BVCVYE). 동형: `library 2117:23699`(카운트 포함).
- 실측: height **30** · padding **10px 12px** · gap 10 · radius **6** · sizing H=hug V=fixed
- bg **#FAFAFA** (`fill_MNXZZQ`)
- 글자 **#111111** (`fill_BVCVYE`) · Pretendard **SemiBold 600 / 14px / lh 160% / ls -2%** (`style_UE8GKH`)
- 신규 토큰 후보: `--color-chip-selected-bg: #FAFAFA`(=`--color-white` 재사용 가능) · `--color-chip-selected-text: #111111` **[신규 색, 토큰 미보유]** · `--size-chip-filter: 30px` **[신규 h30]**
- 현 구현 차이: 구현 `.selected`는 채움 없음(브랜드 보더 #66FF4B만) → **불일치**. h30 사이즈 부재(chip=42/recommend=32). text 14/600(구현 default 15/600).

## §2. filter-chip / unselected (홈 카테고리 필터 — 비선택)
- 출처: `home 2087:71873` (text 2087:71874 fill_7OEF68).
- 실측: height **30** · padding **10px 12px** · gap 10 · radius **6**
- bg **rgba(255,255,255,0.06)** (`fill_17GXTE`) = `--color-surface-hover`
- 글자 **#B4B4B4** (`fill_7OEF68`) = `--color-gray-500` · Pretendard **Regular 400 / 14px / lh 160% / ls -2%** (`style_DTS6Y8`)
- 신규 토큰 후보: `--size-chip-filter: 30px` (§1과 공유)
- 현 구현 차이: 구현 chip default = 투명 bg + 보더 .12 + 15/600. 비선택 필터칩은 **채움형(.06)·보더없음·14/400** → 전혀 다름. h30 부재.
- [GAP] 비선택 hover/disabled 상태 정적 export 없음 → 디자인 공백. ghost hover(.04→.06 한 단계)로 일관 채움 권장.

## §3. filter-chip / selected + count (라이브러리 출처필터 — 선택)
- 출처: `library 2117:23699` (label 2117:23700 fill_N7NWE9 / count 2117:23701 fill_MUTNQG).
- 실측: height **32** · padding **10px 12px** · gap **4** (label↔count) · radius **6** · `layout_0UC7QL`
- bg **#FAFAFA** (`fill_OGDG10`)
- 라벨 **#111111** (`fill_N7NWE9`) · SemiBold **600 / 14 / lh160% / -2%** (`style_8S0M2P`)
- 카운트 "32" **#505050** (`fill_MUTNQG`) · Regular **400 / 14 / lh130% / -2%** (`style_8PHFPI`)
- 신규 토큰 후보: `--color-chip-count-selected: #505050` **[신규 색, 토큰 미보유]** · `--size-chip-source: 32px`
- 현 구현 차이: 구현 selected 채움 미정(브랜드 보더). 카운트 트레일링 슬롯 부재. h32지만 radius=6(구현 recommend=pill100).

## §4. filter-chip / unselected + count (라이브러리 출처필터 — 비선택)
- 출처: `library 2117:23702` (label 2117:23711 fill_Z9TOX8 / count 2117:23712 fill_VO5LNX / icon 2117:23704 20px).
- 실측: height **32** · padding **10px 12px 10px 10px** · outer gap **4** · radius **6** · `layout_RPJL52`
- bg **rgba(255,255,255,0.06)** (`fill_0IJQT4`) = `--color-surface-hover`
- border **rgba(255,255,255,0.08)** 1px (`fill_MCPBT4`) = `--color-border-subtle`
- 내부 블록(아이콘+라벨) gap **6** (`layout_KHY625`) · 플랫폼 아이콘 **20×20** (`layout_79CO42`, YouTube glyph #ED1D24/#FFFFFF)
- 라벨 "Youtube" **#FAFAFA** (`fill_Z9TOX8`) · Medium **500 / 14 / lh130% / -2%** (`style_6LAS15`)
- 카운트 "16" **#B4B4B4** (`fill_VO5LNX`) · Regular **400 / 14 / lh130% / -2%** (`style_WRMWQ8`)
- 신규 토큰 후보: `--size-chip-source: 32px` (§3 공유) · 카운트색 = `--color-gray-500`(기존)
- 현 구현 차이: 카운트 트레일링·플랫폼 아이콘(20px) 슬롯 부재. radius **6**(구현 recommend=pill). bg **.06**(구현 recommend=.04). 즉 라이브러리 출처필터 = recommend와 별개(radius·bg 둘 다 다름).
- ⚠ 감사 노트(line 184)의 "bg .04"는 검색 출처필터(§7) 값. 라이브러리는 **.06**으로 실측 정정.

## §5. filter-chip / selected (검색 출처필터 — 선택)
- [GAP] 검색 출처필터 6개(`2087:38908·38919·38926·38933·38939·38946`) 프레임은 **전부 비선택** → 검색 화면 selected 채움 정적 export 없음.
- §1/§3 동형 패턴(흰 채움 #FAFAFA + #111111 라벨)을 pill(radius100)로 적용 권장. 디자인 공백.

## §6. source-chip / pill + icon + count (검색 출처필터 — 비선택, YouTube)
- 출처: `search 2087:38908` (label 2087:38917 fill_1LE3SZ / count 2087:38918 fill_1F1PGI / icon 20px). 동형 검증: `Medium 2087:38926`.
- 실측: height **32** · padding **10px 12px 10px 10px** · outer gap **4** · radius **100 (pill)** ★ · `layout_BDDP1N`
- bg **rgba(255,255,255,0.04)** (`fill_1IJLKE`) = `--color-surface-ghost`
- border **rgba(255,255,255,0.08)** 1px (`fill_QX1MIZ`)
- 내부 블록 gap **6** · 플랫폼 아이콘 **20×20**
- 라벨 **#FAFAFA** · Medium **500 / 14 / lh130% / -2%**
- 카운트 **#B4B4B4** · Regular **400 / 14 / lh130% / -2%**
- 신규 토큰 후보: 없음(전부 기존 토큰 + recommend 폼팩터). 단 **카운트 트레일링 슬롯·플랫폼 아이콘 슬롯** 구조 추가 필요.
- 현 구현 차이: recommend(h32/pill/.04/.08/14·500)와 **폼팩터 동일** → recommend에 trailing count + leading 플랫폼아이콘 슬롯만 추가하면 됨. selected(active) 상태 미정의.

## §7. tag-chip / removable (선택된 태그 — 콘텐츠추가·확장, x 동반)
- 출처: `content-add 2087:35059` (text 2087:35060 fill_N6KAQN / 취소 2087:35061 16px). 동형 4프레임: `extension 2074:88500·88505·88510`(2074:88500 text fill_T85LME = #CECECE).
- 실측: height **28** · padding **10px 8px 10px 10px** (T/R/B/L) · gap **2** (label↔x) · radius **6** · `layout_UHDK8Z`
- bg **rgba(255,255,255,0.06)** (`fill_YBHYLY`) = `--color-surface-hover`
- 글자 **#CECECE** (`fill_N6KAQN`) · Regular **400 / 13 / lh160% / -2%** (`style_204YVK`)
- 취소(x) 아이콘 **16×16** (`layout_YRFVSV`) · x glyph 8×8 #777777 (`fill_KJX909`)
- 신규 토큰 후보: `--color-chip-tag-text: #CECECE` **[신규 색, 토큰 미보유]** · `--size-chip-tag: 28px` · x glyph 색 #777777(아이콘 자체색, 토큰화 선택)
- 현 구현 차이: removable(trailing x) 변형·h28·#CECECE 글자 **전부 부재**.

## §8. add-chip / "+추가" (태그 추가 트리거 — 콘텐츠추가·확장)
- 출처: `content-add 2384:141372` (`Component 28` 인스턴스, componentSet 2384:141364). 동형: `extension 2074:88496`(픽셀 동일).
- 실측: height **28** · padding **6px 10px 6px 8px** (T/R/B/L) · 외곽 gap 10 · radius **6** · `layout_AVKMY4`
- bg **#242424** (`fill_DKP8O0`) = `--color-surface-200`
- border **rgba(255,255,255,0.08)** 1px (`fill_7R2N52`) = `--color-border-subtle`
- 내부 블록(아이콘+텍스트) gap **3** (`layout_GO1TNB`)
- "+" 더하기 아이콘 **16×16** (componentId 1579:7082, glyph 10.67×10.67 오프셋 2.67)
- "추가" 라벨 **#FAFAFA** (`fill_SPQCJ4`) · Cap1_Md Pretendard **Medium 500 / 13 / lh130% / -2%**
- 신규 토큰 후보: `--size-chip-tag: 28px` (§7 공유) — 색/보더 전부 기존 토큰.
- 현 구현 차이: add-chip 변형 **부재**(#242424 채움·+아이콘·"추가" 텍스트). default(투명/h42)·recommend(pill)와 모두 다른 제3 변형.
- 참고: active(입력) 상태는 별도 — width 193 고정 확장 + 텍스트커서 + placeholder "입력 후 Enter로 추가해 보세요." (#999999 13/Cap1_Rg). 감사 line 174 (`2384:141378`). u3/콘텐츠추가 화면 단위에서 인풋형으로 정의. → [GAP] 파운데이션 범위 밖, 노트.

## §9. card-tag / fill (카드 내부 분류 태그 — 비제거형)
- 출처(전수): `library 2117:22069`(#B4B4B4) · `dashboard 2087:43919`(#B4B4B4) · `content-detail 2087:12572`(#B4B4B4) · `home 2087:69045`(#CECECE).
- 실측: height **28** · padding **10px** (전방향) · gap 10 · radius **6**
- bg **rgba(255,255,255,0.06)** = `--color-surface-hover` (4프레임 일관)
- 글자: Regular **400 / 13 / lh160% / -2%** — 색 **#B4B4B4**(라이브러리·대시보드·상세) / **#CECECE**(홈) — ★화면별 불일치.
- 신규 토큰 후보: `--size-chip-tag: 28px` (§7 공유). 기본 글자색 = `--color-gray-500`(#B4B4B4, 다수결) · 홈 #CECECE는 §7 토큰(`--color-chip-tag-text`)과 동일 → 화면별 적용.
- 현 구현 차이: h28 채움형 카드태그 변형 부재. `badge.neutral`(#2E2E2E solid·13/#B4B4B4)과도 면색(.06 vs solid)·패딩 다름 → 별개 변형.
- ⚠ [GAP] 같은 "카드 분류 태그"가 홈에서만 #CECECE, 나머지 #B4B4B4 — 디자인 측 색 불일치. 충실도 결정 필요(권장: 다수결 #B4B4B4 통일 또는 화면별 유지). 노트.

---

## 신규 토큰 후보 (종합)

색 (토큰 미보유):
- `--color-chip-selected-text: #111111` — 흰 채움 선택칩 글자(§1·§3·§5).
- `--color-chip-count-selected: #505050` — 선택 출처필터 카운트(§3).
- `--color-chip-tag-text: #cecece` — removable 태그칩·홈 카드태그 글자(§7·§9). **#CECECE는 현 토큰셋에 미보유**(가장 가까운 건 gray-500 #B4B4B4·gray-600 #DBDBDB).
- (참고) selected 채움 bg #FAFAFA = 기존 `--color-white` 재사용. 출처필터 비선택 카운트 #B4B4B4 = 기존 `--color-gray-500`. x glyph #777777 = 아이콘 색(토큰화 선택).

사이즈 (height 신규):
- `--size-chip-filter: 30px` — 홈 카테고리 필터칩(§1·§2). 현 토큰 없음(42·32만).
- `--size-chip-source: 32px` — 출처필터칩(§3·§4·§6). 현 `--size-chip-sm: 32px` 재사용 가능.
- `--size-chip-tag: 28px` — 태그칩(removable·add·card, §7·§8·§9). 현 토큰 없음.

타이포 (신규 컴포넌트 셋 후보):
- 칩 본문 13/400/160%/-2% (태그칩·removable·card-tag) → 기존 `--text-body-4`(13/18) lh와 다름(160% = 20.8px). `--text-chip-tag-line: 160%` 고려.
- 칩 필터 14/600(선택)·14/400(비선택)/160%/-2% (필터·출처필터 라벨).
- 카운트 14/400/130%/-2%.

구조(슬롯) 추가 필요 (토큰 아님, 컴포넌트 prop):
- trailing **count** 슬롯(출처필터 §3·§4·§6).
- trailing **remove(x) 16px** 슬롯(removable §7).
- leading **플랫폼 아이콘 20px** 슬롯(출처필터 §4·§6).
- add-chip leading **+ 아이콘 16px** + 텍스트(§8).

---

## [GAP] 목록 (디자인 공백 / 미해결)
1. **selected 채움 — 검색 출처필터(§5)**: 검색 화면 6개 칩 전부 비선택 export → 검색 selected 채움 정적값 없음. 홈/라이브러리 실측(#FAFAFA/#111111)을 pill 폼으로 차용 권장.
2. **card-tag 글자색 불일치(§9)**: 홈 #CECECE vs 라이브러리·대시보드·상세 #B4B4B4. 디자인 측 불일치 — 통일 결정 필요(권장 #B4B4B4).
3. **#CECECE 토큰 미보유(§7·§9)**: 현 토큰셋에 #CECECE 없음. 신규 `--color-chip-tag-text` 추가 필요.
4. **필터칩 hover/disabled 상태(§2)**: 비선택 필터칩의 hover·disabled 정적 export 없음 → ghost 한 단계 강조로 일관 채움.
5. **add-chip active(입력) 상태(§8)**: width 193 확장 + 텍스트커서 + placeholder는 파운데이션 범위 밖(콘텐츠추가 화면 단위). 노트로 이월.
6. **출처필터 selected count 색(§3) #505050**: 토큰 미보유(가장 가까운 stroke-500 #5E5E5E와 미세 차이). 신규 토큰 권장.
