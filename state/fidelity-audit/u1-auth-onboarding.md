# 충실도 감사 — u1 auth-onboarding (로그인 + 온보딩 4단계 + 확장설치 모달)

- fileKey: `5GGyKsjXEOpjKMLtUodeSs`
- 감사일: 2026-06-16 · read-only(코드 미변경)
- 분석 프레임(전수 실측 + PNG 렌더 + 눈 확인):
  - 2087:8221 소셜 로그인 (`2087-8221-social-login.png`)
  - 2087:8476 ① 직업 (`2087-8476-job.png`)
  - 2087:8726 ② 연차 (`2087-8726-years.png`)
  - 2087:8968 ③ 관심분야 (`2087-8968-interests.png`)
  - 2087:9228 ④ 목표 (`2087-9228-goal.png`)
  - 2087:9468 확장설치 모달 (`2087-9468-extension-modal.png`) + 카드 2087:10931 drill
- PNG 경로: `/Users/suho/Desktop/Grabit/state/fidelity-audit/u1-auth-onboarding/`

## 충실도 추정: **약 78%**

레이아웃 그리드·타이포·토큰·칩/버튼/스텝퍼/모달 폼팩터는 측정값과 1:1로 매우 정확하다(공유 프리미티브가 실측 SoT 기반). 충실도를 깎는 핵심은 **(A) 의도적 스코프 컷(소셜 E1: Naver/이메일/divider/계속)으로 렌더가 크게 달라짐**, **(B) ② 연차 부제 실제 존재하나 누락**, **(C) 정적 일러스트 2종(프로모 우패널·모달 좌측)이 플레이스홀더**, **(D) selected 칩 채움색 미측정 갭**이다. (A)/(C)는 ADR/G7로 문서화된 의도 컷이지만 프레임 대비 시각 차이는 실재하므로 명시한다.

---

## 섹션 대조표 — 소셜 로그인 (2087:8221)

