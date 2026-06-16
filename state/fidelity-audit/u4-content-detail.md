# 충실도 감사 — content-detail (u4)

- 대상 fileKey: `5GGyKsjXEOpjKMLtUodeSs`
- 프레임: `2087:12538`(시청정보 탭·사이드바450) · `2087:13354`(원본소스 탭) · `2087:13772`(사이드바60)
- 감사일: 2026-06-16 · read-only(코드 변경 없음)
- PNG: `state/fidelity-audit/u4-content-detail/` (watch-info / source / collapsed / analytics-group / popular-ranking / popular-left/right-card / insights-row / similar-row / similar-card-one / sidebar-expanded / sidebar-detail / sidebar-collapsed / barchart-panel)

## 충실도 추정: ~68%
상단(플레이어·히트맵·메타·액션·세그먼트 토글)과 원본소스 탭은 구조·픽셀 양호(85%+). 하단 분석 그룹은 섹션은 모두 존재하나 **3개 핵심 구조가 Figma와 다르게 구현**됨: ① 코호트 배너 칩 구성(1칩+아바타 vs 2칩) ② 인기있는 구간 2패널 헤더 배치(좌=배너/우=제목) ③ 좌 막대차트가 연차-스택 다색 막대인데 단색 랭크-색 막대로 구현. 인터랙션(탭/토글/seek)은 대부분 배선됨. 댓글/좋아요는 의도적 비활성(DM1).

---

## 프레임별 섹션 좌표 맵 (실측, 펼침 2087:12538 기준, content rect 270,8 1642×2207)

| Y(global) | 섹션 | nodeId | 실측 |
|---|---|---|---|
| 82 | 플레이어 | 2087:12652 | 288,82 **1156×650** (16:9, radius10) |
| 734 | 히트맵 | 2875:19656 | 292,734 1148×18 |
| 770 | 메타 타이틀+액션 | 2087:12632 | 292,770 1148, 타이틀 22/700 #FFF |
| 812 | 날짜·그랩·태그 | 2087:12653 | 292,812 row gap12 |
| 1004 | 디바이더 | 2087:12672 | 288,1004 1156×0 (1px line) |
| 1032 | 세그먼트 pill(시청정보/원본소스) | 2087:12540 | 288,**1032** Nonex36 pill r100 .04bg |
| 1096~ | 분석 그룹 | 2087:12684 | 288,1096 1153×1035 |

> ★주의: 세그먼트 pill의 Figma 절대좌표는 y1032(디바이더 아래)지만, 구현은 플레이어 좌상단 오버레이로 배치(content-detail-page.tsx `segmentOverlay` top/left=space-9). 두 프레임(시청/원본) 모두 pill이 디바이더 아래 좌표로 찍히나, 렌더 PNG에선 플레이어 좌상단에 표시됨 → 구현 오버레이 위치가 렌더와 일치. **좌표 자체는 신뢰 불가, 렌더가 정본.**

---

## 섹션 대조표

