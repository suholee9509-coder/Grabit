# Grabit 충실도 감사 — 마스터 보완점 리포트 + 우선순위 수정 계획

> 7개 페이지 감사 종합(신디사이저) · 감사일 2026-06-16 · read-only(코드 변경 없음)
> fileKey: `5GGyKsjXEOpjKMLtUodeSs` · 구현 루트: `apps/web/src/`
> 페이지별 정본 리포트: `u1-auth-onboarding.md` · `u2-home.md` · `u3-clip-modal.md` · `u4-content-detail.md` · `u7-library.md` · `u8-search.md` · `u11-settings-inbox.md`
> 워크플로우 = **UI 역설계(디자인-퍼스트)**. Figma 프레임 = "무엇"의 고정 SoT. 충실도 = 구현이 프레임과 1:1(픽셀-퍼펙트)인가.

---

## 1. 전체 충실도 현황 표

| 페이지 | 추정 충실도 | High 보완점 | 총 보완점 | 한줄평 |
|---|---|---|---|---|
| **u2 Home — 취향관/피드** | **~52%** | 5 | 11 | 중앙 상단·좌GNB·톱바는 양호하나 **풀스크롤 하단(트렌드 그리드·푸터·토스트 배너) + 우측 레일 토글 패널/엣지 바/AI FAB**가 통째로 누락 — 최저 충실도, 우선순위 1순위 |
| **u4 content-detail** | **~68%** | 5 | 10 | 상단(플레이어·히트맵·메타)·원본소스는 85%+. 하단 분석그룹 **4개 핵심 구조가 Figma와 다름**(코호트 2칩·막대 연차스택·2패널 헤더·"N명이 그랩함") + 답글/composer 누락 |
| **u1 auth-onboarding** | **~78%** | 3 | 9 | 공유 프리미티브가 실측 SoT라 폼팩터·토큰은 1:1. 깎는 건 **②연차 부제 누락(즉시수정)** + 소셜 E1 스코프컷 시각차 + 정적 일러스트 2종 플레이스홀더 |
| **u7 Library** | **~78%** (정적 ~92%) | 3 | 11 | 정적 픽셀은 매우 높음(사이드바·폴더카드·5열 그리드·출처칩 일치). 감점은 **FAB 누락·폴더 드롭다운 구조 불일치·토글+진입 결합** + 디자인 외 추가요소 |
| **u8 Search** | **~88%** | 2 | 5 | 레이아웃·타이포·상태분기·인터랙션 1:1. 미달은 **출처 로고 5/6 자산 누락(모노그램 폴백) + 히어로 상단 ~56px 과다** 2건이 핵심 |
| **u3 Clip Modal** | **~93%** | 3 | 9 | 트림·우4섹션·태그4상태·전체 인터랙션 충실. 감점은 전부 **Step1이 공유 Modal 셸 재사용**으로 인한 헤더(타이틀굵기·닫기SVG·padding) + 트림 미세차 |
| **u11 settings-inbox** | 진입점 ~92% / 나머지 N/A | 0 | 7 | 진입점 2종(프로필카드·수신함 nav)은 sidebar 위젯과 1:1. 나머지 화면은 **디자인 공백(픽셀 SoT 없음)** → 토큰 일관성만 평가(하드코딩 0건). High 0건 |

**가중 평균(픽셀 SoT 있는 페이지 6개 기준): 약 76%.** u11은 디자인 공백이라 평균 산정에서 진입점만 반영.

---

## 2. High Severity 마스터 목록 (전 페이지 통합 · 즉시 수정 대상)

> 정렬: **① 누락 섹션·누락 인터랙션(통째로 빠진 것)** → **② 구조 틀림(존재하나 Figma와 다름)** → **③ 자산/픽셀**.
> "디자인-퍼스트" 원칙상, 정본 프레임에 존재하는데 구현에 없는 것이 최상단.

### ▣ 그룹 A — 누락 섹션 (통째로 빠짐, 사용자 가시성 최상)

