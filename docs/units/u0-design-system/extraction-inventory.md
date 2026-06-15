# u0-design-system — Extraction Inventory (phase ①)

> 디자이너 에이전트가 Figma "디자인 시스템" 페이지 `668:29` + 컴포넌트 SECTION `2562:7927`에서
> **기계적 추출**한 토큰·컴포넌트 목록 + **디자인 공백/불확실**. 픽셀-퍼펙트 *시각* 마감은 phase ②(사용자 워크트리).
>
> file key `5GGyKsjXEOpjKMLtUodeSs` · 추출 도구 `mcp__figma__get_figma_data` (globalVars.styles = 정확값 SoT).

---

## 1. 추출 토큰 (→ `apps/web/src/app/styles/tokens.css`)

### 1-a. Color (다크 모드) — 출처: `668:29` "Color System - Dark Mode" 스와치 노드
정준 색 SoT는 이 다크-모드 스와치 섹션이다. (괄호 = Figma 노드 라인/스와치명)

| 토큰 | 값 | Figma 출처(스와치명) |
|---|---|---|
| `--color-bg` | `#000000` | Dark-Black (alt) |
| `--color-surface` | `#171717` | Dark-Black |
| `--color-surface-100` | `#1F1F1F` | Dark-Gray-100 |
| `--color-surface-200` | `#242424` | Dark-Gray-200 / Stroke-100 |
| `--color-surface-300` | `#313131` | Dark-Gray-300 |
| `--color-gray-400` | `#898989` | Dark-Gray-400 |
| `--color-gray-500` | `#B4B4B4` | Dark-Gray-500 |
| `--color-gray-600` | `#DBDBDB` | Dark-Gray-600 |
| `--color-gray-700` | `#ECECEC` | Dark-Gray-700 |
| `--color-white` | `#FAFAFA` | Dark-White |
| `--color-accent` | `#00623A` | Dark-Main |
| `--color-accent-stroke` | `#168353` | Dark-Stroke-Main |
| `--color-accent-100` | `#2F7453` | Dark-Main-100 |
| `--color-accent-stroke-100` | `#3ECF8E` | Dark-Stroke-Main-100 (최밝은 그린) |
| `--color-accent-disabled` | `rgba(0,98,58,.4)` | Dark-Main-Disabled (00623A / 40%) |
| `--color-accent-stroke-disabled` | `rgba(22,131,83,.4)` | Dark-Stroke-Main-Disabled |
| `--color-stroke-100` | `#242424` | Stroke-100 (=Dark-Gray-200) |
| `--color-stroke-200` | `#2E2E2E` | Dark-Stroke-200 |
| `--color-stroke-300` | `#363636` | Dark-Stroke-300 |
| `--color-stroke-400` | `#4E4E4E` | Dark-Stroke-400 |
| `--color-stroke-500` | `#5E5E5E` | Dark-Stroke-500 |
| `--color-stroke-typing` | `#1F6FEB` | Dark-Stroke-Typing (인풋 포커스) |
| `--color-dimmed-100` | `rgba(0,0,0,.1)` | Dark-Dimmed-100 |
| `--color-dimmed-200` | `rgba(0,0,0,.6)` | Dark-Dimmed-200 (모달 백드롭) |
| `--color-system-red` | `#D35541` | Dark-System-Red |
| 텍스트 시맨틱(primary/secondary/tertiary/disabled/on-accent) | (위 그레이 매핑) | 03_폰트컬러 위계의 다크 매핑 |

**합계: 색 토큰 25개 그룹**(surface/gray 10 · accent 6 · stroke 6 · dimmed 2 · system 1) + 텍스트 시맨틱 5.

### 1-b. Typography — 출처: `668:29` 02_사용폰트 + `globalVars.styles.style_*`
- family = **Pretendard** (04_한글폰트). 가중치 Light300/Regular400/Medium500/SemiBold600/Bold700.
- letter-spacing 기본 **-2.5%** (대다수 스타일 공통).
- Figma 명명 스케일: Display D1–D6 · Headline H1–H6 · **Title T1–T5** · **Body B1–B4** · **Caption C1–C3** · Button BUT1–4.
- u0 토큰화 범위 = 실사용 Title/Body/Caption(웹앱 UI에 쓰이는 12개). Display/Headline(랜딩 대형)은 미사용 추정 → 미토큰화(공백 §2-c).