| Figma 섹션/요소 (nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 플레이어 (2087:12652) | 1156×650 16:9, radius10, YT 임베드 | ✅ 완전 | video-player.tsx | aspect 1156/650 유지. unavailable 폴백 있음. |
| 세그먼트 토글 (2087:12540) | pill h36 r100 .04bg, inner 활성칩 #363636 r100 pad8/12, "시청 정보"/"원본 소스" | ✅ 완전 | content-detail-page.tsx ContentSegment + shared Tabs(variant=segment) | 좌상단 오버레이 배치(렌더 일치). |
| 히트맵 (2875:19656) | 컨테이너h18, 트랙h6 .12, 진행h6 #777, 피크25×18·틱21×15 #26FA01 ▼마커 | ✅ 완전 | clip-heatmap.tsx/.css | 마커 seek 배선. density 0→트랙만. |
| 메타 타이틀 (2087:12633) | 22/700/-2% #FFF ellipsis | ✅ 완전 | content-detail-page.tsx MetaRow | |
| 액션 row (2087:12634) | 원본링크(보더 #363636 h34)·좋아요(보더 h34)·클립추가(#EFEFEF h34) | ✅ 완전 | LikeButton·AddClipButton·originLink | 3버튼 모두 존재·픽셀 양호 |
| 날짜·그랩·태그 (2087:12653) | 날짜 14/400 #B4B4B4 · dot2×2 #999 · 그랩(cast18) · 태그칩 h24 r4 .06bg #CECECE | ✅ 완전 | content-detail-page.tsx subMetaRow | |
| 디바이더 (2087:12672) | 1px rgba(255,255,255,.08) | ✅ 완전 | content-detail-page.tsx .divider | |
| **코호트 배너 (2087:12838)** | "이 컨텐츠를 " + **칩1 "프로덕트 디자이너"** + **칩2 "3~5년차"**(각 h28 r4 .04bg+.08border, **아바타 없음**) + "가 많이 봤어요" 20/700 | ⚠️ 틀림 | cohort-banner.tsx/.css | 구현은 **1칩(아바타+full라벨)**. Figma는 **2칩(직군/연차 분리, 아바타 없음)**. |
| **인기있는 구간 제목 (2087:12847)** | "가장 인기있는 구간" 20/700, **우측 카드(x812,y24) 헤더**로 배치 | ⚠️ 틀림 | popular-segments.tsx .title | 구현은 2col grid **위 전체폭 제목**. Figma는 좌=배너헤더/우=제목헤더 **나란히**. |
| 좌 카드 막대차트 (2087:12902 + bars 12904~12916) | 패널 728×223 r12 .04bg, **4행 각 517×12 스택 다색막대(violet/mint/magenta=연차)** + 랭크번호1~4 + 직군라벨 | ⚠️ 틀림 | popular-segments.tsx leftCard | 구현은 **행마다 단색1개(랭크색)** + width=count비율. Figma는 **연차 3색 스택**(범례=연차). 색 의미가 랭크↔연차로 뒤바뀜. |
| 좌 카드 랭킹 라벨 (2087:12920) | 1 프로덕트 디자이너 / 2 백엔드 개발자 / 3 IT 기획자 / 4 이 외 직군 | 🟡 부분 | popular-segments.tsx ranking ol | 라벨 텍스트는 cohort.ts 도출로 일치 가능. 단 막대=단색. |
| 좌 카드 연차범례 (2087:12937) | ~2년차/3~5년차/6~9년차, dot4×4, 16gap | ✅ 완전 | popular-segments.tsx yearsLegend | 색 매핑 violet/mint/magenta 일치. |
| **우 카드 인기클립 리스트 (2087:12850/12851)** | 행 pad20/0 보더.08, 썸네일70×40 r2 + "10:11~12:42"(cast18) + **"7명이 그랩함"** + 화살표20 | ⚠️ 틀림 | popular-segments.tsx rightCard | 구현 2번째줄 **"그랩한 구간"(정적)**. Figma="**N명이 그랩함**"(그랩수). |
| 인사이트 섹션 제목 (2087:12948) | "인상깊게 본 인사이트" 22/700(또는 20) | ✅ 완전 | watch-info-tab.tsx sectionTitle | |
| 인사이트 카드 row (2087:12947/12949) | row gap14, 298×208 카드 ×N, 우측 -90deg 페이드(108×208) | ✅ 완전 | watch-info-tab + insight-card.tsx + .insightFade | 채널아바타+코호트(violet)+메모+구간카드+좋아요·시간 모두 존재. |
| 비슷한 컨텐츠 (2087:12684/12685/12686) | 제목 + row gap28, **252×232** 카드 ×5(썸네일252×142 r6 + YT오버레이 + 2줄제목 + 태그칩×2 + N개) + 우 페이드 | ✅ 완전 | similar-content.tsx | clipCount→"16개" 일치. onSelect 라우팅. |
| 원본소스 카드 (2087:13500) | 1156×321 r12 .1border pad24/28, 좌 정보패널 676×223 .04bg r12 + 우 썸네일 396×223 r6 | ✅ 완전 | source-tab.tsx/.css | 제목/상세(채널·조회수)/원본링크(YT+URL) 구조 일치. 조회수 "48만회" 하드코딩(목). |
| **우 사이드바 탭바 (2557:23066)** | h56, "인사이트(16)"(16/600) **+ "AI 노트"(16/500)** 2탭 underline, collapse토글 우측, border-bottom #2D2D2D | 🟡 부분(의도) | social-sidebar.tsx tabBar | **AI 노트 탭 의도적 미렌더(게이트ⓐ)** — 단일 인사이트 탭만. 문서화된 제외. |
| 작성 버튼 (2557:23065) | #333 r7 pad10/18 "작성" 14/600 #FFF, 탭바 위 우측 | ✅ 완전 | social-sidebar.tsx writeRow(Button solidGray) | |
| 댓글 카드 (2557:23092~) | 이름13/500 #B4B4B4 + **코호트라벨(violet #727AD0, 11/500) 하단** + 본문14/400 #FFF + 구간"10:11~12:42"(14/FAFAFA) + 좋아요"3"+"답글3개 모두 보기"(13/500 #999) + **"1시간 전"(12/400 #999 우하단 절대배치)** | 🟡 부분 | comment-card.tsx/.css | 코호트라벨이 **헤더(이름 옆)**에 위치 vs Figma는 footer영역. "1시간 전" 헤더 우측 vs Figma 카드 우하단. 구간 칩에 **썸네일(우측)** 누락(렌더엔 썸네일 있음). |
| 하단 페이드 (2557:23289) | 449×48 linear 180deg→#121212 + backdrop blur2 | ✅ 완전 | social-sidebar.css bottomFade | |
| **답글 reply 카드** | 댓글 하위 replies(들여쓰기, "답글 3개 모두 보기"로 펼침) | ❌ 누락 | (없음) | DEMO_COMMENTS.replies 데이터는 있으나 **렌더 안 함**. "모두 보기"=비활성(DM1). 펼침 UI 없음. |
| **reply 컴포저(하단 입력)** | sidebar-expanded 렌더 하단 "○ 한성태 / 의견 스레드로 답해보…" 입력행 | ❌ 누락 | (없음) | 하단 답글 입력 composer 미구현. |
| 사이드바 접힘 (2087:14297) | 60px, #121212, 우하단r8, collapse토글(상단) + (작성 38px 인스턴스) | 🟡 부분 | social-sidebar.tsx collapsed | 구현=토글 + **세로 "작성"텍스트**. Figma 렌더는 **토글만**(작성 인스턴스 off-frame). 구현이 세로작성 추가. |
| 사이드바 펼침↔접힘 리플로우 | 펼침 player1156 / 접힘 player**1546**(본문폭 사이드바 폭차 반영) | ✅ 완전 | content-detail-page.tsx collapsed state + flex | 본문 flex 자동 리플로우. |

---

## 인터랙션 체크리스트

| 인터랙션 | Figma | 구현 | 상태 |
|---|---|---|---|
| 시청정보↔원본소스 탭 전환 | 세그먼트 pill | `tab` state, 본문 스왑 | ✅ |
| 사이드바 펼침↔접힘 토글 | collapse 버튼(layout-right) | `collapsed` state + 본문 리플로우 | ✅ |
| 히트맵 마커 클릭→seek | ▼마커 | `onSeek`→playerRef.seekTo | ✅ |
| 인기클립 행 클릭→seek | 행 화살표 | clipButton onClick→onSeek | ✅ |
| 인사이트 카드 클릭→seek | 카드 | InsightCard onClick→onSeek | ✅ |
| 비슷한컨텐츠 카드 클릭→라우팅 | 카드 | onSelect→navigate(/content/:id) | ✅ |
| 좋아요 토글 | 액션 버튼 | 낙관적 토글(미인증→login) | 🟡 목(BE 미배선, 의도) |
| 클립 추가 | 액션 버튼 | no-op 트리거(미인증→login) | 🟡 트리거만(u3 소관) |
| 작성 버튼 | 사이드바 | 미인증→login, 인증→no-op | 🟡 비활성(DM1) |
| 댓글 좋아요 클릭 | 하트 | 미배선(목 카운트만) | 🟡 의도 비활성 |
| **답글 펼침("모두 보기")** | 답글 스레드 펼침 | **클릭 핸들러 없음** | ❌ 비인터랙티브 텍스트 |
| **AI 노트 탭 전환** | 2번째 탭 | **탭 미렌더** | ❌ 의도 제외(게이트ⓐ) |
| 인사이트/비슷한 가로 스크롤 | overflow-x | `.insightRow`/`.row` overflow-x:auto | ✅ |
| 버튼 hover/focus | — | focus-visible outline 다수 | 🟡 hover 일부만 |

---

## 상태 체크리스트

| 상태 | 구현 | 비고 |
|---|---|---|
| 기본 | ✅ | |
| 로딩 | ✅ | LoadingBody 스켈레톤(플레이어/히트맵/메타/카드행). similar loading. |
| 에러(404) | ✅ | ErrorBody(콘텐츠 없음 + 홈복귀) |
| 빈(인사이트 0건) | ✅ | "아직 공유된 인사이트가 없어요" / 인기구간 빈상태 / 비슷한 빈상태 |
| 영상 unavailable | ✅ | video-player 폴백(원본링크) |
| hover | 🟡 | collapseToggle만 명시 hover. 카드/버튼 hover 다수 미정의 |
| active/selected | 🟡 | 좋아요 aria-pressed/liked. 탭 selected는 shared Tabs |
| 미인증 | ✅ | 좋아요/클립추가/작성 → 로그인 유도 |

---

## High severity 보완점 (즉시 수정 대상)

1. **답글 스레드 + reply 컴포저 미구현 (missing-section)** — Figma 사이드바는 댓글마다 답글 펼침 + 하단 입력 composer. impl은 "답글 N개 모두 보기"가 클릭 불가 텍스트, replies 데이터(DEMO_COMMENTS.replies) 미렌더, 하단 composer 없음. *수정*: comment-card.tsx에 펼침 state + reply 카드(들여쓰기) 렌더, social-sidebar.tsx 하단에 입력 composer 행 추가(DM1 비활성이라면 최소 UI 셸).

2. **코호트 배너 칩 구조 틀림 (wrong-structure)** — Figma=2칩("프로덕트 디자이너"/"3~5년차", h28 r4 .04bg+.08border, 아바타 없음). impl=1칩(아바타+합친 라벨). *수정*: cohort-banner.tsx를 직군칩 + 연차칩 2개로 분리, Avatar 제거(또는 Figma 재확인). topCohortLabel을 {job, years} 튜플 반환으로.

3. **인기있는 구간 좌 막대차트 색 의미 틀림 (wrong-structure)** — Figma 각 행=연차 3색(violet/mint/magenta) 스택 막대(범례=연차). impl=행마다 단색(랭크 인덱스 색) + count 비율 폭. *수정*: popular-segments.tsx rankBar를 연차버킷별 스택 세그먼트(~2/3~5/6~9년차)로. 데이터는 cohort.ts에서 직군×연차 교차 집계 필요.

4. **인기클립 리스트 2번째 줄 텍스트 틀림 (pixel-mismatch/wrong)** — Figma="N명이 그랩함"(그랩 수). impl="그랩한 구간"(정적). *수정*: popular-segments.tsx `.clipGrab`를 `{count}명이 그랩함`으로(클립별 grab count 필요).

5. **인기있는 구간 2패널 헤더 배치 (wrong-structure)** — Figma=좌카드 헤더에 코호트배너, 우카드 헤더에 "가장 인기있는 구간" 제목(나란히). impl=배너 전체폭 위 + 제목 grid 위(세로 스택). *수정*: 코호트배너를 좌 카드 안 헤더로, 제목을 우 카드 안 헤더로 이동(2패널 그리드 안에 헤더 포함).

## Med 보완점
- 댓글 코호트라벨 위치(헤더 vs footer), "1시간 전" 위치(헤더 우측 vs 카드 우하단 절대배치).
- 댓글 구간 칩 우측 썸네일 누락(렌더엔 클립 썸네일 있음).
- 접힘 사이드바 세로 "작성" 텍스트 — Figma 렌더엔 토글만(구현이 추가).

## 의도적 제외(가gap 아님, 문서화됨)
- AI 노트 탭 / Sparkle FAB 미렌더(게이트ⓐ).
- 좋아요/작성/댓글좋아요 BE 미배선(DM1 옵션1, UI+목킹).