| # | 페이지 | 항목 | Figma nodeId | 측정값 | impl 파일 | 수정 방법 |
|---|---|---|---|---|---|---|
| A1 | u2 Home | **취향관(default) 탭 — 분야별 트렌드 12카드 그리드 누락** | `2087:71184`(70384) / `2087:69678`(69031) | 컨테이너 1160(또는1549) column gap16, 4행×3열=12카드, 카드 356×461, shadow `0 4 16 rgba(0,0,0,.24)`, 카드별 카테고리배지+제목+썸네일+채널+날짜 | `widgets/home-feed/ui/feed-tab-default.tsx`(없음) | 크로스 트렌드 다음에 `GridCard` 그리드(useTrendGrid) 추가. CSS는 `feed-tab-stream.tsx`의 `gridRow` 패턴 재사용. (PNG: u2-home/trend-grid.png) |
| A2 | u2 Home | **푸터 Nav 누락** | `2087:71659`/`2087:73236` | y4150~, separator 1px rgba(255,255,255,.08), Nav pad40, 컬럼4(Company/Communities/Useful links/Spotify Plans) + 로고 + ©2025 + 소셜3아이콘 | (없음) | `widgets/home-feed/ui/home-feed.tsx`(또는 home-page) 본문 맨 하단에 Footer 위젯 추가. (PNG: u2-home/footer-nav.png) |
| A3 | u2 Home | **우측 사이드바 펼침/접힘 토글 + 접힘 엣지 바 누락** | 펼침 `2087:71744`(420×1108, 헤더토글 `2087:71747` 32×26 r6) / 접힘 `2087:70377`·`2087:73332`(40×1080 r8/0/0/8 x1879, 화살표24×24) | 오버레이 토글 패널 + 40px 엣지 바 | `widgets/home-feed/ui/recommendation-rail.tsx` + home-feed.module.css | RecommendationRail을 **토글 가능한 우 패널로 승격** — open/collapsed state + 헤더 접힘 아이콘 + 접힘 시 40px 엣지 바(화살표). 현재는 인라인 flex 컬럼(1180px↓ 숨김)일 뿐. (PNG: u2-home/right-sidebar-panel.png) |
| A4 | u4 content-detail | **답글 스레드 + reply 컴포저 미구현** | 우 사이드바 댓글 하위 replies + 하단 입력 composer | `DEMO_COMMENTS.replies` 데이터 존재하나 미렌더, "답글 N개 모두 보기"=클릭 불가 텍스트 | `comment-card.tsx`·`social-sidebar.tsx`(없음) | comment-card.tsx에 펼침 state + reply 카드(들여쓰기) 렌더, social-sidebar.tsx 하단에 입력 composer 행 추가(DM1 비활성이면 최소 UI 셸). |

### ▣ 그룹 B — 누락 인터랙션 (구조는 일부 있으나 토글/동작 부재)

| # | 페이지 | 항목 | Figma 근거 | impl 파일 | 수정 방법 |
|---|---|---|---|---|---|
| B1 | u2 Home | **우 사이드바 펼침/접힘 토글 동작 + 헤더 접힘 아이콘 클릭** | 70384(펼침) ↔ 69031/71867(접힘 40px 바), 헤더 `2087:71747` | recommendation-rail.tsx | A3와 한 묶음 — open/collapsed useState + 토글 핸들러. |
| B2 | u7 Library | **폴더 트리 토글과 폴더 진입이 단일 클릭에 결합** | `2087:23917`(토글)·`2087:23135`(진입)는 별개 상태 | `folder-tree.tsx` | 헤더 onClick이 `onToggle(id)`+`onSelectFolder(id)` 동시 호출 → "펼치기만" 불가. 아이콘/쉐브론=토글, 이름=진입으로 히트영역 분리. |
| B3 | u7 Library | **"전체 폴더" 드롭다운 구조 불일치** | `2117:22576`: 트리거 활성 시 **좌 사이드바 폴더 트리 인라인 확장**(별도 오버레이 아님) | `library-page.tsx` `folderMenuOpen` → `.folderDropdown` left110/top140 별도 오버레이 | 별도 오버레이 대신 사이드바 폴더 트리 확장/포커스로 재배선. 최소한 오버레이를 트리거 기준 앵커로. |

