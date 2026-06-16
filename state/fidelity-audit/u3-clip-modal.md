# Fidelity Audit — U3 Clip Modal (Step1 링크 + Step2 편집/트림/태그)

> 정밀 충실도 감사 (read-only). Figma 풀깊이 실측 vs 현재 구현 1:1 대조.
> fileKey `5GGyKsjXEOpjKMLtUodeSs` · 감사일 2026-06-16 (재감사: 하단/인터랙션 전수)

## 대상 프레임 (PNG 렌더 = 정본)
| 프레임 | nodeId | 모달 노드 | 렌더 PNG |
|---|---|---|---|
| Step1 링크 붙여넣기 | 2087:32073 | 2087:33536 | `u3-clip-modal/step1-modal-only.png` (3x) |
| Step2 편집(전) | 2087:33548 | 2087:35011 | `u3-clip-modal/step2-modal-only.png` (3x) |
| Step2 태그 입력 | 2087:35127 | 2087:36590 | `u3-clip-modal/tag-input-modal.png` (4x) · `tag-input-row.png` |
| Step2 태그 자동완성 | 2087:36708 | Row8 2087:38214 | `u3-clip-modal/tag-autocomplete-row.png` (3x) |
| Step2 태그 추가완료 | 2384:141451 | 2384:142914 / Row8 2384:142955 | (구조 실측, 아래 표) |

## 충실도 추정: **약 93%**
구현은 측정값 기반으로 매우 충실. 좌 트림(절대좌표 1:1), 우 4섹션(인사이트·공개·폴더·태그), 태그 4상태·전체 인터랙션, 토큰 전부 일치. **핵심 섹션/인터랙션 누락 없음.** 감점은 ① Step1이 공유 Modal 셸을 재사용해 헤더 타이틀 굵기·닫기 글리프·헤더 padding이 측정과 어긋남 ② 트림 길이 라벨 폰트크기·세로 틱 라인·일부 보더색 등 미세 차.

---

## Step1 — 링크 붙여넣기 모달 (582×364)

### 섹션 대조표
| Figma 섹션/요소 (nodeId) | 측정 정확값 | 구현 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 모달 셸 (2087:33536) | 582×364 · #1F1F1F · radius12 · shadow `0 20 48 -8 rgba(17,17,17,.24)`… | ✅ | shared/ui/modal/modal.module.css | width=582·토큰 일치 |
| 타이틀 "새 클립 추가" (2087:33544) | **Bold 700** · 20/130%/-2% · #FAFAFA · 헤더 66h · pad 24/24/24/28 · 보더 .08 | 🟡 | modal.module.css `.title` | weight=semibold(600), 헤더 pad=28/14/6 (측정 24/24/24/28과 불일치) |
| 닫기 (2087:33545=comp1230:5853) | Dismiss SVG 20×20 | ⚠️ | modal.tsx `.close` | 텍스트 "✕" 렌더(SVG 아님) |
| "링크 붙여넣기" 라벨 (2087:33539) | SemiBold 15 · #FAFAFA | ✅ | `.label` | 일치 |
| 헬퍼 (2087:33540) | Regular 13 · #B4B4B4 | ✅ | `.helper` | 일치 |
| URL 입력 (2087:33541) | w530 · pad14 · border 1px #363636 · radius6 · 13(Cap1_Rg) | 🟡 | `.input`+Textarea(link) | 폭 OK · 보더색 #363636 vs Textarea 토큰(.08?) 검증 |
| [다음] (2087:33546) | 156×38 · pad10/18 · #66FF4B · radius6 · SemiBold14 #121212 | ✅ | `.next`+Button(primary/small) | 일치 |

### 인터랙션·상태 (Step1)
- ✅ URL 검증(빈/형식) → [다음] disabled · ✅ Enter 제출 · ✅ 에러 alert(보강) · ✅ loading("불러오는 중…")·중복방지
- ⚠️ 닫기 글리프 텍스트 "✕" ↔ Figma 20 SVG

---

## Step2 — 편집 모달 (998×702)