| 토큰 | size / line | Figma style_ |
|---|---|---|
| `--text-title-1` | 32 / 42px | style_0Y70FH |
| `--text-title-2` | 28 / 130% | style_RM8FBP |
| `--text-title-3` | 24 / 130% | style_V14KF6 |
| `--text-title-4` | 20 / 130% | style_D7UL58 |
| `--text-title-5` | 18 / 130% | style_RRQP7Q |
| `--text-body-1` | 16 / 24px | style_33A3G7 |
| `--text-body-2` | 15 / 22px | style_G9E9MV |
| `--text-body-3` | 14 / 20px(160%) | style_8NZM7P |
| `--text-body-4` | 13 / 18px | style_6TACK4 |
| `--text-caption-1` | 13 / 130% | style_SEX4MW |
| `--text-caption-2` | 12 / 130% | style_SEX4MW |
| `--text-caption-3` | 11 / 130% | style_8X9CZC |

**합계: 타이포 토큰 12개** + family 1 + weight 5 + letter-spacing 1.

### 1-c. Spacing — 출처: `668:29` 레이아웃 gap/padding 빈도 분석
관측 빈도 상위: 10(90)·4(68)·16(21)·8(16)·32(13)·20(12) → 4px 베이스 + 레거시 10-그리드 혼재.
토큰: `--space-0/1/2/3/4/5/6/8/10/12/16/20` = 0,2,4,6,8,10,12,16,20,24,32,40 px. **합계 12개.**

### 1-d. Radius — 출처: 전 화면 `borderRadius` 빈도
8px(262, 최다)·6px(88)·16px(50)·4px(40)·100px(25)·20px(10)·12px(5).
토큰: `--radius-xs/sm/md/lg/xl/2xl/pill/full` = 4,6,8,12,16,20,100,9999. **합계 8개.**

### 1-e. Shadow / Effect — 출처: `668:29` `globalVars.styles.effect_*` (정확값)
| 토큰 | 값 | effect_ |
|---|---|---|
| `--shadow-overlay` | `0 8 24 rgba(0,0,0,.24)` | effect_V3XAOF (모달/드롭다운) |
| `--shadow-drop` | `0 4 4 rgba(0,0,0,.25)` | effect_EF97LY |
| `--shadow-inset-light` | `inset 0 0 0 1 rgba(255,255,255,.1)` | effect_PQ5KQ6 |
| `--shadow-inset-dark` | `inset 0 0 0 1 rgba(0,0,0,.2)` | effect_2NHDPQ |

**합계 4개** (Figma 디자인 시스템 effect 전량).

> z-index 4개(--z-dropdown/modal-backdrop/modal/toast)는 Figma 비추출 — 레이어링 구조용으로 추가(주석 표기).

---

## 2. 컴포넌트 (→ `apps/web/src/shared/ui/**`)

대상 = 컴포넌트 SECTION `2562:7927` + metadata.components 변형 props. 각 컴포넌트는 폴더+CSS Module+배럴.

| shared/ui | Figma 컴포넌트 변형(props) | 구현 상태(phase ①) |
|---|---|---|
| `button` | Type=Primary/Secondary/Tertiary × State=Default/Hover/Disabled × Size=Small/Medium × Resizing=Fill/Hug | ✅ 3 variant × 2 size × fullWidth + 호버/비활성/포커스 |
| `chip` | Selected=True/False (pill) | ✅ selected 토글 + 호버/비활성 |
| `card` | (명시 변형 없음 — surface 패턴) | ✅ 기본 + interactive(hover) + flush ▢ |
| `tabs` | Tab/FilterTab/Item · Type=FilterTab | ✅ underline(메인탭) + pill(필터) |
| `toggle` | ▢ 전용 switch 변형 미확인 | ⚠ 추정 스켈레톤 (치수 공백) |
| `input` | State=Default/Typing/Focused/Entered × Disabled=true/false | ✅ focus(typing 스트로크) + invalid + disabled |
| `dropdown` | Expanded=True/False | ✅ 트리거 + 패널(shadow-overlay) + Pro trailing 슬롯 |
| `modal` | (오버레이 — 클립/요금제/확장 모달) | ✅ Dimmed-200 백드롭 + 패널 + header/body/footer |
| `toast` | ▢ 전용 토스트 디자인 미확인 | ⚠ 추정 스켈레톤 (공백) |
| `avatar` | (프로필 이미지/이니셜) | ✅ sm/md/lg + 이미지/이니셜 폴백 |
| `badge` | Solid=True/False | ✅ neutral/accent/pro/danger × solid/soft |

**합계: shared/ui 컴포넌트 11개** (전 요구 항목 충족).

---

## 3. 디자인 공백 / 불확실 (추측 ❌ — phase ② 사용자 결정/확인)

