# u0c 정밀 구현 값표 — input(textarea/멀티라인 변형) · 라이브러리 검색바 · 검색 쿼리 selected · stepper

> 측정 정본: Figma file `5GGyKsjXEOpjKMLtUodeSs`, page "프로토타이핑" 2087:5987 하위 실화면 프레임만.
> 모든 값은 `mcp__figma__get_figma_data` 실측(노드ID 출처 명기). 추측/근사 없음. 디자인 공백 = `[GAP]`.
> 현 구현 대조 대상: `apps/web/src/app/styles/tokens.css` · `apps/web/src/shared/ui/input/input.module.css`(+ input.tsx).
> 현 input 컴포넌트 = 2변형(default h42 / search h48)뿐. textarea·멀티라인·콜아웃·stepper 모두 미구현.

---

## 0. 요약 — 측정 결과

- 측정한 변형/사이즈: **7종**
  1. input `textarea-lg` (온보딩 관심분야 직접입력) — h64 멀티라인 텍스트필드
  2. input `callout` (확장 인사이트 콜아웃) — 509×174 고정 멀티라인 박스
  3. input `link-multiline` (콘텐츠추가 링크 붙여넣기) — w530 column hug 멀티라인
  4. input `search` 라이브러리 변형 — **h38 · radius 100** (홈 search h48·radius80과 별개)
  5. input `search` selected/query 상태 — h48 · 좌아이콘+쿼리텍스트+우 X dismiss
  6. stepper 세그먼트(단위) — 40×4 · radius 100 · active #66FF4B / inactive #434343
  7. stepper 컨테이너 — row · gap 4 · 4세그먼트(총 172px) · 상태 1/4~4/4
- 신규 토큰 후보: 7개(아래 §6)
- 발견한 [GAP]: 6건(아래 §7)

---

## 1. input — textarea-lg (온보딩 관심분야 직접입력)

출처: `2087:9224`(컨테이너 "마크다운_콜아웃", layout_36WKDD) + placeholder `2087:9225`(textStyle B1_Rg, fill_0CHDUL).

| 속성 | 실측값 | 출처 |
|---|---|---|
| height | **64** (= 내부 텍스트 h44 + 상하 padding 10+10) | 2087:9224 vertical=fixed · 내부 텍스트 layout_XJTCUW h44 |
| layout | row · alignSelf stretch · gap 10 · horizontal=fill / vertical=fixed | layout_36WKDD |
| padding | **10px 12px** | layout_36WKDD |
| border | **1px solid #363636** (Dark/Dark-Stroke-300) | strokes "Dark/Dark-Stroke-300" · strokeWeight 1 |
| borderRadius | **6** | 2087:9224 |
| background | **투명**(fills 없음) | 2087:9224 |
| placeholder color | **#999999** | fill_0CHDUL |
| placeholder type | B1_Rg = Pretendard Regular 400 · **14px** · lineHeight **160%** · ls **-2%** · align LEFT/TOP | B1_Rg(2087:9225) |

신규 토큰 후보: (높이) `--size-input-lg: 64px`.
현 구현과의 차이:
- 현 input.wrapper: `height var(--size-input)=42` · `border 1px var(--color-border-subtle)=rgba(255,255,255,0.08)` · `bg var(--color-surface-200)=#242424` · `padding 0 14`.
- 필요 변경: 높이 42→**64**, border 색 `rgba(white,.08)`→**solid #363636(--color-stroke-300)**, bg #242424→**투명**, padding `0 14`→**10 12**, 그리고 단일행 `<input>`이 아닌 멀티라인(`textarea` 또는 top-정렬 멀티라인 컨테이너)로 — 현 `.wrapper{align-items:center}`는 멀티라인에서 top 정렬(`flex-start`) 필요.

---

## 2. input — callout (확장 인사이트 콜아웃)