### 헤더 (커스텀, 2087:35078)
| 요소 (nodeId) | 측정 | 구현 | impl |
|---|---|---|---|
| 헤더 바 | space-between · pad 20/24/20/28 · 보더 .08 · w998 | ✅ | `.header` |
| 썸네일 (35080) | 44×44 radius8 | ✅ | `.thumb` |
| 타이틀 "컨텐츠 추가" (35091) | Bold 700 · 20 · #FAFAFA | ✅ | `.title`(bold) — Step1과 달리 정확 |
| 영상제목 (35092) | Regular 13 · #CECECE · 말줄임 | ✅ | `.videoTitle`(gray-550·ellipsis) |
| 닫기 (35093) | 20 SVG | ✅ | CloseGlyph 20 SVG |

### 좌측 트림 (절대좌표 1:1)
| 요소 (nodeId) | 측정 | 상태 | impl |
|---|---|---|---|
| 영상 405×228 (35096) | y111 · radius8 · iframe | ✅ | `.video` |
| 풀스트립 405×52 (35097) | y353 · 하단보더 #434343 | ✅ | `.track` |
| 선택스트립(밝음) 187×52 (35098) | y353 crop | 🟡 | `.selection`+dim 근사(별도 밝은 크롭 미사용) |
| 세로 틱4 (35099~102) | 1px 30/28h · x28/159/290/402 · rgba(.16) | 🟡 | **세로 틱 라인 미구현** |
| 시간라벨 0:32/0:52/1:12/1:32 (35074~77) | Regular12 · 앞2 #FAFAFA·뒤2 #B4B4B4 | ✅ | `.tick`/`.tickDim` |
| 핸들 L/R (35120/35122) | #7FC573 · grip 2×24 #FAFAFA | ✅ | `.handle`+`.grip` |
| 선택바 상/하 (35124/35125) | 4px #7FC573 | ✅ | `.selectionBar*` |
| 재생헤드 (35126) | 3×52 x59 #BE1616 radius100 | ✅ | `.playhead` |
| 시작/끝칩 (35105/35108) | 82×38 pad10/26 border.08 radius4 14 #FAFAFA | ✅ | `.timeChip` |
| 화살표 (35107) | 짧은 vector rgba(.16) | 🟡 | `.arrow`(1px 선) |
| 길이 "29초" (35118) | **Regular 12(PB7RQB)** gap2 | 🟡 | `.length` font-size **14** (12여야) |

### 우측 4섹션
| 섹션 (nodeId) | 측정 | 상태 | impl |
|---|---|---|---|
| 인사이트 라벨 (35014) | Medium14 #FAFAFA | ✅ | clip-insight `.label` |
| 콜아웃 (35015) | 509×174 border #363636 radius6 pad10/12 B1_Rg #FAFAFA | 🟡 | `.memo`(h174 pad10/12) · 보더색 Textarea 토큰 의존 |
| 공개 라벨+설명 (35024) | Medium14 + T2_Rg14 #B4B4B4 gap5 | ✅ | clip-public `.label`/`.desc` |
| 토글 (35027~30) | 44×22 pad2/2/2/8 ON #2563EB knob18 #FAFAFA stroke.24/.5 이중그림자 | ✅ | shared Toggle — 정확 일치 |
| 폴더 라벨 (35044) | Medium14 | ✅ | clip-folder `.label` |
| 폴더 셀렉트 (35045) | 509×38 pad12/10/12/14 border.08 radius6 "창업가 정신" Medium14 chevron | 🟡 | Dropdown(h38 pad일치) · bg: Figma 투명(보더만) vs surface-ghost(.04) |
| 태그 라벨 (35053) | Medium14 | ✅ | clip-tags `.label` |
| [추가] 칩 (2384:141372) | 28h pad6/10/6/8 #242424 border.08 radius6 "+"16↔"추가"gap3 Cap1_Md13/500 | ✅ | Chip(add) |
| 태그칩×3 (35059/64/69) | 28h pad10/8/10/10 gap2 bg.06 13/400/160% #CECECE X16 | ✅ | Chip(tag·ceceTone·removable)+CancelIcon |
| [완료] (35094) | 156×38 #66FF4B radius6 SemiBold14 #121212 우정렬 | ✅ | `.footer`/`.done`+Button |

---