### ▣ 그룹 C — 구조 틀림 (존재하나 Figma와 다르게 구현 — content-detail 집중)

| # | 페이지 | 항목 | Figma nodeId | Figma 측정 | impl 파일 | 수정 방법 |
|---|---|---|---|---|---|---|
| C1 | u4 | **코호트 배너 칩 구조** | `2087:12838` | **2칩**("프로덕트 디자이너"/"3~5년차" 각 h28 r4 .04bg+.08border, **아바타 없음**) | `cohort-banner.tsx`/.css | impl=1칩(아바타+합친 라벨). 직군칩+연차칩 2개로 분리, Avatar 제거. topCohortLabel을 {job, years} 튜플 반환으로. |
| C2 | u4 | **인기있는 구간 좌 막대차트 색 의미** | `2087:12902`+bars `12904~12916` | 각 행=**연차 3색 스택**(violet/mint/magenta), 범례=연차 | `popular-segments.tsx` leftCard | impl=행마다 단색(랭크 인덱스 색)+count비율 폭 → 색 의미가 랭크↔연차로 뒤바뀜. 연차버킷별 스택 세그먼트로. cohort.ts에서 직군×연차 교차 집계 필요. |
| C3 | u4 | **인기있는 구간 2패널 헤더 배치** | `2087:12847` | 좌카드 헤더=코호트배너 / 우카드 헤더="가장 인기있는 구간" 제목 **나란히** | `popular-segments.tsx` | impl=배너 전체폭 위 + 제목 grid 위(세로 스택). 배너를 좌카드 헤더로, 제목을 우카드 헤더로 이동. |
| C4 | u4 | **인기클립 리스트 2번째 줄 텍스트** | `2087:12850/12851` | **"N명이 그랩함"**(그랩 수) | `popular-segments.tsx` `.clipGrab` | impl="그랩한 구간"(정적). `{count}명이 그랩함`으로. 클립별 grab count 필요. |
| C5 | u2 | **우 패널 그랩 카드 헤더↔푸터 구조 틀림** | `2087:71777` | 헤더행=아바타+이름+역할배지(11/Medium #B472D0)+"1시간 전"(12/Regular #999999 우측). 본문(인용)→임베드 | `entities/recommendation/ui/grab-card.tsx` | impl은 역할+시간을 footer에 둠. 헤더 1줄(아바타+이름+역할+우측시간)→본문→임베드 순으로 재구성. |

### ▣ 그룹 D — 자산 / 픽셀 / 셸 재사용

| # | 페이지 | 항목 | Figma nodeId | 측정값 | impl 파일 | 수정 방법 |
|---|---|---|---|---|---|---|
| D1 | u8 Search | **출처 브랜드 로고 5/6 자산 누락** | `2087:38907` 출처필터 6칩 + 카드배지 | Long Black/Medium/Tistory/EO planet/Publy = 실 imageRef 로고(필터 20×20, 배지 24×24, 내부 18 r4) | `entities/content/ui/source-logo.tsx` | Youtube만 SVG, 5개는 머리글자 모노그램(L/M/T/E/P) 폴백. 6 provider 로고를 정적 SVG/이미지로 추가. Figma export로 imageRef 다운로드. (출처 식별성 핵심 — Library/Home 카드에도 상속) |
| D2 | u8 Search | **히어로 상단 오프셋 ~56px 과다** | 히어로 abs y120, 토픽바 h56이 content y0-56 점유 | 히어로는 토픽바 하단(abs y64)에서 56px 아래 | `search-discovery.module.css` L8 · `search-results.module.css` L7 | 토픽바가 스크롤 영역 밖인데 padding-top 120이 토픽바 영역 중복 카운트. `padding-top` 120→약 56px로 재산정(내부 상대간격은 유지). 모든 검색 상태 공통. |
| D3 | u7 Library | **Sparkle FAB 미구현** | `2117:22574`/`23915`/`23133`(전 프레임 존재) | 44×44 r21 #1F1F1F border rgba(255,255,255,.08) 1px pad9, Sparkle mini 24×24, x1848 y1024 우하단 고정 | `library-page.tsx`(미렌더, 게이트ⓐ 주석) | 우하단 fixed/absolute FAB 추가. **게이트ⓐ로 의도 보류면 디자인 대비 누락임을 사인오프에 명시.** ※ u2 Ai FAB(A·아래 보류 그룹)와 동일 패턴 — 공통화 가능. |
| D4 | u1 auth | **②연차 단계 부제 누락(즉시 수정·1줄)** | `2087:8951` | "비슷한 동료들과 연결해 드려요." (16/400/160%/-2% #CECECE) — PNG 렌더로 실재 확인 | `features/onboarding-steps/model/step-config.ts` step 2 | "G4 부재"로 잘못 표기됨. step 2 객체에 `subtitle: '비슷한 동료들과 연결해 드려요.'` 1줄 추가. 헤딩 블록이 ①과 정렬 일치. **최저비용 최고 ROI.** |
| D5 | u1 auth | **소셜 우 프레임 시각차 — Naver/divider/이메일/"계속" 부재** | `2087:8221`(Naver `8458`/divider `8445`/이메일 `8464`/계속 `8474`) | Google+Naver+Kakao 3버튼+이메일 경로 | `features/social-login/`(Google+Kakao만) | **ADR-0001 E1 컷(의도)** — 기능상 정당. 프레임 대비 시각차 실재 → **게이트ⓒ에서 "E1 컷 확정" 명시 사인오프**. 수정 불필요(컷 유지) / Naver 활성화는 별도 단위. |
| D6 | u1 auth | **프로모 우패널 하단 일러스트 — 실 목업 vs 그라데이션** | Component 31 하위 Group 1707483367 (x36 y336 874×592) | YouTube 영상카드+자막+클립패널 정밀 목업 | `promo-panel.module.css` `.illustration` | impl=빈 linear-gradient. **G7(정적 자산 별도 파이프라인).** `download_figma_images`로 export 후 배경 교체. 자산 미확정 시 플레이스홀더 유지(문서화). |
| D7 | u3 Clip Modal | **Step1 공유 Modal 셸 헤더 3종**(타이틀굵기·닫기SVG·padding) | `2087:33544`(타이틀 700/20), `2087:33545`(Dismiss 20 SVG) | 타이틀 Bold700, 닫기 20px SVG, 헤더 pad 24/24/24/28 | `shared/ui/modal/modal.module.css` `.title`·`.header` + `modal.tsx` `.close` | impl=SemiBold600·텍스트"✕"·pad 28/14/6. ①font-weight→bold700 ②close 글리프 SVG(Step2 CloseGlyph 재사용) ③header padding 측정값. **단 공유 Modal 영향 검토**(Step1 커스텀 헤더가 더 안전할 수 있음). |

---

## 3. 페이지별 수정 계획 (1 수정 워크플로 = 1 페이지 단위 재구현/보완)

> 작업단위 계약: 각 페이지 = 한 소유자가 end-to-end로 픽셀-퍼펙트화하는 수직 슬라이스. 분기 금지, in-flight 흡수.

### WF-1 · u2 Home (가장 큰 작업 — 충실도 52% → 95%+)
**목표:** 풀스크롤 정본(2087:70384) 전체 + 우 패널 토글 시스템 복원.
1. **[A1] 트렌드 그리드** — `feed-tab-default.tsx`에 12카드 GridCard 그리드(stream 탭 `gridRow` 패턴 재사용).
2. **[A2] 푸터** — home-feed 하단 Footer 위젯(컬럼4+로고+소셜).
3. **[A3/B1] 우 패널 토글 시스템** — RecommendationRail을 오버레이 토글 패널로 승격(open/collapsed state, 헤더 접힘 아이콘 32×26, 접힘 40px 엣지 바, 펼침 화살표 16×16).
4. **[C5] 그랩 카드 재구성** — grab-card.tsx 헤더 1줄(아바타+이름+역할배지+우측시간).
5. **[보류] 토스트 인사이트 와이드 배너**(2087:71147) — 노드 분해 재측정 후 추가(취향관 기본 69031 포함 여부 스코프 확인).
6. **[보류] AI FAB**(2087:71864 44×44) — D3 FAB와 공통 컴포넌트로. 게이트 확인.
   - **재측정 필요:** 토스트 배너 노드 분해. **게이트:** 토스트 배너·AI FAB 스코프 확정.

### WF-2 · u4 content-detail (구조 재배치 — 68% → 92%+)
**목표:** 하단 분석그룹 4개 구조를 Figma와 1:1로.
1. **[C3] 2패널 헤더 배치** — 코호트배너를 좌카드 헤더, "가장 인기있는 구간" 제목을 우카드 헤더로(나란히).
2. **[C1] 코호트 배너 2칩** — cohort-banner.tsx 직군칩+연차칩 분리, Avatar 제거.
3. **[C2] 막대차트 연차 스택** — popular-segments.tsx rankBar를 연차버킷(~2/3~5/6~9년차) 3색 스택으로. cohort.ts 직군×연차 교차 집계.
4. **[C4] "N명이 그랩함"** — `.clipGrab` 텍스트 + 클립별 grab count.
5. **[A4] 답글 스레드 + composer** — comment-card 펼침 state + reply 렌더(DEMO_COMMENTS.replies), social-sidebar 하단 composer 셸.
6. **[Med]** 댓글 코호트라벨/시간 위치, 구간칩 우측 썸네일, 접힘 사이드바 세로작성 텍스트.
   - **데이터:** cohort.ts 교차 집계·클립별 grab count 필요. **의도 제외(gap 아님):** AI 노트 탭·Sparkle FAB(게이트ⓐ), 좋아요/작성 BE(DM1).

### WF-3 · u7 Library (인터랙션·정리 — 정적 92% 유지, 인터랙션 78% → 92%+)
1. **[D3] Sparkle FAB** 추가(44×44 r21 #1F1F1F, x1848 y1024).
2. **[B3] 폴더 드롭다운** — 별도 오버레이 → 사이드바 트리 인라인 확장으로 재배선.
3. **[B2] 트리 토글/진입 분리** — 히트영역 분리(쉐브론=토글, 이름=진입).
4. **[Med 정리·게이트]** 정렬 드롭다운·"선택 모드" 버튼(디자인 외)·폴더카드 더보기 글리프 사인오프, 브레드크럼 이중 표기 제거 검토.
5. **[Low]** 폴더별 제목 정렬(CENTER 의도 확인), select 라벨 13, 클립수 gap 7.

### WF-4 · u8 Search (자산+오프셋 — 88% → 96%+)
1. **[D1] 출처 로고 6종** 정적 자산 추가(source-logo.tsx provider 분기) — **Home/Library 카드에도 상속되는 공통 자산.**
2. **[D2] 히어로 오프셋** padding-top 120→56(discovery/results 공통).
3. **[Med/Low]** 카드폭 249/252 미세차(현행 유지 가능), hover 추정값 디자인 확정 시 보정.

### WF-5 · u1 auth-onboarding (저비용 정정 — 78% → 88%+)
1. **[D4] ②연차 부제 1줄 추가**(step-config.ts) — 즉시.
2. **[Med] 소셜 부제 색** #B4B4B4 → #CECECE(`--color-gray-550`) — login-page.module.css `.subheading`.
3. **[D5 게이트] 소셜 E1 컷** 사인오프 / **[D6 게이트] selected 칩 채움색** 미측정 갭 — 인터랙션 프레임 확보 시 반영.
4. **[D6/Low] 정적 자산** — 프로모 일러스트·모달 좌 일러스트·로고 SVG export(G7 파이프라인).

### WF-6 · u3 Clip Modal (셸 헤더 — 93% → 97%+)
1. **[D7] Step1 헤더 3종** — 타이틀 700·닫기 SVG·padding 24/24/24/28 (공유 Modal 영향 검토 후 커스텀 헤더 권장).
2. **[Med] 트림** — 길이 라벨 14→12, 세로 틱 4개 라인 추가, 보더색(#363636) 검증, 폴더 박스 bg 톤.

### WF-7 · u11 settings-inbox (와이어링 — 진입점 92% 유지)
1. **[Med] Premium 배지 와이어링** — settings-page.tsx:73·inbox-page.tsx:61에 `premium` props 전달(엔티티 tier 확인).
2. **[Med] 알림 빈 카테고리 안내**, 계정 메뉴 팝오버 앵커(고정좌표→DOM anchor).
3. **[디자인 공백 — SoT 부재]** 나머지 설정/계정/수신함 화면은 전용 프레임 확보 전까지 토큰 일관성 유지(현 상태 양호).

---

## 4. 공통 패턴 보완점 (여러 페이지 반복)

| 패턴 | 영향 페이지 | 내용 | 권장 |
|---|---|---|---|
| **P1 · Sparkle/AI FAB 미구현** | u2(AI FAB), u7(Sparkle FAB) — content-detail/검색 등 게이트ⓐ 보류 다수 | 44×44 r21 #1F1F1F border .08 우하단 고정. 전 화면 정본에 존재하나 게이트ⓐ로 보류 | **공통 FAB 컴포넌트** 1개로 만들고 게이트ⓐ 스코프를 한 번에 결정. 토큰 미등재(#1F1F1F fill_Y03NAH) → 추가 시 토큰화. |
| **P2 · 출처 브랜드 로고 자산** | u8(필터/카드), u7(카드 배지), u2(임베드 카드) | source-logo.tsx가 Youtube만 SVG, 5개 모노그램 폴백 | **한 번 export하면 전 페이지 상속.** 우선순위 높음(출처 식별성). |
| **P3 · 토글/패널 펼침↔접힘 상태** | u2(우 레일), u4(사이드바 — 구현됨), u7(폴더 트리) | 펼침/접힘 토글 상태가 u4는 완성, u2는 전무, u7은 진입과 결합 | u4의 collapsed 패턴을 레퍼런스로 u2 우 레일에 이식. |
| **P4 · hover/active 정적 export 부재** | 전 페이지 | Figma 정적 export에 hover/pressed 상태 미캡처 → 합리값/추정(코드 [GAP] 주석) | **프로토타이핑 인터랙션 프레임** 확보 시 일괄 보정. 현재는 문서화된 정당 갭. |
| **P5 · selected 칩 채움색 미측정** | u1(온보딩 칩), u2(관심 칩 active) | default 칩 selected 채움색이 정적 export에 부재 → 브랜드 보더만 | 인터랙션 프레임에서 selected 변형 측정 후 토큰화. |
| **P6 · 디자인 외 추가 요소(사인오프 필요)** | u7(정렬 드롭다운·선택모드 버튼·폴더카드 더보기), u4(접힘 세로작성) | Figma 프레임에 없는데 impl이 추가(기능 필요로) | 게이트ⓒ에서 "디자인 외 의도 추가" 일괄 사인오프 or 제거 결정. |
| **P7 · 게이트ⓐ 의도 제외 일관성** | u4·u7(AI 노트 탭/GNB 아이콘), u1(요금제 모달) | AI 노트·결제는 게이트ⓐ로 보류 — gap 아님 | 사인오프 문서에 "게이트ⓐ 보류 = 디자인 대비 의도적 누락" 일괄 명시. |
| **P8 · 텍스트 색 #FFFFFF vs #FAFAFA(FD3)** | u1(칩·약관), u11(제목 혼용) | Figma 일부 #FFFFFF ↔ impl 흰색통일 #FAFAFA | FD3(흰=#FAFAFA) 결정에 따른 의도차(5/255 미세). 현행 유지. |

---

## 5. 권장 수정 순서 (severity · 사용자 가시성 기준)

**0순위 — 즉시(분 단위, 최고 ROI):**
- **D4** u1 ②연차 부제 1줄 추가 (step-config.ts) — 1줄, 누락 텍스트.

**1순위 — 누락 섹션/패널 (가장 눈에 띔, 충실도 최저 페이지 우선):**
- **WF-1 u2 Home 전체** (A1 트렌드 그리드 → A2 푸터 → A3/B1 우 패널 토글 → C5 그랩카드). 52%로 최저 + 풀스크롤 하단이 통째로 빔.
- **A4** u4 답글 스레드 + composer.

**2순위 — 구조 틀림 (존재하나 다름, 분석 영역 신뢰성):**
- **WF-2 u4** C3 2패널 헤더 → C1 코호트 2칩 → C2 막대 연차스택 → C4 "N명이 그랩함".

**3순위 — 공통 자산 (한 번에 다 페이지 상속):**
- **D1/P2** 출처 로고 6종 export (u8·u7·u2 동시 해소).
- **D2** u8 히어로 오프셋 ~56px.

**4순위 — 인터랙션 정합 + 셸:**
- **WF-3 u7** B3 폴더 드롭다운 구조 / B2 트리 토글·진입 분리 / D3 FAB.
- **WF-6 u3** D7 Step1 헤더 3종.

**5순위 — 와이어링 + 미세 픽셀 + 게이트:**
- **WF-7 u11** Premium 배지 와이어링.
- **WF-5 u1** 소셜 부제 색, **WF-6 u3** 트림 미세차(길이라벨·세로틱).
- **P1 AI FAB·P6 디자인외 추가·P7 게이트ⓐ·D5 E1컷** 일괄 게이트ⓒ 사인오프.

**보류(게이트/재측정 선행):** u2 토스트 배너(노드 재측정), AI FAB 스코프(P1), 정적 일러스트 export(D6/G7), 인터랙션 프레임 확보 후 hover·selected 칩색(P4/P5).

---

## 6. 총평 (정직)

- **전체 High 보완점: 21건** (u2=5, u4=5, u1=3, u7=3, u8=2, u3=3, u11=0). 이 중 **순수 누락(섹션/인터랙션) 7건**(A1·A2·A3·A4·B1·B2·B3), **구조 틀림 5건**(C1~C5), **자산/픽셀/셸 9건**(D1~D7 + α).
- **평균 충실도 ≈ 76%**(픽셀 SoT 6페이지 가중). 다만 **편차가 매우 큼**: u3(93%)·u8(88%)는 거의 완성, u2(52%)·u4(68%)가 평균을 끌어내린다. **u2가 전체 충실도의 발목** — 풀스크롤 하단 3개 섹션 + 우 패널 토글 시스템이 통째로 빠져 있어 다른 페이지를 다듬는 것보다 u2 한 페이지를 끝내는 효과가 가장 크다.
- **희소식:** 토큰·공유 프리미티브(Chip/Button/Stepper/Modal/Toggle)·정적 픽셀 정밀도는 전반적으로 높음(u7 정적 92%, u11 하드코딩 0건). 즉 **"섹션을 채우고 구조를 재배치"하면 빠르게 90%대 진입 가능**한 상태이고, 처음부터 다시 만들 필요는 없다.
- **가장 흔한 누락 원인 2가지:** ① 풀스크롤 하단/오버레이 토글 패널을 초기 구현에서 인라인/생략 → u2·u4. ② 정적 자산(로고·일러스트)이 별도 파이프라인(G7)이라 폴백 상태 → u8·u1·u7.