### 3-a. ⚠ 컴포넌트 SECTION `2562:7927`이 비정준 (가장 중요)
- 해당 SECTION은 **html.to.design 임포트 산출물**("index.html by html.to.design … (Components)")이다.
  - 컴포넌트 **이름이 제거됨**(variant=N / :hover=true|false 로만 남음) → 의미 매핑은 metadata.components의
    `Type=…, State=…` props로 역추론.
  - 색 팔레트가 **Tailwind-grey(#1F2937·#111827·#E5E7EB)·#66FF4B 그린**으로, `668:29` 다크 토큰과 불일치.
- **판정**: 토큰 정준 SoT = `668:29` 다크 모드. 컴포넌트 *치수/레이아웃*은 SECTION 참조하되 *색*은 토큰으로 대치.
- **phase ② 확인 필요**: 실제 화면 프레임(홈 `2087:69031`, 라이브러리 `2117:22041`)에서 버튼/칩/인풋 실측
  치수(높이·패딩·폰트사이즈)를 컴포넌트별로 검증해 스켈레톤 수치 보정.

### 3-b. 토큰 공백/미토큰화
1. **Pro 보라 색**: `fill_7M6ZZP #6D5DFF` 등 보라 계열이 `668:29` fills엔 있으나 **다크-모드 시맨틱 스와치엔
   미등재** → `tokens.css` 미노출. `badge.module.css`에서 직접 hex 사용(주석 표기). → phase ② 토큰화 결정.
2. **텍스트 시맨틱 다크 매핑 추정**: 03_폰트컬러는 **라이트** 기준(Main #111111 / Sub #505050·#767676 /
   Disabled #999999)만 명시. 다크 본문 위계는 Dark-Gray 스케일로 **매핑 추정**(primary=White, secondary=Gray-500,
   tertiary=Gray-400, disabled=Stroke-500) → phase ② 실화면 대조 확인.
3. **Display/Headline 타이포 미토큰화**: D1–D6·H1–H6는 랜딩 대형용 추정 → 웹앱 UI 미사용으로 제외. 필요 시 추가.
4. **Spacing 베이스 혼재**: 4px 스케일에 레거시 **10px 그리드**가 다수 혼재(gap 10이 최빈) → 정규화 정책(4 통일 vs
   10 허용)을 phase ②/후속에서 결정. 현재 둘 다 토큰화(space-5=10).

### 3-c. 컴포넌트 상태/변형 공백
1. **Toggle(switch)**: Figma 컴포넌트 변형에 명시적 switch 미확인(Selected/Expanded만) → 트랙/노브 치수 추정.
2. **Toast**: 전용 토스트 프레임 없음(디자인 공백 레지스터 §1, 콘텐츠추가 완료 토스트 = ▢) → 색/치수/모션 추정.
3. **Card**: 명시 컴포넌트 변형 없음 — 홈 피드/라이브러리 카드의 surface 패턴에서 일반화. 썸네일 카드(flush)
   비율·내부 구조는 화면 단위(u2/u7)에서 확정.
4. **Button Resizing=Hug/Fill**: fullWidth로 매핑했으나 Hug 시 최소폭/아이콘-only 변형은 미확인.

> 위 ▢/⚠ 외 화면-레벨 공백(빈/로딩/에러·설정·알림 등)은 `docs/design/README.md` 디자인 공백 레지스터 소관(u0 범위 밖).

---

## 4. phase ② 사용자 마감 체크리스트 (인터랙티브 워크트리)

- [ ] `pnpm install` → `tsc -b` 0 · `pnpm lint` 0 · `pnpm lint:fsd` 0 (node_modules 부재로 phase ① 미검증).
- [ ] `/ui-preview` 렌더 → Figma `668:29`(토큰 팔레트) 1:1 대조: 색 HEX·타이포 크기/행간·간격·반경·**그림자**.
- [ ] 컴포넌트별 실화면 프레임 대조(홈 `2087:69031`·라이브러리 `2117:22041`)로 **치수 보정**:
      Button 높이/패딩, Chip 높이, Input 높이, Card 패딩/radius, Tabs 인디케이터, Modal 폭/패딩.
- [ ] **Toggle/Toast** 디자인 확정(또는 게이트 ⓐ 스코프 판정) → 추정 스켈레톤 교체.
- [ ] **Pro 보라** + **다크 텍스트 위계** 토큰화 확정 → `badge`·텍스트 시맨틱 정합.
- [ ] **Spacing 10 vs 4** 정규화 정책 결정.
- [ ] `/design-review`(프레임 대비 충실도) PASS + 스크린샷 → **게이트 ⓒ 충실도 사인오프**.

---

## 5. 검증 명령 (phase ②)
```bash
pnpm -C apps/web install
pnpm -C apps/web tsc -b           # 0
pnpm -C apps/web lint             # 0
pnpm -C apps/web lint:fsd         # 0 (shared 상위 임포트 0 — phase ① 정적 확인 완료)
pnpm -C apps/web dev              # → /ui-preview 에서 Figma 668:29 대조
```
