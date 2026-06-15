# Toggle (Switch) — 정밀 구현 값표 (u0c fidelity)

> ★카디널 룰 준수: Figma fileKey `5GGyKsjXEOpjKMLtUodeSs`, 페이지 "프로토타이핑" 하위 실화면 프레임에서만 실측. 눈대중·추측 금지.
> ★FD2 적용: Figma 파랑 토글 100% 채택 — 현 구현(46×28·knob24·ON #66FF4B)을 아래 실측값으로 **전면 교체**.

## 0. 측정 출처 (전수)

콘텐츠추가 플로우 + 확장 플로우의 토글 인스턴스 6개를 전수 판독. **6개 모두 동일한 값**이며 **모두 ON(checked) 상태**다.

| 출처 노드 | 플로우 | 역할 | 비고 |
|---|---|---|---|
| `2087:35027` | 콘텐츠추가 | GROUP "Lengthen the component if it is cut off" (트랙 외곽) | 44×22, radius 1000 |
| `2087:35028` | 콘텐츠추가 | FRAME "Hug contents BG" (트랙 배경) | fill #2563EB, padding 2/2/2/8 |
| `2087:35029` | 콘텐츠추가 | FRAME "Text wit knob" (knob 정렬 래퍼) | 18×18, row/center/center, gap 6 |
| `2087:35030` | 콘텐츠추가 | IMAGE-SVG "knob" | 18×18, #FAFAFA + stroke + shadow |
| `2074:88468` | 확장 | GROUP (트랙 외곽) | 44×22, radius 1000 — 35027과 동일 |
| `2074:88469` | 확장 | FRAME "Hug contents BG" (트랙 배경) | #2563EB, padding 2/2/2/8 — 동일 |
| `2074:88470` | 확장 | FRAME "Text wit knob" | 18×18 — 동일 |
| `2074:88471` | 확장 | IMAGE-SVG "knob" | 18×18 + stroke + shadow — 동일 |

**결론: 변형(variant) 1종 · 사이즈 1종 · 상태 = ON만 존재.** OFF 상태 인스턴스는 6개 프레임 어디에도 없음 → [GAP] (아래 §4).

---

## 1. 트랙(track) — 실측 값표

| 속성 | 실측값 | 출처 노드 |
|---|---|---|
| width | **44px** (fixed) | `2087:35027` layout_06RIBB / `2074:88468` layout_FVQLDU |
| height | **22px** (fixed) | 동일 |
| borderRadius | **1000px** (pill) | `2087:35027` borderRadius / `2087:35028` borderRadius |
| padding | **2px 2px 2px 8px** (top/right/bottom/left) | `2087:35028` layout_0A7UI3 / `2074:88469` layout_94ZU01 |
| layout-mode | column · justifyContent center · alignItems **flex-end** | `2087:35028` layout_0A7UI3 (knob 우측 정렬 = ON) |
| fill (ON) | **#2563EB** (Figma 스타일명 `Light-Primary`) | `2087:35028` fills / `2074:88469` fills |
| fill (OFF) | [GAP] — 실화면 부재 (아래 §4) | — |
| border / stroke | 없음 | 트랙에 stroke 속성 부재 |

> 기하 검산: height 22 − knob 18 = 4 → top/bottom 각 2px (padding top/bottom 2와 일치). width 44 − 우측 padding 2 − knob 18 = 24 → ON일 때 knob left = 24px. OFF(좌측 padding 8) knob left = 8px. **ON↔OFF knob 이동거리 = 16px.**

## 2. knob — 실측 값표

| 속성 | 실측값 | 출처 노드 |
|---|---|---|
| width | **18px** | `2087:35030` layout_5QJG8D / `2074:88471` layout_KFDIL3 |
| height | **18px** | 동일 |
| shape | 원형 (IMAGE-SVG, radius = full) | knob 노드 |
| fill | **#FAFAFA** (Figma 스타일명 `Dark/Dark-White`) | `2087:35030` fills / `2074:88471` fills |
| stroke color | **rgba(0, 0, 0, 0.24)** | `2087:35030` fill_7M0FJX / `2074:88471` fill_RHA6CL |
| strokeWeight | **0.5px** | `2087:35030` / `2074:88471` strokeWeight |
| boxShadow | **0px 2px 1px 0px rgba(0,0,0,0.04), 0px 1px 6px 0px rgba(0,0,0,0.06)** (이중 그림자) | `2087:35030` effect_L8M9V1 / `2074:88471` effect_NCJK0J |

> ★FD3 일치: knob fill = #FAFAFA (흰색 통일). 현 토큰 `--color-white: #fafafa` 와 동일 — 재사용 가능.

## 3. 신규 토큰 후보

현 `tokens.css`에 재사용 가능한 토큰: `--color-white`(#fafafa = knob fill), `--radius-pill`(100px ≈ 1000 pill 효과), `--radius-full`(9999px = knob 원형). 아래는 **신규 추가 후보**(토글 전용 컴포넌트 토큰).

| 토큰명(후보) | 값 | 용도 |
|---|---|---|
| `--toggle-track-w` | `44px` | 트랙 너비 |
| `--toggle-track-h` | `22px` | 트랙 높이 |
| `--toggle-track-pad` | `2px 2px 2px 8px` | 트랙 내부 padding (ON 기준) |
| `--toggle-knob-size` | `18px` | knob 지름 |
| `--toggle-knob-travel` | `16px` | OFF→ON knob translateX (검산값) |
| `--color-toggle-on` | `#2563EB` | ON 트랙 배경 (Figma Light-Primary). ★현 구현 `--color-brand-primary`(#66ff4b) 대체 |
| `--color-toggle-knob` | `#fafafa` (= `var(--color-white)`) | knob fill |
| `--color-toggle-knob-stroke` | `rgba(0, 0, 0, 0.24)` | knob 0.5px stroke |
| `--shadow-toggle-knob` | `0px 2px 1px 0px rgba(0,0,0,0.04), 0px 1px 6px 0px rgba(0,0,0,0.06)` | knob 이중 그림자 |
| `--color-toggle-off` | [GAP] — 결정 필요 (§4) | OFF 트랙 배경 |

> radius: 트랙은 Figma 1000px(완전 pill). 현 `--radius-pill`(100px)로 44×22에서 동일한 pill 시각 효과 → `--radius-pill` 재사용 가능(굳이 1000 신규 토큰 불필요). knob은 `--radius-full` 재사용.

## 4. [GAP] 목록 (디자인 공백)

1. **[GAP] OFF(unchecked) 트랙 배경색** — 6개 프레임 모두 ON 인스턴스만 존재. OFF 트랙 fill 실측 불가.
   - 감사 정본(라인 105) 노트: OFF/track `#313131`(= `--color-surface-300`)는 실화면 부재. → **디자인시스템 토큰 `--color-surface-300`(#313131)으로 일관 채움 권장** (`--color-toggle-off` 후보값). PM/사용자 확인 대상.
2. **[GAP] OFF 상태 knob 위치/그림자** — OFF 인스턴스 부재. knob 18·stroke·shadow는 ON과 동일 적용, 위치만 좌측(left padding 8, translateX 0)으로 추정 구현. 색·치수는 ON과 동일하므로 시각 리스크 낮음.
3. **[GAP] disabled 상태** — Figma 부재. 현 구현 `opacity 0.4` 유지(디자인시스템 관례) — 노트로 기록.
4. **[GAP] hover/focus 상태** — Figma 부재. focus-visible는 현 구현(outline brand-primary) 유지하되, FD2 채택 시 outline 색은 `--color-toggle-on`(#2563EB)로 통일 검토 권장.

## 5. 현 구현과의 차이 (toggle.module.css 대조 — 전면 교체 대상)

| 항목 | 현 구현 (toggle.module.css) | Figma 실측 (교체 후) | 차이 |
|---|---|---|---|
| 트랙 width | `46px` | **44px** | −2px |
| 트랙 height | `28px` | **22px** | −6px |
| 트랙 padding | `2px` (전방향) | **2px 2px 2px 8px** | 좌측 8px |
| 트랙 radius | `var(--radius-pill)` 100px | 1000(pill) → `--radius-pill` 유지 OK | 동일 효과 |
| ON 트랙 bg | `var(--color-brand-primary)` **#66ff4b** | **#2563EB** (`--color-toggle-on`) | ★색상 전면 교체 (그린→파랑) |
| OFF 트랙 bg | `var(--color-surface-300)` #313131 | [GAP] → 동일 #313131 권장 | 유지 가능 |
| knob size | `24×24` | **18×18** | −6px |
| knob fill | `var(--color-white)` #fafafa | **#fafafa** | 동일 ✓ |
| knob stroke | 없음 | **rgba(0,0,0,0.24) 0.5px** | ★신규 추가 |
| knob shadow | 없음 | **0 2 1 rgba(0,0,0,.04), 0 1 6 rgba(0,0,0,.06)** | ★신규 추가 (이중) |
| ON knob translateX | `18px` | **16px** (검산: 24−8) | −2px |
| disabled | `opacity 0.4` | [GAP] → 유지 | 동일 |

### 교체 권장 CSS (참고 — 구현 시 토큰화)

```css
.toggle {
  width: 44px; height: 22px;
  padding: 2px 2px 2px 8px;
  border-radius: var(--radius-pill);   /* 100px → 22h pill */
  background-color: var(--color-surface-300);  /* OFF [GAP] */
}
.knob {
  width: 18px; height: 18px;
  border-radius: var(--radius-full);
  background-color: var(--color-white);          /* #fafafa */
  border: 0.5px solid rgba(0, 0, 0, 0.24);
  box-shadow: 0px 2px 1px 0px rgba(0,0,0,0.04), 0px 1px 6px 0px rgba(0,0,0,0.06);
}
.checked { background-color: #2563EB; }          /* ★FD2 */
.checked .knob { transform: translateX(16px); }  /* 44−2−18 − 8 = 16 */
```
> 주의: padding-left 8 / padding-right 2 비대칭이므로 OFF에서 knob은 left:8 위치(translateX 0), ON에서 translateX 16px. flexbox alignItems flex-end 대신 transform 방식 사용 시 위 계산값 적용.
