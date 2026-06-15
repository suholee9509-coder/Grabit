# u2-home-feed — 빌드 플랜 (정밀 구현 플랜)

> 정본 = `spec.md`. 디자인 SoT = Figma 페이지 "프로토타이핑" 2087:5987 하위 프레임만 (취향관 2087:69031 / 풀스크롤 2087:70384 / 칩active 2173:105190 / 재필터 2278:135621 / 피드 2087:71867). 측정값 = `docs/units/u2-home-feed/figma/*.md`.
> ★ 카디널 룰: 모든 치수·색·타이포는 측정 .md 실측값 그대로. 눈대중·근사 ❌. 토큰 미보유값은 §3의 [토큰갭] 처리표를 따른다.
> 실행모드 = 인터랙티브 워크트리(사용자 운전). 모든 경로는 `/Users/suho/Desktop/Grabit/.claude/worktrees/u2-home-feed/apps/web/src/` 기준 상대표기.

---

## 0. 런북 결정 반영 (확정 — 재논의 ❌)

- **E1**: 신규 BE RPC ❌. u0b에 cohort-popular/trending **집계 RPC 없음**(`content_clips_public` 뷰는 `user_id` raw 노출 + cohort_job k-anon만 있고 popularity 집계 아님). → **콜드스타트 폴백/시드 인터페이스로 화면 채움**(ADR-0002 #7). cross-user `clips` 직접 쿼리 ❌, `user_id`/실명 미노출.
- **E2**: 비회원 = 온보딩 리다이렉트(공개 홈 ❌). 라우트 가드 `RequireOnboarded` 그대로 유지. → u2는 **회원 홈만** 구현(톱바 비회원 CTA는 셸 컴포넌트가 가진 슬롯으로, 홈은 로그인 상태로 렌더).
- **E3**: 콜드스타트 = 시드 콘텐츠(demo-data) 노출 + 빈상태 폴백 문구 **둘 다 인터페이스로**. 데이터>0 → 시드/실데이터, =0 → 빈상태 문구.
- **E4**: 우측 추천 레일(`사이드바_우측` 420 "내 취향에 맞는 실시간 그랩") **포함**. AI 패널(2087:70472)·AI Sparkle FAB(2087:71864 등)와 별개 — AI는 구현 ❌.
- **E5**: GNB 수신함 = u11 전까지 비활성/준비중(죽은 링크 ❌). 기존 `widgets/sidebar`의 `onMenuSelect` 처리 따름(라우팅 미연결 = no-op 유지).

---

## 1. 파일 트리 (FSD · 책임 1줄)

> 하향 임포트만(`app→pages→widgets→features→entities→shared`). 동일레이어 크로스슬라이스 ❌(슬롯 주입). 배럴 경유.

```
apps/web/src/
├── app/
│   ├── app.tsx                                  # [편집] /content/:id 라우트 등록 + (가드 유지)
│   └── content-detail-stub/
│       ├── index.ts                             # [신규] 배럴
│       └── ui/content-detail-stub.tsx           # [신규] u4 교체 전 최소 스텁 페이지(죽은 링크 방지·셸 안에 "준비중" 본문)
│
├── pages/home/
│   ├── index.ts                                 # [유지] HomePage 배럴
│   ├── clip-flow.test.tsx                        # [보존·미변경] u3 클립플로우 테스트(절대 깨지면 안 됨)
│   ├── home-feed.contract.test.tsx               # [신규] 탭전환·필터·재필터·카드→navigate (vi.mock @/shared/api 결정론)
│   ├── home-empty-cold-start.test.tsx            # [신규] 추천 0건 → 폴백/빈 상태
│   └── ui/
│       ├── home-page.tsx                         # [편집] 셸 호스트 유지 + 본문에 <HomeFeed/> 마운트. u3 ClipAddFlow·u1 ExtensionInstallModal 보존
│       └── home-page.module.css                  # [편집] 안내본문(.body/.heading/.sub) 제거, 피드 컨테이너 레이아웃만
│
├── widgets/
│   ├── home-feed/                                # [신규] 홈 피드 오케스트레이터(세그먼트 토글로 취향관/피드 스위치 + 우레일 합성)
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── home-feed.tsx                      #  3컬럼 합성: 중앙(취향관|피드) + 우레일. 세그먼트 상태 보유. data 훅 호출 → 하위 widget에 props 주입
│   │       └── home-feed.module.css               #  중앙 컬럼 1214 / 우레일 420 / gap 8(풀스크롤 §0 실측) — 단 셸 내부 콘텐츠폭은 §3 주석 참조
│   ├── feed-tab-default/                          # [신규] "취향관" 탭 본문(기본)
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── feed-tab-default.tsx               #  히어로 + 관심분야 칩행 + 추천 캐러셀 + 직군별 크로스 트렌드 섹션 합성
│   │       └── feed-tab-default.module.css
│   ├── feed-tab-stream/                           # [신규] "피드" 탭 본문
│   │   ├── index.ts
│   │   └── ui/
│   │       ├── feed-tab-stream.tsx                #  카테고리 칩행 + 히어로 + 실시간 인기 그랩 + 현직자 인사이트 + 분야별 트렌드 그리드
│   │       └── feed-tab-stream.module.css
│   ├── hero-carousel/                             # [신규] 상단 히어로(취향관·피드 공용, 카피만 분기)
│   │   ├── index.ts
│   │   └── ui/{hero-carousel.tsx, hero-carousel.module.css}   # 1601×434 베이스 #0A0A0A · 우측 이미지+좌페이드 · 메타행 · 제목 · 썸네일 스트립 · 페이지 도트
│   ├── recommendation-rail/                       # [신규] 우측 추천 레일(E4 — "내 취향에 맞는 실시간 그랩" 420)
│   │   ├── index.ts
│   │   └── ui/{recommendation-rail.tsx, ...module.css}        # 그랩 카드 리스트(버블+임베드) · AI와 별개
│   ├── cross-trend-section/                       # [신규] "직군별 크로스 트렌드" 섹션(취향관) — 제목+underline 탭 + 재필터 캐러셀
│   │   ├── index.ts
│   │   └── ui/{cross-trend-section.tsx, ...module.css}
│   ├── insight-section/                           # [신규] "현직자들의 인사이트"(피드) — 제목+underline 탭 + 인사이트 카드행
│   │   ├── index.ts
│   │   └── ui/{insight-section.tsx, ...module.css}
│   └── (app-shell·sidebar·topbar = [미변경] 소비만)
│
├── features/
│   ├── feed-segment/                              # [신규] 취향관/피드 세그먼트 토글 상태 + Tabs(segment·lg) 래핑
│   │   ├── index.ts
│   │   └── ui/feed-segment.tsx                    #  value/onChange 제어형. 기본=취향관. shared/ui Tabs(variant=segment,size=lg) 사용
│   ├── feed-category-filter/                      # [신규] 피드 카테고리 칩행(전체/AI/기획/UXUI 디자인/프론트엔드/백엔드/마케팅)
│   │   ├── index.ts
│   │   └── ui/feed-category-filter.tsx            #  shared/ui Chip(variant=filter) 행. 기본=전체. value/onChange
│   ├── interest-chip-row/                         # [신규] 취향관 관심분야 아바타 칩행(82×82 원형, 선택 링/라벨)
│   │   ├── index.ts
│   │   └── ui/interest-chip-row.tsx               #  shared/ui Avatar(selected) + 라벨. + "분야 추가" 칩(스코프=상태만, 모달 ❌)
│   └── cross-trend-filter/                        # [신규] 크로스 트렌드/인사이트 분야 전환 underline 탭(재필터 트리거)
│       ├── index.ts
│       └── ui/cross-trend-tabs.tsx               #  shared/ui Tabs(variant=underline) + 강조어 그린 span. value/onChange
│
└── entities/
    ├── content/                                  # [편집·추가] 카드 표현 모델 확장 + 카드 컴포넌트
    │   ├── index.ts                              #  배럴 추가 export
    │   ├── model/
    │   │   ├── types.ts                          # [편집] ContentMeta(미변경) + 신규 FeedCardModel/RecommendationCardModel/GrabItem 표현 타입
    │   │   └── feed-data.ts                       # [신규] 카테고리/분야 enum·라벨 매핑(상수 SoT — 칩/탭 카피)
    │   └── ui/
    │       ├── rec-card.tsx + .module.css         # [신규] 추천 캐러셀 카드(334×334 외곽/inset14/썸네일306×172) — 풀스크롤 §4 실측
    │       ├── grid-card.tsx + .module.css        # [신규] 그리드/트렌드 카드(356×461·#1B1B1B·shadow) — 풀스크롤 §5·피드 §5 실측
    │       ├── cross-card.tsx + .module.css       # [신규] 크로스/인사이트 가로형 카드(252폭·썸네일251.81×142) — 재필터 §5·피드 §4 실측
    │       ├── grab-card.tsx + .module.css        # [신규] 실시간 그랩 카드(버블+임베드) — 풀스크롤 §7 실측 (우레일)
    │       └── card-states.tsx + .module.css      # [신규] 카드 스켈레톤/빈/에러 상태 프리미티브(섹션 공용)
    └── recommendation/                            # [신규] 추천/트렌드 데이터 표면(읽기 모델 + 쿼리 + 콜드스타트 폴백)
        ├── index.ts
        ├── model/types.ts                         #  RecommendationFeed·CrossTrendBucket·StreamFeed·GrabFeed 셰이프
        ├── api/feed-api.ts                         #  supabase null/0건 → demo-seed 폴백. (E1: 신규 RPC 호출 ❌)
        ├── api/queries.ts                          #  TanStack Query 훅(아래 §4)
        └── api/demo-seed.ts                        #  결정론적 시드 콘텐츠(프레임 카피 그대로) — E3 시드
```

> entities/profile에 **현재 사용자 job 읽기 훅** 추가 필요(추천 캐러셀 라벨 "프로덕트 디자이너가 많이 본"의 직군 = 내 프로필 job). 자기 행 select(own row, RLS-safe) — 신규 `useMyProfileJob`을 `entities/profile/api/queries.ts`에 additive로 추가(아래 §4-0). cross-user 아님.

---

## 2. 컴포넌트 재사용 맵 (화면요소 → shared/ui·widget)

| 화면 요소 (프레임) | 사용 컴포넌트 | 비고 |
|---|---|---|
| 좌 GNB / 톱바 / 셸 | `widgets/sidebar`·`widgets/topbar`·`widgets/app-shell` (소비만) | home-page가 이미 합성 — **미변경**. activeMenu="home" |
| 취향관/피드 세그먼트(2087:70406·71904) | `shared/ui` **Tabs** `variant="segment" size="lg"` | 선택 글자=흰(#FAFAFA), 비선택 #999999 — 컴포넌트가 이미 분기. ★lh 갭 §3 |
| 피드 카테고리 칩(2087:71870~71884) | `shared/ui` **Chip** `variant="filter"` + `selected` | 선택 #FAFAFA/#111111·600, 비선택 .06/#B4B4B4/400 — 실측 확정값 보유 |
| 취향관 관심분야 아바타 칩(2173:120904·2278:136811) | `shared/ui` **Avatar** `size="xl" selected` + 라벨 텍스트 | 선택 링=brand-primary-50 2px·라벨 #66FF4B — Avatar.selected 보유. "분야 추가"는 Avatar 미사용(보더 박스+아이콘, feature 내 마크업) |
| 크로스 트렌드 / 인사이트 underline 탭(2087:69500·73091) | `shared/ui` **Tabs** `variant="underline"` | active 흰글자+2px 밑줄. ★강조어 그린(#20C974)은 label 내 `<span>` — Tabs label은 ReactNode 가능 |
| 톱바 pill·CTA | `shared/ui` **Button** (소비만) | 미변경 |
| Premium 배지 | `shared/ui` **Badge** `inline tone="premium"` (사이드바 내, 소비만) | — |
| 추천 캐러셀 카드(334×334) | `entities/content` **RecCard** (신규) — 내부 Chip(tag)·클립수 | Card 프리미티브 직접 미사용(치수 다름 → 신규 카드, 토큰 사용) |
| 그리드/트렌드 카드(356×461) | `entities/content` **GridCard** (신규) — 내부 Chip(tag, ceceTone) | shared/ui Card는 padding 모델이 달라 신규(토큰 기반, 하드코딩 HEX ❌) |
| 크로스/인사이트 가로 카드(252폭) | `entities/content` **CrossCard** (신규) — Chip 미사용(태그 없음) | 작성자 직군 가변색은 §3 [토큰갭] |
| 실시간 그랩 카드(우레일) | `entities/content` **GrabCard** (신규) — 버블+임베드 | 우레일 전용 |
| 칩/탭/카드 태그 | `shared/ui` **Chip** `variant="tag"` (필요 시 `ceceTone`) | h28·radius6·.06 — 측정과 일치 |
| 빈/로딩/에러 | `entities/content` **CardStates** (신규) + 섹션별 메시지 | 디자인 공백 → 파운데이션 토큰 |

> ★ 신규 카드는 모두 `entities/content/ui`에 둔다(표현 모델). 세그먼트/필터/탭 상태 로직은 `features`, 섹션 합성은 `widgets`. 데이터는 `entities/recommendation`. **하드코딩 HEX 금지** — 토큰 또는 §3 표의 인라인 측정값(주석 명기) 사용.

---

## 3. 정확한 토큰/치수 표 + [토큰갭] 처리 방침

### 3-A. 레이아웃 (실측 — 풀스크롤 2087:70384 §0 정본)
| 항목 | 실측 | 처리 |
|---|---|---|
| 앱 베이스 배경 | `#000000` | `--color-bg` ✔ |
| 셸 면(GNB·톱바·콘텐츠·우레일·footer) | `#121212` | `--color-shell-bg` ✔ |
| 중앙 콘텐츠 컬럼 폭 | **1214**(풀스크롤) / 셸 내부 단독 1601(취향관 단일프레임) | 풀스크롤이 3컬럼 정본 → 중앙 **1214** 기준. 셸 main이 flex-fill이므로 우레일(420)+gap(8) 제하면 자연 폭. 고정폭 강제 ❌(반응형 안전), 카드는 실측 고정치수로 캐러셀/그리드 채움 |
| 우 레일 폭 | **420** · radius 8 · `#121212` | 인라인 `420px`(size 토큰 부재 — 주석 "측정 2087:71744") |
| 컬럼 gap | **8** | `--space-4` ✔ |
| 콘텐츠 좌 inset | 히어로/칩=**40**(`--space-20`✔) · 섹션그룹=**26** | 26 = [토큰갭] → 인라인 `26px` 주석 "측정 2087:71184 x=26" |

### 3-B. 색 (대부분 토큰 ✔ — 측정 .md 매칭 결과)
| 측정값 | 토큰 | 용처 |
|---|---|---|
| `#FAFAFA` | `--color-white` ✔ | 섹션타이틀·흰 글자 전부(FD3) |
| `#0A0A0A` | `--color-surface-base` ✔ | 히어로 베이스 |
| `#1B1B1B` | `--color-surface-segment` ✔ | 그리드/트렌드 카드 면 |
| `#171717` | `--color-surface` ✔ | 그랩 임베드 카드 면 |
| `#363636` | `--color-surface-tab-selected` ✔ | 세그먼트 선택 |
| `#242424` | `--color-nav-active-bg` ✔ | nav active |
| `#66FF4B` | `--color-brand-primary` ✔ | 선택 칩 라벨·도트·로고 |
| `rgba(102,255,75,0.5)` | `--color-brand-primary-50` ✔ | 선택 칩 링 |
| `#B4B4B4`/`#999999`/`#CECECE`/`#5D5D5D` | `--color-text-secondary`/`-tertiary`/`--color-gray-550`/`--color-text-dim` ✔ | 메타·태그·구분점 |
| `#111111` | `--color-text-on-light` ✔ | 선택 필터칩 글자 |
| `#199E41` | `--color-premium-green` ✔ | Premium 배지 |
| `#72D0A6` | `--color-accent-mint` ✔ | 작성자 직군(일부) |
| rgba(255,255,255,0.04/0.06/0.08/0.2/0.24) | surface-ghost/hover·border-subtle/divider/strong ✔ | 카드/칩/구분선 |
| rgba(0,0,0,0.6) | `--color-overlay-black-60` ✔ | 클립수 배지 |

### 3-C. [토큰갭] — 처리 방침 (신규 토큰 vs 인라인)
> 방침: **2회 이상 반복되는 색/사이즈** → `tokens.css`에 신규 토큰 additive 추가(u0c 계약 변경 아님 — **추가만**, 기존 값 수정 ❌). **1회성·컴포넌트 고정치수** → 모듈 CSS 인라인 + 측정 노드ID 주석.

| 갭 | 측정값 | 처리 |
|---|---|---|
| 작성자 직군 violet | `#8777FF` (히어로·크로스·인사이트·우레일 다수) | **신규 토큰** `--color-author-violet: #8777ff;` (주석: 측정 2278:136117 — accent-violet #727AD0와 별개) |
| 작성자 직군 magenta | `#B472D0` (백엔드 등) | **신규 토큰** `--color-author-magenta: #b472d0;` (주석 2278:136054) |
| 크로스트렌드 강조어 그린 | `#20C974` (underline 탭 강조 토큰) | **신규 토큰** `--color-accent-trend-green: #20c974;` (주석 2278:136031 — brand와 별개) |
| 순백 #FFFFFF (탭 언더라인·카드제목) | `#FFFFFF` | **신규 토큰** `--color-white-pure: #ffffff;` (주석 — FD3 흰=#FAFAFA이나 underline/카드제목은 픽셀-퍼펙트 순백). 적용처 = underline 2px·grid/trend 카드 제목·rec 카드 제목 |
| `#F6F6F6` (그랩 버블 본문) | `#F6F6F6` | white #FAFAFA로 통일(미세差, §토큰갭 §6 권장) — `--color-white` 사용 |
| `#DEDEDE` (임베드 채널명) | `#DEDEDE` | **신규 토큰** `--color-gray-575: #dedede;` (주석 2087:71764 — gray-600 #DBDBDB와 미세差) |
| `#7FFF66` (그랩 아바타 fill) | `#7FFF66` | 인라인 `#7fff66` 주석(우레일 1회성, 아바타 자산색) |
| 추천 카드 외곽/inset | 334×334 / inset 14 / 썸네일 306×172 r6 | 인라인(주석 "측정 2087:70515"). 14=`--space-7`✔, r6=`--radius-sm`✔, r12=`--radius-lg`✔ |
| 그리드/트렌드 카드 | 356×461 / 썸네일 332×187 r6 / shadow `0 4 16 .24` | 인라인 사이즈 + **신규 토큰** `--shadow-card: 0px 4px 16px 0px rgba(0,0,0,0.24);`(주석 2087:72353·71188 — overlay와 blur 다름) |
| 크로스/인사이트 카드 | 252폭 / 썸네일 251.81×142 r6 | 인라인(주석 2557:35770). 본문 column gap 12·8 = `--space-6`/`--space-4`✔ |
| 추천 캐러셀 카드(취향관 단일프레임 변형) | 172×172 정사각(2087:69633) | 풀스크롤(334×334) ≠ 취향관 단일(172×172). **풀스크롤이 3컬럼 정본** → 334×334 채택. ⚠ §리스크 R1 (사용자 fidelity 확인 필요) |
| 세그먼트 lg lh | 텍스트 lh **130%** (취향관) / 토큰 segment-lg=160% | Tabs lg가 160% → **lh 130% 변형 필요**. 인라인 override(`line-height:130%` 주석) 또는 Tabs에 size 분기 추가 없이 widget CSS override. ⚠ R2 |
| 히어로 제목 | 취향관24×?·풀스크롤 **32**/130%·피드 **36**/130% (프레임별 상이) | 프레임별 분기: 취향관 히어로(Grabit 엄선)와 피드 히어로(EO Korea) 카피/크기 다름. 피드=36/700(`--text-onboarding-title-size` 36, weight 700 override) · 풀스크롤=32/700. 인라인 명기 |
| 카테고리 칩 라벨(아바타) | 14/600/lh130%/ls-2.5%/center | type ramp 부재 → 인라인(`font:600 14px; line-height:130%; letter-spacing:-0.025em` 주석 style_N4CHHJ) |
| 칩 간 gap(아바타행) | **30** | [토큰갭] 인라인 `gap:30px` 주석(spacing 스케일 부재) |
| 분야별 트렌드 칩 | h**30**·pad10/12·radius6 | `--size-chip-filter`(30)✔·`--radius-sm`✔ — Chip filter 일치 |
| 페이지 도트 | 트랙 rgba(255,255,255,0.3)·활성 48×7 #66FF4B·기타 16×7 h7 | 인라인(주석 2278:135763) — 1회성 |
| 선택 썸네일 강조(히어로 스트립) | stroke rgba(255,255,255,0.6) 1.25px + shadow rgba(255,255,255,0.08) | 인라인(주석 2087:71899) |
| 히어로 좌페이드 그라데 | linear-gradient(-90deg, rgba(10,10,10,0)→rgba(10,10,10,1)) | 인라인 그라데(토큰 부재) |
| 캐러셀 우페이드 | linear-gradient(-90deg, rgba(18,18,18,1)→0) | 인라인(끝색 #121212=shell-bg) |

> **tokens.css 추가(additive only)**: `--color-author-violet`·`--color-author-magenta`·`--color-accent-trend-green`·`--color-white-pure`·`--color-gray-575`·`--shadow-card`. 기존 토큰 값 수정 ❌ (u0c 계약 보존). 추가 6개는 모두 측정 출처 주석 동반.

---

## 4. 데이터 배선 (TanStack Query — MSW 없음, vi.mock 패턴)

> ★ 프로젝트는 **MSW 미설치**. 기존 결정론 패턴 = `entities/*/api/*.ts`에서 `supabase` null 시 demo 폴백 + 테스트는 `vi.mock('@/shared/api')`. **이 패턴을 그대로 따른다**(MSW 도입 ❌ — spec "MSW로 목킹"은 결정론 목킹을 의미; 기존 인프라 재사용으로 충족).

### 4-0. 현재 사용자 직군 (라벨용)
- `entities/profile/api/queries.ts`에 **`useMyProfileJob()`** additive 추가 → `fetchMyProfile()`(profile-api.ts) 자기 행 select(own row, RLS-safe). supabase null → mock state의 job(없으면 폴백 라벨 "내 직군"). 반환 = `{ job: string | null }`.
- 추천 캐러셀 제목 = `\`${job ?? '내 직군'}이 많이 본 컨텐츠\`` (job 있으면 "프로덕트 디자이너가 많이 본 컨텐츠"). cross-user 미사용.

### 4-1. 섹션별 데이터 소스
| 섹션 | 훅 | 반환 셰이프 | 콜드스타트 폴백 |
|---|---|---|---|
| 취향관: 히어로 | `useHeroFeature('default')` | `{ channel, viewsLabel, clipsLabel, title, thumbnails: string[] } \| null` | 시드 1건(프레임 카피) / null→빈 히어로 |
| 취향관: 관심분야 칩 | `useInterestChips()` | `InterestChip[]`(`{id,label,avatarSrc,selected}`) | 시드(내 분야·프로그래밍·UXUI 디자인·업무 생산성·IT 기획·리더십·협업) + "분야 추가" 정적 |
| 취향관: 추천 캐러셀 | `useRecommendationFeed(job)` | `{ title, items: RecCardModel[] }` | items 시드(demo-seed) / `items=[]` → 빈상태 |
| 취향관: 크로스 트렌드 | `useCrossTrend(activeField)` | `{ tabs: {id,label,emphasis}[], items: CrossCardModel[] }` | tabs 정적(데이터 사이언스/프론트엔드/마케팅) + items 시드(분야별) / 0건→빈 |
| 피드: 카테고리 칩 | 정적 상수(`feed-data.ts`) | `FeedCategory[]` | 폴백 불필요(고정 칩) |
| 피드: 히어로 | `useHeroFeature('stream')` | 위와 동일(EO Korea 카피) | 동일 |
| 피드: 실시간 인기 그랩 | `useStreamGrabs(category)` | `{ items: StreamGrabModel[] }` | 시드 / 0건→빈 |
| 피드: 현직자 인사이트 | `useInsightFeed(activeField)` | `{ tabs[], items: CrossCardModel[] }` | 위 크로스와 동형 |
| 피드: 분야별 트렌드 그리드 | `useTrendGrid(category)` | `{ items: GridCardModel[] }` | 시드 / 0건→빈 |
| 우레일: 실시간 그랩 | `useRealtimeGrabs()` | `{ items: GrabModel[] }` | 시드 / 0건→빈 |

- **쿼리 키**: `recommendation` 네임스페이스 — `['recommendation','rec',job]`·`['recommendation','cross',field]`·`['recommendation','stream',category]`·`['recommendation','grid',category]`·`['recommendation','realtime']`. entities/recommendation 소유.
- **필터/재필터 = 클라 상태 + queryKey 파라미터**: 카테고리/분야 선택은 컴포넌트 state(`useState`)로 보유 → 훅 인자로 전달 → queryKey 변경 → 캐시 분기. demo-seed는 인자에 따라 결정론적으로 필터된 배열 반환(예: category='AI' → AI 태그 시드만). RPC 신규 ❌.
- **셰이프 결정성**: `demo-seed.ts`가 프레임 카피(EO Korea·"데이터 분석으로…"·작성자 직군 등)를 그대로 상수로 보유 → 테스트가 이 카피로 단언(동어반복 ❌, 실제 필터 동작 검증).
- **no-leak**: 모든 모델 셰이프에 `user_id`·실명·`display_name` 필드 **없음**. 작성자 표시 = 직군 라벨("데브서찬"류 닉/직함은 시드 카피이며 cross-user 식별자 아님 — 시드는 가공 데이터). 실 supabase 경로 도입 시에도 `contents`(public-read 메타)만, `clips` 직접쿼리 ❌.

### 4-2. supabase 실경로 vs 폴백 분기 (feed-api.ts)
```
if (!isSupabaseReady) → demo-seed (E3 시드)
else → contents public-read 메타만 조회(인기 집계 RPC 없음 → 동일 demo-seed 폴백 + TODO(E1 후속 RPC) 주석)
```
- 즉 MVP는 사실상 **demo-seed가 주 경로**(E1 폴백 결정). 차단 사유(집계 RPC 부재)는 status.md에 기록. user_id 직접쿼리 절대 ❌.

---

## 5. 라우팅

- `app/app.tsx`에 라우트 추가(가드 패턴 유지):
  ```tsx
  { path: 'content/:id', element: <RequireOnboarded><ContentDetailStub/></RequireOnboarded> }
  ```
  (홈과 동일 가드 — 회원만. E2 정책 일관.)
- **카드 클릭** → `useNavigate()` `navigate(\`/content/${id}\`)`. 모든 신규 카드(Rec/Grid/Cross/Grab)는 `onSelect?(id)` 콜백 또는 내부 navigate. FSD상 navigate는 **widget/page 레벨**에서 주입(entities 카드는 `onClick(id)` 콜백만 노출 — entities가 router 의존 ❌). 권장: 카드 = `onSelect` 콜백, widget이 `navigate` 연결.
- `ContentDetailStub` = AppShell(activeMenu 무관) 안에 "콘텐츠 상세 준비중 (u4)" 본문 + `useParams` id 표시. **죽은 링크 방지용 최소 스텁**(u4가 교체). 토큰 사용.

---

## 6. 빈 / 로딩 / 에러 상태 (디자인 공백 → 파운데이션)

> `entities/content/ui/card-states.tsx` 프리미티브: `<CardSkeleton variant="rec|grid|cross|grab"/>`·`<SectionEmpty message cta?/>`·`<SectionError onRetry/>`. 토큰만 사용.

| 섹션 | 로딩 | 빈(0건·콜드스타트) | 에러 |
|---|---|---|---|
| 추천 캐러셀 | rec 스켈레톤 카드 ×4(334×334 자리, surface-segment 면 + shimmer 없음/정적 dim) | E3: 시드 노출이 기본. 시드도 0이면 "아직 추천이 없어요" + (선택)관심분야 추가 유도 문구 | "추천을 불러오지 못했어요" + 재시도 버튼(Button secondary md) |
| 크로스/인사이트 | cross 스켈레톤 ×4(252폭) | "이 분야 콘텐츠가 곧 추가돼요" | 재시도 |
| 그리드 | grid 스켈레톤 ×3(356×461) | 빈 그리드 문구 | 재시도 |
| 우레일 | grab 스켈레톤 ×3 | "실시간 그랩이 아직 없어요" | 재시도 |
| 히어로 | 베이스 #0A0A0A 면 유지(텍스트 placeholder dim) | null → 히어로 영역 collapse(레이아웃 안전) | 무음 폴백(히어로는 에러 시 숨김) |

- 로딩 = `isPending`, 에러 = `isError`(retry 버튼 → `refetch()`), 빈 = `data.items.length===0`. 각 섹션 독립(한 섹션 에러가 전체 죽이지 않음).

---

## 7. 테스트 계획

> 위치 = `pages/home/`. 결정론 = `vi.mock('@/shared/api')`로 supabase null 강제 + demo-seed 경로. `QueryClient(retry:false)` + `MemoryRouter`/`createMemoryRouter`로 navigate 단언. **clip-flow.test.tsx 미변경 보존**.

### 7-1. `home-feed.contract.test.tsx`
- **탭 전환**: 기본 취향관 렌더(추천 캐러셀 제목 노출) → "피드" 클릭 → 피드 섹션("실시간 인기 그랩"·"현직자들의 인사이트"·카테고리 칩) 노출, 취향관 섹션 사라짐.
- **카테고리 필터**(피드): "AI" 칩 클릭 → `aria-pressed=true` + 그리드/그랩 목록이 AI 시드로 변경(특정 AI 카피 등장, 비AI 카피 소거). 기본 "전체" 검증.
- **크로스 트렌드 재필터**(취향관): underline 탭 "프론트엔드 영상" 클릭 → active 표시(aria-selected) + 캐러셀이 프론트엔드 시드로 재필터(프레임 카피 단언). "분야 추가"/관심칩 "리더십" 선택 → 링/라벨 active(클래스/aria) 검증.
- **카드 → navigate**: 추천 카드 클릭 → 라우터가 `/content/:id`로 이동(스텁 페이지 id 텍스트 노출 또는 location 단언). MemoryRouter initialEntries=['/'].
- 결정론: demo-seed 카피로 단언(동어반복 아님 — 필터 인자에 따라 다른 배열 반환을 검증).

### 7-2. `home-empty-cold-start.test.tsx`
- `vi.mock`으로 추천/그랩 훅 데이터를 `items:[]`로 강제(시드 0건 시나리오 — feed-api에 `__forceEmpty` 테스트 훅 또는 demo-seed 빈 모드 주입) → 각 섹션 빈 상태 문구 렌더, 콘솔 에러 0, 레이아웃 유지.
- 로딩→데이터 전이(선택): pending 시 스켈레톤 존재 단언.

### 7-3. 검증 명령(매 의미변경)
`pnpm/npm -w apps/web test` (vitest) · `tsc -b` 0 · `lint` 0 · `lint:fsd`(steiger) 0 · 콘솔 0. u0b 미접촉 = `git diff --stat supabase/` 0.

---

## 8. Boundaries 재확인 (편집 허용 경로만)

- **편집 허용(FE)**: `pages/home/**` · `widgets/home-feed/**`·`widgets/{feed-tab-default,feed-tab-stream,hero-carousel,recommendation-rail,cross-trend-section,insight-section}/**`(신규) · `features/{feed-segment,feed-category-filter,interest-chip-row,cross-trend-filter}/**`(신규) · `entities/{content,recommendation}/**` · `entities/profile/api/queries.ts`·`profile-api.ts`(useMyProfileJob additive만) · `app/app.tsx`(라우트 등록)·`app/content-detail-stub/**`(신규) · `app/styles/tokens.css`(**additive 6 토큰만**).
- **미접촉(계약 보존)**: u0b 마이그레이션/RLS/pgTAP(`supabase/**`) — 0건 · u0c `shared/ui/**`·`widgets/{app-shell,sidebar,topbar}/**`·tokens.css 기존 값 — 소비/추가만, 수정 ❌ · u1 인증·`pages/auth`·가드 · u3 `widgets/clip-add`·`features/clip-*` · u4 상세 화면(스텁만).
- **preserve**: FSD 하향 임포트 · RLS(cross-user read ❌) · sanitized read(user_id/실명 미노출 — 모델에 필드 부재) · u0c 토큰 1:1 · `clip-flow.test.tsx` 그린 유지.
- **out of scope (게이트 ⓐ — 구현 ❌)**: AI 어시스턴트 패널(2087:70472·2278:126560/130071)·AI Sparkle FAB(2087:71864·70382·73336) · 대시보드 GNB 탭(FD1 4탭) · 결제/페이월 · 아티클 클리핑 · 검색/라이브러리 화면(링크만, u8/u7) · footer 템플릿 카피(Spotify 잔재 — MVP는 최소 로고+© 또는 생략, 사용자 확인).
- main 직접 푸시 ❌ · blast radius = `feat/u2-home-feed`.

---

## 9. 매 턴 루프
- spec.md + 이 plan.md + 대상 Figma 프레임 reload → 구현 → validation(test/tsc/lint/lint:fsd/콘솔) → `status.md` 갱신(변경·검증·fidelity·리스크). 모든 L1-x production acceptance 관찰가능까지 루프. 미충족 done ❌.