출처: `2074:88456`(컨테이너 "마크다운_콜아웃", layout_PG7H3C) + 본문 `2074:88457`(B1_Rg, fill Dark/Dark-White #FAFAFA).
(동형 프레임: content-add `2087:35015` — 동일 #363636 콜아웃, 감사 line 309 교차확인.)

| 속성 | 실측값 | 출처 |
|---|---|---|
| size | **509 × 174** (고정 fixed/fixed) | layout_PG7H3C dimensions |
| layout | row · gap 10 · horizontal=fixed / vertical=fixed | layout_PG7H3C |
| padding | **10px 12px** | layout_PG7H3C |
| border | **1px solid #363636** (Dark/Dark-Stroke-300) | strokes · strokeWeight 1 |
| borderRadius | **6** | 2074:88456 |
| background | **없음**(투명) | 2074:88456 (fills 미존재) |
| 본문 텍스트 | B1_Rg = Regular 400 · **14px** · 160% · -2% · align LEFT/TOP | B1_Rg(2074:88457) |
| 본문 색 | **#FAFAFA** (Dark/Dark-White) | Dark/Dark-White |
| 본문 박스 | 475 × 154 (= 509-12*2 폭 · 174-10*2 높이) | layout_0I9TQT |

> 주: §1 온보딩과 본문 textStyle은 동일(B1_Rg 14/160%/-2%). 차이는 (a)크기(509×174 고정 vs h64 fill), (b)본문 색(#FAFAFA 채워진 값 vs #999999 placeholder), (c) 둘 다 같은 border #363636·radius6·pad10/12.

신규 토큰 후보: 없음(치수가 고정 인스턴스 — 컴포넌트 prop으로 width/height 지정). border/radius/pad는 §6 공용 토큰 재사용.
현 구현과의 차이: 현 input엔 콜아웃/멀티라인 표시영역 변형 자체가 부재(MISSING). border solid #363636도 부재(현 input은 overlay-white .08).

---

## 3. input — link-multiline (콘텐츠추가 링크 붙여넣기)

출처: `2087:33541`(Frame 2085667113, layout_MEO056, strokes fill_I53L45) + 본문 `2087:33542`(Cap1_Rg, fill_AGD0PV #FAFAFA).

| 속성 | 실측값 | 출처 |
|---|---|---|
| width | **530** (horizontal=fixed) | layout_MEO056 |
| height | **hug**(고정 아님 — 내용 따라 가변, 멀티라인 URL) | layout_MEO056 vertical=hug |
| layout | **column** · alignItems **stretch** · gap **10** | layout_MEO056 |
| padding | **14px**(전방향) | layout_MEO056 |
| border | **1px solid #363636** | fill_I53L45 · strokeWeight 1 |
| borderRadius | **6** | 2087:33541 |
| background | **없음**(투명) | 2087:33541 (fills 미존재) |
| 본문 텍스트 | Cap1_Rg = Regular 400 · **13px** · 130% · -2% · align LEFT/TOP | Cap1_Rg(2087:33542) |
| 본문 색 | **#FAFAFA** | fill_AGD0PV |
| 본문 sizing | horizontal=fill / vertical=hug (여러 줄 URL) | layout_Y7LE3X |

신규 토큰 후보: 없음(폭은 인스턴스 고정값, 나머지는 §6 공용).
현 구현과의 차이(감사 line 192 교차확인):
- 현 input.wrapper: border `rgba(255,255,255,0.08)` · **row** · h42 고정 · pad `0 14`.
- 필요 변경: border→**solid #363636**, layout row→**column(stretch)**, 고정 h42→**hug(멀티라인)**, padding `0 14`→**14(전방향)**, 본문 폰트 **13px Cap1_Rg**(현 input은 14px). 즉 §1과 또 다른 멀티라인 변형(13px·padding 14·column).

> 주: §1(온보딩 textarea)·§2(콜아웃)·§3(링크입력) 모두 **border solid #363636 · radius6**를 공유하나 **레이아웃/폰트/패딩이 제각각**:
> - §1: row · pad 10/12 · 14px · h64
> - §2: row · pad 10/12 · 14px · 509×174 고정
> - §3: column · pad 14 · 13px · w530 hug
> → 단일 textarea 변형으로 합치기보다 prop(폰트/패딩/사이즈 모드)로 분기 권장.

---

## 4. input — search 라이브러리 변형 (h38 컴팩트)

출처: `2117:22132`(Frame 2085669039, layout_8W9AR9, strokes fill_D981X5) — placeholder 상태.
내부: 아이콘_좌측 GNB 18px(componentId 1579:7027) + 텍스트 "제목, 메모, 태그로 검색"(style_385U9A, fill_1YQH7B #B4B4B4).

| 속성 | 실측값 | 출처 |
|---|---|---|
| size | **284 × 38** (fixed/fixed) | layout_8W9AR9 dimensions |
| layout | column · gap 10 · horizontal=fixed/vertical=fixed | layout_8W9AR9 |
| 내부 row | row · alignItems center · gap **6** · hug/hug | layout_1LHBG2 |
| padding | **10px 14px** | layout_8W9AR9 |
| border | **1px rgba(255,255,255,0.1)** | fill_D981X5 |
| borderRadius | **100** (완전 pill) | 2117:22132 |
| background | **없음**(투명 — fills 미존재) | 2117:22132 |
| 좌측 아이콘 | 18 × 18 (GNB 검색 아이콘 componentId 1579:7027) | layout_FZ3LCK |
| placeholder 텍스트 | style_385U9A = Regular 400 · **14px** · lineHeight **130%** · ls -2% | style_385U9A |
| placeholder 색 | **#B4B4B4** | fill_1YQH7B |

신규 토큰 후보: (높이) `--size-search-sm: 38px`.
현 구현과의 차이(감사 line 198 교차확인):
- 현 search 변형: h48(--size-search) · radius 80(--radius-search) · pad `0 20` · gap 6 · border .10 · bg #1F1F1F · placeholder 15px/#B4B4B4.
- 라이브러리 search는 **h38 · radius 100 · pad 10/14 · placeholder 14px(130%) · bg 투명**. → 별도 size(`search-sm`) 변형 필요. radius도 80이 아닌 **100**(--radius-pill). bg가 #1F1F1F가 아니라 **투명**.
- 공통: 좌측 18px 아이콘 슬롯·border 0.10·gap 6 동일.

---

## 5. input — search selected/query 상태 (X dismiss 포함)

출처: `2087:38859`(Frame 2085667627, layout_ZAGBPE, fill_50DIFE, strokes fill_P6XE2C) — 검색결과 화면.
교차확인 동형: `2087:40137`(결과없음 화면 — 모든 값 동일).
내부: 좌 아이콘 18px(1579:7027) + 쿼리텍스트("IT 업계 동향", style_PP9AZY/#FAFAFA) + 우 X dismiss 16px(componentId 1230:5857 "Size=16, Theme=Regular").

| 속성 | 실측값 | 출처 |
|---|---|---|
| size | **520 × 48** (fixed/fixed) | layout_ZAGBPE dimensions |
| layout | column · justify center · alignItems stretch · gap 10 | layout_ZAGBPE |
| 내부 row | row · alignItems center · alignSelf stretch · gap **6** · horizontal=fill | layout_72XNH9 |
| padding | **8px 20px** (좌우 20 대칭) | layout_ZAGBPE |
| border | **1px rgba(255,255,255,0.1)** | fill_P6XE2C |
| borderRadius | **80** | 2087:38859 |
| background | **#1F1F1F** | fill_50DIFE |
| 좌측 아이콘 | 18 × 18 (GNB 검색 componentId 1579:7027) | layout_YX0AIB |
| 쿼리 텍스트 | style_PP9AZY = Regular 400 · **15px** · 160% · ls **-2.5%** · LEFT/TOP | style_PP9AZY |
| 쿼리 텍스트 색 | **#FAFAFA**(채워진 값, placeholder 아님) | fill_AITDKA |
| 쿼리 텍스트 sizing | horizontal=fill (가운데 영역 차지) | layout_FU2CPX |
| 우측 X(dismiss) | **16 × 16** · componentId 1230:5857 · 내부 글리프 색 #999999 | layout_V74HC1 · fill_XUGPAG |

신규 토큰 후보: 없음(치수=홈 search h48 동일). **트레일링 dismiss 슬롯**·**선택값(채워진 쿼리) 상태**가 신규 컴포넌트 기능.
현 구현과의 차이(감사 line 200 교차확인):
- 현 input.tsx엔 `leadingIcon`·`trailingIcon` 슬롯은 있으나 **dismiss(X) 클릭 핸들러/선택값 표시 상태** 없음. trailing은 16px 아이콘.
- search 변형 padding은 현 `0 20`(상하 0) → 실측 **8 20**. height 48·radius 80·bg #1F1F1F·border .10은 일치.
- 쿼리 텍스트 색은 placeholder #B4B4B4가 아니라 **채워진 #FAFAFA**(text-primary) — filled 상태 스타일 필요.

---

## 6. stepper (온보딩 진행바) — 신규 컴포넌트

출처: 컨테이너 `2087:8488`(Frame 2085669058, layout_X15X0M) + 세그먼트 4개:
- `2087:8489` (Rectangle 3466202) = active #66FF4B (fill_8MW3EO)
- `2087:8490` (Rectangle 3466201) = inactive #434343 (fill_8LWHK2)
- `2087:8491` (Rectangle 3466200) = inactive #434343
- `2087:8492` (Rectangle 3466199) = inactive #434343
> 위는 **1/4 상태**(첫 세그먼트만 active). 2/4=2개·3/4=3개·4/4=4개 active(감사 line 119~121).

### 6-1. 컨테이너
| 속성 | 실측값 | 출처 |
|---|---|---|
| layout | **row** · alignItems **center** · sizing hug/hug | layout_X15X0M |
| gap | **4px** | layout_X15X0M |
| 세그먼트 수 | **4** | 2087:8488 children |
| 총 너비(파생) | **172** (= 40×4 + 4×3) | 계산 |

### 6-2. 세그먼트(각 1개)
| 속성 | 실측값 | 출처 |
|---|---|---|
| size | **40 × 4** (fixed/fixed) | layout_83OENA dimensions |
| borderRadius | **100** | 2087:8489~8492 |
| active fill | **#66FF4B** | fill_8MW3EO (2087:8489) |
| inactive fill | **#434343** | fill_8LWHK2 (2087:8490/8491/8492) |

신규 토큰 후보:
- `--color-stepper-inactive: #434343` (★토큰 미등재 — stroke-400 #4E4E4E·surface-tab-selected #363636 어느 것과도 다름)
- active = 기존 `--color-brand-primary`(#66FF4B) 재사용
- 세그먼트 치수(40×4 radius 100)는 컴포넌트 상수(또는 `--size-stepper-seg-w: 40px` / `--size-stepper-seg-h: 4px`), gap=`--space-2`(4) 재사용, radius=`--radius-pill`(100) 재사용

현 구현과의 차이: **MISSING** — shared/ui에 stepper/progress 컴포넌트 자체가 없음(감사 line 120). inactive 색 #434343도 tokens.css 미등재.

---

## 7. 신규 토큰 후보 (정리)

| 토큰 | 값 | 용도 / 출처 |
|---|---|---|
| `--size-input-lg` | 64px | 온보딩 textarea-lg height (2087:9224) |
| `--size-search-sm` | 38px | 라이브러리 검색바 height (2117:22132) |
| `--color-stepper-inactive` | #434343 | stepper inactive 세그먼트 (2087:8490, 미등재 색) |
| (선택) `--size-stepper-seg-w` | 40px | stepper 세그먼트 폭 (2087:8489) |
| (선택) `--size-stepper-seg-h` | 4px | stepper 세그먼트 높이 (2087:8489) |

재사용(신규 아님): border solid #363636 = `--color-stroke-300` · radius 6 = `--radius-sm` · radius 100 = `--radius-pill` · radius 80 = `--radius-search` · brand #66FF4B = `--color-brand-primary` · gap 4 = `--space-2` · pad 10/12·14 = `--space-5`/`--space-6`/`--space-7` · placeholder #999999 = `--color-text-tertiary` · #B4B4B4 = `--color-gray-500`/`--color-text-secondary` · #FAFAFA = `--color-white`/`--color-text-primary`.

---

## 8. [GAP] — 디자인 공백 (프레임에 없는 것 → 추측 금지·노트)

- **[GAP-1] textarea/멀티라인 인풋의 focus·hover·invalid 상태**: §1~§3 멀티라인 인풋의 포커스/호버/에러 보더가 실화면 프레임에 부재. 현 input은 focus=`--color-stroke-typing`(#1F6FEB, 668:29 합리값)·invalid=`--color-system-red`을 차용. 멀티라인 변형도 동일 토큰 일관 적용 권장(실측 아님 — gap 표기).
- **[GAP-2] 온보딩 textarea-lg(§1) 캐럿/타이핑·채워진(filled) 텍스트 색**: placeholder만 측정됨(#999999). 입력 후 본문 색은 프레임 부재 → §2 콜아웃의 채워진 본문 색 #FAFAFA(`--color-text-primary`) 차용 권장.
- **[GAP-3] 라이브러리 검색바(§4) 입력값(filled)·focus 상태**: placeholder 프레임만 존재. 채워진/포커스 상태 부재 → §5 selected 패턴(#FAFAFA 텍스트)·공용 focus 토큰 차용.
- **[GAP-4] search selected(§5) X dismiss 호버/프레스 상태**: dismiss 아이콘 정적 상태만(글리프 #999999). hover/active 색 변화 프레임 부재 → 인터랙션 토큰 부재.
- **[GAP-5] stepper 전환 애니메이션**: 1/4→4/4 진행 시 트랜지션(시간·이징) 프레임 부재 → 정적 색 스왑만 측정됨. 모션은 디자인 공백.
- **[GAP-6] 멀티라인 인풋 최대높이/스크롤 동작**: §1(h64 고정)·§2(174 고정)는 고정, §3(hug 가변)은 max-height/스크롤 임계 프레임 부재 → 동작 미정.

---

## 9. ★커밋 금지 / 통합 책임

본 파일은 측정 산출물(스펙)만. 토큰/컴포넌트 실제 추가·커밋은 PM 통합 단계에서 수행(git add/commit 금지 — 작업 브리프 카디널 룰).
