# Fidelity Audit — Home 페이지 (u2)

- 대상 fileKey: `5GGyKsjXEOpjKMLtUodeSs`
- 정본 프레임: `2087:70384` (풀스크롤 1920×4589, 우 패널 펼침) · `2087:69031` (취향관 기본, 우 패널 **접힘**) · `2087:71867` (피드, 우 패널 **접힘**) · `2173:105190` (칩 active) · `2278:135621` (재필터)
- 구현 루트: `/Users/suho/Desktop/Grabit/apps/web/src/`
- PNG: `state/fidelity-audit/u2-home/` (2087-70384-fullscroll.png, right-sidebar-panel.png, footer-nav.png, trend-grid.png, 2087-69031-collapsed.png)

## 충실도 추정: **약 52%**
중앙 컬럼(취향관 상단: 히어로·칩·추천 캐러셀·크로스 트렌드)과 좌 GNB·톱바는 잘 구현됨. 그러나 **(1) 풀스크롤 하단 섹션(분야별 트렌드 그리드·푸터)·토스트 인사이트 배너**와 **(2) 우측 사이드바 패널의 펼침/접힘 토글 + 토글 바 + AI FAB**가 통째로 빠져 있다. 우 패널 콘텐츠(RecommendationRail)는 인라인 컬럼으로 존재하나 Figma의 *오버레이 토글 패널* 구조가 아니며 카드 내부 구조도 어긋난다.

---

## 섹션 대조표