## 태그 인터랙션 4-상태 (전수)

### 상태2 입력 (2087:36631)
- 입력칩 193×28 pad6/10/6/8 #242424 border.08 radius6 ✅ · "+"16+캐럿(Rect34719 1.25×16 #FAFAFA)+placeholder "입력 후 Enter로 추가해 보세요." 13 #999999 ✅

### 상태3 자동완성 (2087:38214) ★핵심
- 패널 193w pad4 bg rgba(.04) border.08 radius6 shadow `0 0 8 rgba(0,0,0,.07)` ✅ `.menu`
- 추천행 h28 pad2/6 radius4(첫)·3 · 첫행 활성 bg rgba(.06) ✅ `.menuItem`/`.menuItemActive`
- **부분강조: 매칭부 #FAFAFA + 비매칭부 #999999(ts1)** (개발자=개발흰+자딤 / 클라우드딤+개발흰) ✅ highlight.ts(substring 3분할)+segMatched/segDim — **정확**

### 상태4 추가완료 (2384:142955)
- 추가된 "개발자"가 **[추가]칩 뒤·기존칩 앞**(추가→개발자→업무생산성→창업→마인드셋) ✅ `onChange([label,...tags])` front-insert — **순서 정확**
- 신규칩 = removable tag chip(h28 pad10/8/10/10 #CECECE X16) ✅

### 인터랙션 체크리스트 (태그)
- ✅ [추가]→입력모드+포커스 · ✅ 입력→패널 열림(빈쿼리 닫힘) · ✅ ↑/↓ wrap · Enter 선택/추가 · Esc · Backspace(빈) 마지막칩 제거
- ✅ 추천 hover/click · mousedown preventDefault(blur 방지) · ✅ 추천0건 "Enter로 X 추가" · ✅ 중복/빈/기추가 제외 · ✅ 칩X 제거(버블 차단)

## 상태 체크리스트 (전역)
- 기본 ✅ · hover ✅(close·dropdown item·chip) · active(자동완성 활성행) ✅ · selected(폴더 항목 흰배경) ✅ · 빈(폴더0개 "폴더가 없어요"·추천0건) ✅ · 로딩(Step1 "불러오는 중…") ✅ · 에러(Step1 무효링크·트림 구간 무효) ✅

---

## High Severity (즉시)
1. **[Step1 타이틀]** 공유 Modal `.title` SemiBold(600) — Figma "새 클립 추가" Bold 700. fix: modal.module.css `.title` font-weight → bold(700) 또는 Step1 커스텀 헤더. (측정 style_BLJ0UH=700/20)
2. **[Step1 닫기]** 공유 Modal close 텍스트 "✕" — Figma 20px SVG. fix: modal.tsx close 글리프를 SVG로(Step2 CloseGlyph 재사용). (impl: shared/ui/modal/modal.tsx)
3. **[Step1 헤더 padding]** `.header` 28/14/6 — Figma 24/24/24/28. fix: modal.module.css `.header` padding 측정값으로. (단, 다른 모달 공유 영향 검토)

## Med Severity
- **[트림 길이]** "29초" font-size 14 → Figma 12. fix: clip-trim.module.css `.length` text-caption-2(12). 
- **[트림 세로 틱]** 4개 세로 1px 틱 라인(rgba(255,255,255,.16), 28/30h, x28/159/290/402) 미구현. fix: clip-trim에 tick 라인 absolute 추가.
- **[보더색]** 인사이트 콜아웃·URL 입력 Figma 보더 #363636(Dark-Stroke-300) ↔ Textarea border-subtle(.08) 가능성. Textarea mode 토큰 검증.
- **[폴더 bg]** Figma 박스 투명(보더만) ↔ Dropdown surface-ghost(.04). 미세 톤.
- **[선택 스트립]** Figma 밝은 크롭 이미지 ↔ 비선택 딤 오버레이(시각 동등).

## Low Severity
- 칩 구분 화살표(짧은화살표 vector) ↔ 단순 1px 선.

## PNG 참조
`state/fidelity-audit/u3-clip-modal/`: step1-modal-only.png · step2-modal-only.png · tag-input-modal.png · tag-input-row.png · tag-autocomplete-row.png