| Figma 섹션/요소 (nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 프레임 (2087:8221) | 1920×1080 · bg #121212 | ✅ | `pages/auth/ui/login-page.module.css` `.page` | - |
| 헤더/로고 (2087:8223 / Group 1707483494) | row x=32 y=28 w902 space-between center · 로고 91×24.75 (IMAGE-SVG 실자산) | 🟡 부분 | `widgets/onboarding-header/ui/onboarding-header.module.css` · `logo.tsx` | 위치·크기 일치. 로고가 **실 Grabit SVG 자산이 아닌 근사 헥사곤 마크**(low) |
| 좌 컬럼 (2087:8439 layout_ARPXWS) | column gap 24 · x=276 y=251 w414 | ✅ | `login-page.module.css` `.leftColumn` | - |
| 제목 "Grab your growth, Together" (2087:8442) | Display 2/Semibold 30/600/130%/-2% #FAFAFA | ✅ | `.heading` | - |
| 부제 "당신의 성장 여정을 함께 합니다." (2087:8443) | Body 1/Regular 16/400/160%/-2% **#CECECE** (fill_FBBWYU) | ⚠️ 틀림 | `.subheading` | 색이 `--color-text-secondary` **#B4B4B4** → 실측 **#CECECE**(`--color-gray-550`)로 정정(med) |
| 소셜 버튼 그룹 (2087:8449 layout_VWHNYV) | column gap 12 w414 | ✅(컷 후) | `features/social-login/ui/social-login-buttons.module.css` | Naver 제외 컷 |
| Google 버튼 (2087:8450) | bg #242424 r6 pad 18/14 h42 · 라벨 14/400/160% center #FAFAFA · 아이콘 22 | ✅ | `button.module.css` `.socialSolidDark` · `provider-icons.tsx` | - |
| Naver 버튼 (2087:8458) | 동일 폼 · 네이버 마크 | ❌ 누락(의도) | — | **ADR-0001 E1 컷**(스코프 외). 프레임엔 존재 |
| Kakao 버튼 (2087:8461) | bg #242424 · Kakao 마크 20 | ✅ | `social-login-buttons.tsx` | - |
| "또는" divider (2087:8445) | row gap10 · 좌우 라인 stroke rgba(255,255,255,0.16) · "또는" Cap2 12/400 #CECECE | ❌ 누락(의도) | — | E1 컷(이메일 경로 제거로 불필요) |
| 이메일 인풋 블록 (2087:8464~8470) | label "이메일" B4 · input #242424 r6 보더 0.08 pad18/14 h42 · placeholder #999999 · 헬퍼 13/160% | ❌ 누락(의도) | — | E1 컷 |
| "계속" CTA (2087:8474) | bg #66FF4B r6 h42 · 라벨 Bt1 15/600 #242424 | ❌ 누락(의도) | — | E1 컷 |
| 약관 문구 (2087:8475) | 13/400/130%/-2% center · {ts1}#B4B4B4 / {ts2}링크 underline #999999 / {ts3}#B4B4B4 | 🟡 부분 | `.terms` `.link` | 본문색 #B4B4B4 ✅. **링크 강조색이 #FAFAFA → 실측 #999999 underline**(low). center 정렬 ✅ |
| 우 프로모 패널 (Component 31 2557:26229) | x=966 y=8 · 946×1064 · bg rgba(255,255,255,0.04) · r8 | 🟡 부분 | `widgets/onboarding-promo/ui/promo-panel.module.css` | 컨테이너·헤딩 카피 ✅. **하단 일러스트가 실 YouTube 영상카드+자막+클립패널 목업 → 그라데이션 플레이스홀더**(G7, med) |
| 프로모 헤딩 (x=303 y=213) | 제목 24/600/130% #FAFAFA · 부제 14/400/160% #CECECE center | ✅ | `.copy/.title/.subtitle` | - |

## 섹션 대조표 — 온보딩 공통 그리드 (2087:8476/8726/8968/9228)

| Figma 섹션/요소 | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 프레임 | 1920×1080 · bg #121212 | ✅ | `pages/onboarding/ui/onboarding-page.module.css` | - |
| 헤더/로고 | x=32 y=28 w902 | 🟡 | `onboarding-header` | 로고 근사 마크(low) |
| 스텝퍼 (2087:8488) | row gap4 x=164 y=230 · 세그 40×4 r100 · active #66FF4B / inactive #434343 | ✅ | `widgets/onboarding-stepper` · `shared/ui/stepper` | step별 active 개수 ✅. [GAP-5] 진행 트랜지션 모션 미측정 |
| 헤딩 블록 (Frame 26) | column gap6 x=162 y=340 | ✅ | `features/onboarding-steps/ui/step-heading.module.css` | - |
| 단계 제목 | SemiBold 36/600/130%/-2% #FAFAFA | ✅ | `.title` (--text-onboarding-title) | - |
| 단계 부제 | Regular 16/400/160%/-2% #CECECE | 🟡 | `.subtitle` | ①③④ ✅. **② 연차 부제 실제 존재하나 impl 누락**(아래 High §2) |
| 칩 그리드 (Row, x=162 y=461) | row wrap gap14 · 직업 w609 / 그 외 w642 | ✅ | `chip-grid.module.css` · `step-config.ts` | 폭 분기 정확 |
| 칩 (Component 11 2087:11006) | hug · pad 10/18 gap10 h42 r6 · 보더 1px rgba(255,255,255,0.12) · 라벨 SemiBold 15/600/130% **#FFFFFF** | 🟡 | `shared/ui/chip` `.default` | 폼팩터 픽셀 일치. 글자색 #FFFFFF→impl #FAFAFA(FD3 흰색통일 의도, low) |
| **칩 selected 상태** | 정적 export 없음(프레임에 선택칩 미표시) | 🟡 갭 | `.default.selected` | 채움색 미측정 → 브랜드 보더+글자만. 실 selected 디자인 부재(med, 문서화됨) |
| 버튼 행 (Frame 2085669083) | row gap12 x=162 y=850 · 각 108×42 r6 | ✅ | `.buttonRow` · `button.module.css` `.compact` | - |
| 이전 버튼 | secondary: bg #121212 · 보더 0.12 · 라벨 15/600 #FAFAFA | ✅ | `.secondary` | step1 disabled ✅ |
| 다음/완료 버튼 | primary: bg #66FF4B · 라벨 15/600 #242424 | ✅ | `.primary` | 라벨 분기(다음/완료) ✅ |
| 우 프로모 패널 | (소셜과 동일 Component 31) | 🟡 | `onboarding-promo` | 동일 일러스트 갭(G7) |

### 단계별 옵션·카피 (실측 vs impl)

| 단계 | Figma 제목/부제 | Figma 칩 | impl 일치 |
|---|---|---|---|
| ① 직업 2087:8476 | "어떤 일을 하고 계신가요?" / "비슷한 동료들과 연결해 드려요." | 10개 (기획·PM…기타) w609 | ✅ JOB_OPTIONS 10 |
| ② 연차 2087:8726 | "경력이 어떻게 되시나요?" / **"비슷한 동료들과 연결해 드려요."(2087:8951 존재)** | 6개(취준생·학생/0~1…10년차 이상) w642 | 🟡 옵션 ✅, **부제 누락** |
| ③ 관심 2087:8968 | "관심 분야가 어떻게 되시나요?" / "선택하신 관심 분야를 바탕으로 맞춤 컨텐츠를 추천해 드려요." | 12개 w642 + 직접입력 | ✅ INTEREST 12 |
| ④ 목표 2087:9228 | "지금 어떤 목표를 향해 가고 있나요?" / "같은 방향의 동료들과 함께 성장할 수 있게 해 드려요." | 5개 w642 | ✅ GOAL 5 |

### ③ 관심분야 직접입력 (2087:9222 외)

| 요소 | 측정 | 상태 | impl |
|---|---|---|---|
| divider (2087:9227) | w642 1px rgba(255,255,255,0.08) | ✅ | `interest-custom-input.module.css` `.divider` |
| 헬퍼 텍스트 | 14/400/130%/-2% #CECECE "또는 관심 분야를 직접 입력하여…" | ✅ | `.helper` |
| 입력박스 (마크다운_콜아웃 2087:9224) | Textarea lg h64 pad10/12 보더 #363636 r6 · placeholder 14/160% #999999 "예) UX 리서치…" | ✅ | `Textarea mode=lg` · PLACEHOLDER |
| 직접입력 태그칩 | removable 태그 (§7) | ✅ | `Chip variant=tag removable` |

## 섹션 대조표 — 확장설치 모달 (2087:9468 / 카드 2087:10931)

| Figma 섹션/요소 | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 백드롭 | rgba(0,0,0,0.6) + 배경 블러 화면 | 🟡 | `shared/ui/modal` `.backdrop` | scrim ✅. 배경 블러 스크린샷은 모달 위치상 영향 적음 |
| 카드 (2087:10932) | 998×702 · bg #1F1F1F · r12 · shadow '모달'(3레이어 hairline 포함) | ✅ | `modal.module.css` `.panel` (--shadow-modal) | width=998 전달 |
| 좌 일러스트 (Group 1707483386) | 복잡 브라우저+확장 팝업 목업(영상·자막·클립패널 SVG, x=-678~) | 🟡 부분 | `extension-illustration.tsx` | 정적 자산 G7 → **단순 브라우저창 플레이스홀더**(med) |
| 섹션 라벨 (2087:10977) | x=525 y=116 · 14/400/130%/-2% #66FF4B "확장 프로그램 설치" | ✅ | `.sectionLabel` | - |
| 제목 블록 (2087:10974) | x=525 y=150 column gap8 w347 | ✅ | `.titleBlock` | - |
| 제목 (2087:10975) | Bold 28/700/130%/-2% #FAFAFA | ✅ | `.title` | - |
| 부제 (2087:10976) | Regular 16/400/130%/-2% #CECECE (2줄) | ✅ | `.subtitle` | - |
| 체크리스트 (2087:10978) | x=525 y=278 column · 각 행 row gap6 pad20/0 w383 | ✅ | `.checkList/.checkRow` | - |
| 체크 아이콘 (1626:14399) | 20×20 원형 활성 · 그린 원 #66FF4B + 다크 체크 | ✅ | `check-icon.tsx` | - |
| 체크 텍스트 (×3) | Medium 16/500/130%/-2% #FAFAFA · 앞2행 하단보더 0.08 | ✅ | `.checkText/.bordered` | 카피 3건 일치 |
| CTA 행 (2087:10971) | x=525 y=576 row gap12 · 각 128×42 r6 | ✅ | `.footer` · `.compactMd` | - |
| "나중에 하기" (2087:10972) | secondary 보더 0.12 · 15/600 #FAFAFA | ✅ | `Button secondary compactMd` | - |
| "설치하러 가기" (2087:10973) | primary bg #66FF4B · 15/600 #242424 | ✅ | `Button primary compactMd` | - |

---

## 인터랙션 체크리스트

| 인터랙션 | Figma 의도 | 구현 | 동작 |
|---|---|---|---|
| 소셜 버튼 클릭 → OAuth | 제공자 인증 | ✅ | `useSocialLogin.signIn` · 펜딩 시 Spinner leadingIcon |
| OAuth 콜백 라우팅 | 세션→게이트→온보딩/홈 | ✅ | `oauth-callback-page.tsx` (스코프 내 추가) |
| OAuth 에러/취소 → 토스트 | E6 Toast | ✅ | `login-page` error Toast |
| 칩 단일선택(①②④) | 클릭=교체 | ✅ | `selectJob/Years/Goal` |
| 칩 복수토글(③) | 클릭=add/remove | ✅ | `toggleInterest` |
| 관심 5개 초과 차단 | 6번째 차단+토스트 | ✅ | return 'max' → onNotify · 비선택칩 disabled |
| 직접입력 Enter 추가 | 줄바꿈 대신 추가 | ✅ | `onKeyDown` Enter |
| 직접입력 빈/중복 무시 | 토스트 | ✅ | 'empty'/'duplicate' |
| 태그칩 x 제거 | removable | ✅ | `onRemove` |
| 이전/다음 단계 이동 | step±1, 1단계 이전 disabled | ✅ | `goNext/goPrev` |
| 다음 비활성(필수 미선택) | disabled | ✅ | `canAdvance` |
| 완료 → RPC → 홈 | complete_onboarding | ✅ | `complete.mutate` → `/?onboarded=1` |
| 모달 자동노출(완료 직후) | E5 1회 | ✅ | `useExtensionModal(autoOpen)` |
| 모달 "나중에 하기"(재노출 억제) | localStorage dismiss | ✅ | `dismiss` markDismissed |
| 모달 "설치하러 가기" → 웹스토어 새 탭 | E4 | ✅ | `window.open` |
| 스텝퍼 진행 트랜지션(이징·시간) | 모션 미측정 | 🟡 | 정적 색 스왑 + DS 0.15s (GAP-5) |
| 칩/버튼 hover | 정적 export 부재 | 🟡 | 보더/면 합리값(gap, 문서화) |

## 상태 체크리스트

| 상태 | 구현 | 비고 |
|---|---|---|
| 기본 | ✅ | 모든 컴포넌트 |
| hover | 🟡 | 칩/버튼 hover 실측 부재 → 합리값(gap 주석) |
| active/pressed | 🟡 | 실측 부재 |
| selected(칩) | 🟡 | **default 칩 채움색 미측정 → 브랜드 보더만**(핵심 갭) |
| disabled | ✅ | 버튼 opacity 0.4 · 칩 0.4 |
| 빈(empty) | ✅ | 직접입력 빈값 무시 |
| 로딩 | ✅ | OAuth Spinner · callback 로딩 |
| 에러 | ✅ | Toast(소셜·온보딩 저장·관심 초과) |

---

## High severity 보완점 (즉시 수정 대상)

### §1 [의도 컷·확인 필요] 소셜 로그인 우 프레임이 Figma와 크게 다름 — Naver/이메일/divider/"계속" 부재
- Figma(2087:8221)는 Google+**Naver**+Kakao 3버튼 + "또는" divider(2087:8445) + 이메일 인풋(2087:8464) + "계속" CTA(2087:8474)를 모두 렌더. impl은 Google+Kakao 2버튼만.
- impl 근거: ADR-0001 **E1 컷**(소셜 OAuth만, 이메일/Naver 제외) — 의도된 스코프 축소.
- 판정: 기능 스코프상 정당하나 **프레임 대비 시각 차이는 실재**. 게이트ⓒ 사인오프 시 "E1 컷 확정"을 명시 확인할 것. 수정 불필요(컷 유지 시) / 또는 Naver 활성화는 별도 단위.

### §2 [실제 누락] ② 연차 단계 부제 누락
- Figma(2087:8726) 노드 **2087:8951** = "비슷한 동료들과 연결해 드려요." (style_D97LLF 16/400/160%/-2% #CECECE) — PNG 렌더로 부제 실재 확인.
- impl `features/onboarding-steps/model/step-config.ts` step 2 = `subtitle` 생략("②연차 부제 부재 G4"로 잘못 표기).
- **수정**: `step-config.ts` step 2 객체에 `subtitle: '비슷한 동료들과 연결해 드려요.'` 추가(①과 동일 카피). 헤딩 y=340 블록이 2줄로 ①과 정렬 일치.

### §3 [정적 일러스트 갭] 프로모 우패널 하단 일러스트 — 실 콘텐츠 목업 vs 그라데이션
- Figma는 우측 패널에 **YouTube 영상 카드(썸네일·재생·메타)+우측 자막/클립 패널** 정밀 목업(Component 31 하위 Group 1707483367, x=36 y=336 874×592 + 하단 그라데이션). impl은 `linear-gradient` 빈 카드.
- impl 근거: G7(정적 자산은 별도 파이프라인). 충실도 책임은 콘텐츠 영역 한정.
- **수정**: 실 일러스트 자산 export(`download_figma_images`로 Group 1707483367 PNG/SVG) 후 `promo-panel.module.css` `.illustration` 배경으로 교체. 자산 미확정 시 현 플레이스홀더 유지(문서화).

---

## Med/Low 보완점

- **[med] 소셜 부제 색 오정렬**: `login-page.module.css` `.subheading` 색 `--color-text-secondary`(#B4B4B4) → 실측 **#CECECE**(`--color-gray-550`). 온보딩 부제(`step-heading`)·프로모 부제는 이미 #CECECE라 일관성도 깨짐.
- **[med] selected 칩 채움색 미측정**: `chip.module.css` `.default.selected`가 브랜드 보더+글자만. Figma 정적 export에 선택칩 부재 → 실 디자인 확보 시(예: 프로토타이핑 인터랙션 프레임) 채움색 반영 필요. 현재는 정당한 갭.
- **[med] 모달 좌 일러스트 플레이스홀더**: `extension-illustration.tsx` 단순 브라우저창 → Figma 정밀 확장 팝업 목업. G7 자산 export 후 교체.
- **[low] 약관 링크 색**: `.link` #FAFAFA → 실측 {ts2} underline **#999999**. underline은 일치.
- **[low] 칩/헤딩 글자 #FFFFFF vs #FAFAFA**: Figma 칩·일부 텍스트 fill #FFFFFF. impl 흰색통일(FD3 #FAFAFA) — 사용자 결정에 따른 의도 차(5/255).
- **[low] 로고 마크**: Figma 실 Grabit SVG(IMAGE-SVG Union) vs impl 근사 헥사곤+라인 placeholder. 크기·위치는 일치. 실 SVG export로 교체 권장.

---

## 의도된 스코프 제외(정상 — 미구현 OK)
- 요금제 모달 2087:11010 = 게이트ⓐ 제외(결제 미구현).
- 소셜 Naver·이메일 경로 = ADR-0001 E1 컷.
- 정적 일러스트(프로모·모달 좌) = G7 별도 자산 파이프라인.