| Figma 섹션/요소 (nodeId) | 측정 정확값 | 구현 상태 | impl 파일 | 보완점 |
|---|---|---|---|---|
| 좌 GNB Sidebar (2087:70381 / I…1306:4230) | 컨테이너 254, 패널 226(inset14), #121212, r8, 프로필카드 226×50 pad8/12 r10 | ✅ 완전 | widgets/sidebar/ui/sidebar.tsx · sidebar.module.css | 일치 |
| 톱바 (2087:69671 / 2087:71639) | h56, #121212, r8/8/0/0, border-bottom 1px rgba(255,255,255,0.08), 우 pill 페어 gap12 | ✅ 완전 | widgets/topbar/ui/topbar.tsx | 일치(우 패널 토글은 톱바가 아니라 별도 엣지 바 — 아래 참조) |
| 히어로 캐러셀 (2087:70387 / 2087:71885) | 329~434h, 이미지 FILL + -90° 페이드 그라디언트(#0A0A0A), 좌 inset 40 y157, gap42, 썸네일 스트립 + 페이지 닷 | 🟡 부분 | widgets/home-feed/ui/hero-carousel.tsx | 데이터 null이면 전체 collapse(`if(!data) return null`) — 콜드스타트 시 히어로 영역 사라짐. Figma는 항상 존재. |
| 1차 세그먼트 취향관/피드 (2087:70406 / 2087:69196 Control/Segmented) | 펼침 167×40 pad4 r100, fill rgba(255,255,255,0.04), 선택=흰/비선택 #999999 | ✅ 완전 | features/feed-segment/ui/feed-segment.tsx | 일치(탭 전환 동작 O) |
| 관심분야 칩 행 (2173:120904 / active 2173:105190) | row gap30, 아바타 xl + 라벨, 선택 링 brand 2px, 라벨 #66FF4B | 🟡 부분 | features/interest-chip-row/ui/interest-chip-row.tsx | 단일선택·active 링 O. "분야 추가" 칩 = no-op(모달 스코프 외, 의도). 칩 active 색 토큰 확인 필요. |
| 추천 캐러셀 "○○이 많이 본 컨텐츠" (2087:69247) | 제목 Title1/Bold 24/-2.5% #FAFAFA, 좌 x14, 카드행 gap4, 379h | ✅ 완전 | widgets/home-feed/ui/feed-tab-default.tsx | 일치 |
| 직군별 크로스 트렌드 (2087:69497 / 재필터 2278:136026) | 그룹 1700×359 y1283, 제목 + underline 탭(분야 재필터), 카드 캐러셀 | ✅ 완전 | widgets/home-feed/ui/cross-trend-section.tsx | 탭 재필터 동작 O |
| **토스트 인사이트 와이드 배너 "오늘 발견되는 토스트 인사이트"** (2087:71147/2087:71165 영역, 풀스크롤 중단) | 좌측 1188×379 그룹 + 우측 와이드 이미지 배너("토스트 인사이트로 만나요"), r12 | ❌ 누락 | (없음) | 풀스크롤 PNG 중단의 와이드 배너 섹션이 **구현 안 됨**. (취향관 기본 프레임 69031에는 미노출일 수 있으나 풀스크롤 70384에는 존재 — 디자인 확정값 재확인 후 추가) |
| **분야별 트렌드 그리드 (2087:71184 / 69031의 2087:69678)** | 컨테이너 1160(69031=1549) column gap16, 행=row gap4(아이템 pad14), **4행×3열 = 12 카드**, 카드 356×461, shadow 0 4 16 rgba(0,0,0,0.24), 카드별 카테고리 배지+제목+썸네일+채널+날짜 | ❌ 누락(취향관 기본 탭) | widgets/home-feed/ui/feed-tab-default.tsx (없음) · 피드 탭에는 feed-tab-stream.tsx에 GridCard 존재 | **취향관(default) 탭이 크로스 트렌드 이후 즉시 끝남.** 풀스크롤 정본 70384·69031 모두 취향관 default에 12카드 트렌드 그리드가 하단에 존재. FeedTabDefault에 GridCard 그리드 섹션 추가 필요. |
| **푸터 Nav (2087:71659 / 2087:69291 / 2087:73236)** | y4150~, pad 84px top, gap24, separator 1px rgba(255,255,255,0.08), Nav pad40, 4 링크 컬럼(Company/Communities/Useful links/Spotify Plans) + 로고 + ©2025 + 소셜 3아이콘(IG/Twitter/FB), 컬럼 gap76~192 | ❌ 누락 | (없음) | 페이지 어디에도 **푸터 없음**. home-feed 또는 home-page 하단에 푸터 위젯 추가 필요(footer-nav.png 참조). |
| **우측 사이드바 패널 "내 취향에 맞는 실시간 그랩" (2087:71744)** | **420×1108**, #121212, r8, 위치 x1492(오버레이), 헤더행 420×56 pad16 gap12 + **접힘 토글 아이콘(2087:71747, 32×26 r6, layout-right-18px)** + "작성" 버튼(#333333 h38 pad10/18 r7), 제목 18 Bold -2.5% #FFFFFF, 리스트 380w gap28(가변 167~190h), 하단 페이드 420×48 blur(2px) | 🟡 부분(구조 틀림) | widgets/home-feed/ui/recommendation-rail.tsx · home-feed.module.css | RecommendationRail은 **인라인 flex 컬럼**(420 고정, 1180px↓ 숨김)일 뿐 — Figma의 **오버레이 토글 패널 아님**. 헤더의 접힘 토글 아이콘 **없음**. 헤더 레이아웃(420×56 pad16)·하단 페이드 그라디언트(420×48 blur2)·"작성" 버튼은 있으나 위치/구조 상이. |
| ↳ 우 패널 그랩 카드 (2087:71777 / 71798…) | 카드 380w, 헤더행=아바타+이름+**역할 배지(예 "7년차 UX 리서처" 11/Medium #B472D0)**+**"1시간 전"(12/Regular #999999 우측 x337)**, 본문 인용문, 임베드 카드(제목+소스 썸네일+우측 썸네일) | ⚠️ 틀림 | entities/recommendation/ui/grab-card.tsx | 구현은 역할+시간을 **footer**에 둠. Figma는 역할·시간이 **헤더행**(아바타·이름과 같은 줄, 시간은 우측 정렬). 헤더 1줄(아바타+이름+역할배지+시간) → 본문 → 임베드 순서로 재구성 필요. |
| **우측 토글 엣지 바 (접힘 상태) (2087:70377 / 2087:73332 "Frame 2085668535")** | **40×1080**, #121212, r8/0/0/8, x1879 y8, 중앙 화살표 아이콘(짧은 화살표2, 24×24), pad 623 0 | ❌ 누락 | (없음) | 우 패널 **접힘 상태 + 펼침/접힘 토글 자체가 없음**. 69031·71867 프레임은 이 40px 엣지 바만 노출(패널 접힘). 토글 버튼/상태 추가 필요. |
| **AI FAB 스파클 (2087:71864 / 2087:70382 / 2087:73336)** | **44×44**, #1F1F1F, border 1px rgba(255,255,255,0.08), r21, pad9, Sparkle mini 24×24, x1807 y1016(우하단 고정) | ❌ 누락 | (없음) | 우하단 고정 AI 스파클 FAB **없음**. (코멘트상 "AI 패널·FAB와 별개"로 스코프 제외했으나 프레임 정본엔 존재 — 디자인 확정값 재확인) |
| 우측 톱바 펼침 화살표 아이콘 (2087:71649 아이콘_화살표) | 16×16 x1871 y379 | ❌ 누락 | (없음) | 패널 펼침 시 콘텐츠 우상단 16px 화살표(패널 헤더 토글과 연동) 미구현 |
| 실시간 인기 그랩 (피드 탭, 2087:71867) | StreamCard row + divider | ✅ 완전(피드 탭) | widgets/home-feed/ui/feed-tab-stream.tsx | 피드 탭 내 구현 O |
| 현직자 인사이트 (피드 탭, 2087:73087) | 제목 + underline 탭 + CrossCard 행 | ✅ 완전(피드 탭) | widgets/home-feed/ui/insight-section.tsx | 피드 탭 내 구현 O |
| 분야별 트렌드 그리드 (피드 탭, 2087:72353) | 1549 column gap16, GridCard 4×3 | ✅ 완전(피드 탭) | widgets/home-feed/ui/feed-tab-stream.tsx | 피드 탭에는 그리드 O(취향관 탭엔 없음 — 위 참조) |

---

## 인터랙션 체크리스트

| 인터랙션 | Figma | 구현 | 비고 |
|---|---|---|---|
| 취향관/피드 세그먼트 탭 전환 | O | ✅ | useState segment, 본문 스위치 O |
| 관심분야 칩 단일선택 재필터 | O | ✅ | setField → queryKey 재필터 |
| 크로스 트렌드 underline 탭 재필터 | O | ✅ | setField → useCrossTrend |
| 피드 카테고리 칩 필터 | O | ✅ | feed-category-filter |
| **우 사이드바 패널 펼침/접힘 토글** | O (70384 펼침 ↔ 69031/71867 접힘 40px 바) | ❌ | 토글 상태·버튼·엣지 바 전부 없음 — **High** |
| **우 패널 헤더 접힘 아이콘 클릭** | O (2087:71747) | ❌ | 없음 — **High** |
| **AI FAB 클릭** | O (44×44 sparkle) | ❌ | 없음(스코프 명시 제외였으나 정본 존재) |
| "작성" 버튼 클릭 | O (#333 h38) | 🟡 | 버튼 렌더 O, 콜백 no-op(의도) |
| 히어로 페이지 닷/캐러셀 슬라이드 | O (페이지 닷 3개) | 🟡 | 닷 렌더 O(aria-hidden 정적), 슬라이드 동작 없음 |
| 카드 hover | (디자인상 상태 불명확) | 🟡 | recentItem 등 일부 hover만 |
| 카드 클릭 → 상세 이동 | O | ✅ | onSelect → navigate(/content/:id) |

---

## 상태 체크리스트

| 상태 | 구현 위치 | 결과 |
|---|---|---|
| 기본 | 각 섹션 | ✅ |
| 로딩 | CardSkeleton (rec/cross/stream/grid/grab) | ✅ |
| 빈(empty) | SectionEmpty | ✅ |
| 에러 | SectionError + onRetry | ✅ |
| hover | nav/recent 일부만 | 🟡 부분 |
| active/selected | 세그먼트·칩·탭 | ✅ |
| 우 패널 접힘/펼침 | (없음) | ❌ |

---

## High severity 보완점 (즉시 수정 대상)

1. **취향관(default) 탭 — 분야별 트렌드 12카드 그리드 누락**
   - Figma: `2087:71184`(70384) / `2087:69678`(69031). 컨테이너 1160(또는 1549) column gap16, 행=row(아이템 pad14, gap4), **4행×3열=12 카드**, 카드 356×461, shadow `0 4 16 rgba(0,0,0,0.24)`, 카드별 카테고리 배지+제목+썸네일+채널+날짜.
   - 수정: `widgets/home-feed/ui/feed-tab-default.tsx` 크로스 트렌드 다음에 `GridCard` 그리드 섹션(useTrendGrid) 추가. CSS는 `feed-tab-stream.tsx`의 `gridRow` 패턴 재사용. (PNG: trend-grid.png)

2. **푸터 Nav 누락**
   - Figma: `2087:71659`/`2087:73236`. y4150~, separator 1px rgba(255,255,255,0.08), Nav pad40, 컬럼 4개(Company/Communities/Useful links/Spotify Plans) + 로고 + ©2025 Grabit + 소셜 3아이콘, 컬럼 gap76/192.
   - 수정: `widgets/home-feed/ui/home-feed.tsx`(또는 home-page) 본문 맨 하단에 Footer 위젯 추가. (PNG: footer-nav.png)

3. **우측 사이드바 패널 펼침/접힘 토글 + 접힘 엣지 바 누락**
   - Figma 펼침: `2087:71744` 420×1108 헤더 토글 `2087:71747`(32×26 r6). Figma 접힘: `2087:70377`/`2087:73332` 40×1080 r8/0/0/8 x1879, 화살표 24×24.
   - 수정: RecommendationRail을 **토글 가능한 우 패널**로 승격 — open/collapsed 상태(useState) + 헤더 접힘 아이콘 + 접힘 시 40px 엣지 바(화살표). `widgets/home-feed/ui/recommendation-rail.tsx` + home-feed.module.css. (PNG: right-sidebar-panel.png)

4. **우 패널 그랩 카드 구조 틀림 (헤더↔푸터)**
   - Figma `2087:71777`: 헤더행 = 아바타 + 이름 + 역할배지(11/Medium #B472D0) + "1시간 전"(12/Regular #999999, 우측 x337). 본문(인용) → 임베드.
   - 구현 `entities/recommendation/ui/grab-card.tsx`: 역할+시간이 footer에 있음 → 헤더 1줄로 이동(아바타+이름+역할+우측 시간), 본문 → 임베드 순.

5. **토스트 인사이트 와이드 배너 누락(풀스크롤 정본)**
   - Figma: 풀스크롤 70384 중단 와이드 이미지 배너("토스트 인사이트로 만나요" 류). 좌측 그룹 + 우 와이드 배너 r12.
   - 수정: 디자인 확정값(노드 분해) 재측정 후 취향관/피드 탭 중단에 배너 섹션 추가. (취향관 기본 69031에 미포함일 가능성 — 스코프 확인 필요)

6. **AI FAB 누락** — `2087:71864` 44×44 #1F1F1F r21 sparkle 우하단 고정. (E4에서 스코프 제외 명시했으나 모든 정본 프레임에 존재 → 디자인-퍼스트 원칙상 추가 권장.)
