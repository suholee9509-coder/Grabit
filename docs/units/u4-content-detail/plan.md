# u4 콘텐츠상세 — 빌드 플랜 (build plan)

> 정본 spec = `docs/units/u4-content-detail/spec.md` · 디자인 SoT = Figma `2087:12538`(시청정보)·`2087:13354`(원본소스)·`2087:13772`(사이드바 접힘) — 실화면 "프로토타이핑" 2087:5987 하위(SECTION 2562:7927 **미참조**).
> 측정 정본 = `docs/units/u4-content-detail/figma/{2087_12538,2087_13354,2087_13772}.md`(+ `.png`).
> ★ 카디널 룰: 아래 모든 치수·색·타이포는 **Figma MCP 실측 그대로**. 추측 ❌. 매 턴 spec+plan+프레임 reload.
> ★ 게이트ⓐ 제외(미렌더): AI 패널(2278:*)·`AI 노트` 탭·`Sparkle mini` FAB → 우측 사이드바 탭 = **`인사이트` 단일**.
> ★ DM1 옵션1 확정(2026-06-15): 인사이트=`content_clips_public`만 BE 배선 · 댓글/답글·작성·좋아요 = **픽셀퍼펙트 UI + 데이터 목킹/비활성**(annotations 엔티티 신규 ❌, 실명 노출 ❌, 신규 마이그레이션 ❌).

---

## 1. 파일트리 (FSD — 하향 임포트만, 배럴 경유)

루트 = `apps/web/src`. **신규**=u4 작성, **수정**=기존 편집, **재사용**=무변경 의존.

```
apps/web/src/
├─ app/
│   ├─ app.tsx                                       [수정] /content/:id → ContentDetailStub 제거, <ContentDetailPage/> 로 교체
│   └─ content-detail-stub/                          [삭제] 스텁 제거(라우트가 실제 페이지로 대체되면 데드코드)
│
├─ pages/content-detail/                             [신규]
│   ├─ index.ts                                      배럴: export { ContentDetailPage }
│   └─ ui/
│       ├─ content-detail-page.tsx                   페이지 컴포지션(AppShell 슬롯 + 좌 본문 + 우 SocialSidebar + 2상태 토글 + underline 탭 스왑)
│       ├─ content-detail-page.module.css            본문폭 1156(player)/1148(메타·히트맵·인사이트) ↔ 접힘 1546/1538 리플로우, 우측 패널 450/60 도킹
│       ├─ watch-info-tab.tsx                         시청정보 탭 본문(플레이어+히트맵+메타+분석그룹) — 2087:12538
│       ├─ source-tab.tsx                             원본소스 탭 본문(원본 컨텐츠 정보 카드) — 2087:13354 §6
│       └─ source-tab.module.css
│
├─ widgets/
│   ├─ video-player/                                 [신규]  YouTube iframe 임베드 + seekTo 명령 핸들
│   │   ├─ index.ts                                  export { VideoPlayer, type VideoPlayerHandle }
│   │   └─ ui/{video-player.tsx, video-player.module.css}
│   ├─ clip-heatmap/                                  [신규]  타임라인 위 6px 밀도 바 + 피크/틱 마커(클릭 seek)
│   │   ├─ index.ts                                  export { ClipHeatmap }
│   │   └─ ui/{clip-heatmap.tsx, clip-heatmap.module.css}
│   ├─ social-sidebar/                                [신규]  우측 사이드바(펼침450/접힘60): 작성버튼+인사이트 단일탭+collapse토글+댓글카드스택(목킹)
│   │   ├─ index.ts                                  export { SocialSidebar }
│   │   └─ ui/{social-sidebar.tsx, social-sidebar.module.css, comment-card.tsx, comment-card.module.css}
│   ├─ similar-content/                               [신규]  비슷한 컨텐츠 캐러셀(252×232 카드 + 우측 -90deg 페이드)
│   │   ├─ index.ts                                  export { SimilarContent }
│   │   └─ ui/{similar-content.tsx, similar-content.module.css}
│   ├─ app-shell/  sidebar/  topbar/  breadcrumb/    [재사용]  u0c 셸 — 슬롯 주입(무변경)
│   └─ (분석그룹: cohort-most-watched / popular-segments / impressive-insights)
│       └─ 본 단위 규모상 widgets 신규 슬라이스로 분리하지 않고 pages/content-detail/ui 하위 컴포넌트 + entities 표현으로 구성.
│         (재사용성 낮은 1회용 합성 → 페이지 내부 컴포넌트. WIP 상한·안티-증식 준수.)
│
├─ features/
│   ├─ view-insights/                                 [신규]  content_clips_public 조회 훅 + 인사이트 카드/인기구간/코호트 시그널 표현 로직
│   │   ├─ index.ts                                  export { useContentInsights, useContentHeatmap, ... }
│   │   ├─ api/{insights-query.ts, heatmap-query.ts}  shared/api 래퍼 호출 → react-query 훅
│   │   ├─ model/{cohort.ts}                          코호트 라벨/랭킹/연차범례 도출(cohort_revealed=false → "이 외" 버킷)
│   │   └─ ui/{insight-card.tsx, popular-segments.tsx, cohort-banner.tsx, *.module.css}
│   ├─ toggle-clip-like/                              [신규]  좋아요 토글 (DM1 옵션1: UI + 목킹/비활성, 미인증→로그인 유도)
│   │   ├─ index.ts
│   │   └─ ui/{like-button.tsx, like-button.module.css}
│   ├─ add-clip/                                      [신규]  클립 추가 액션 트리거(웹 모달=u3 소관 → u4는 버튼 + 진입 트리거/로그인 유도만)
│   │   ├─ index.ts
│   │   └─ ui/{add-clip-button.tsx, add-clip-button.module.css}
│   └─ social-login/  extension-install-modal/        [재사용]  비로그인 쓰기 → 로그인 유도, 톱바 CTA
│
├─ entities/
│   ├─ content/                                       [수정]  ContentMeta 표현 확장(grabCount·uploadedAt·tags·providerContentId 표시 필드 — 읽기/표현만, 계약 무변경)
│   │   ├─ index.ts                                  export 추가(표현 타입·포맷터)
│   │   ├─ model/types.ts                             ContentMeta(기존) + ContentDetail(표현 합성: meta+태그+그랩수) 표현 타입
│   │   └─ lib/{format-meta.ts}                       업로드일 "2025.03.17"·"그랩 16개" 포맷
│   ├─ clip/                                          [수정]  PublicClip(=content_clips_public 1행) 표현 타입 + 시간라벨(formatClock 재사용)
│   │   ├─ index.ts
│   │   └─ model/types.ts                             PublicClip{ contentId, clipId, startSec, endSec, memo, cohortJob|null, cohortYears|null, cohortRevealed } — ★user_id/실명 키 부재
│   └─ annotation/                                    [신규·표현 전용 — DB 엔티티 ❌]  목킹 댓글/답글 표현 타입(MockComment)
│       ├─ index.ts                                  export { type MockComment, DEMO_COMMENTS }
│       └─ model/{types.ts, demo-comments.ts}        프레임 카피(이수호/이하성/손종원 등 실명 = 목 상수, BE 미연결)
│
└─ shared/
    ├─ api/                                           [수정]  u0b read RPC 래퍼 + DTO + 데모 시드 추가(소비만)
    │   ├─ index.ts                                  export 추가(getContentSocialClips·getContentHeatmap·getContentMeta·demoContentDetail…)
    │   ├─ content-read.ts                            [신규] supabase.rpc('get_content_social_clips'|'content_heatmap') + contents 메타 조회 래퍼
    │   ├─ types.ts                                   [수정] PublicClipDto·HeatmapBucketDto·ContentMetaDto 추가
    │   └─ demo-data.ts                               [수정] demoContentDetail/demoInsights/demoHeatmap/demoSimilar 시드 추가
    ├─ ui/  lib/  config/                             [재사용]  Button·Chip·Card·Tabs·Toggle·Avatar·Badge / formatClock / env
    └─ types/                                         [재사용]  공유 타입(있으면)
```

라우팅: `app.tsx`의 `content/:id` element를 `<RequireOnboarded>` 가드 **유지한 채** `<ContentDetailPage/>`로 교체(현 가드 일관 — 단, spec L1-비로그인은 열람 허용 정책 → §4 비로그인 분기 참조: 가드 완화 또는 페이지 내부 분기는 게이트 결정. 기본 = 현 가드 유지 + 페이지 내부에서 쓰기만 로그인 유도). `content-detail-stub/` 삭제.

---

## 2. 컴포넌트 재사용 맵 + 토큰/치수 표 + 토큰 갭 처리

### 2.1 재사용 (shared/ui · widgets)
| 화면 요소 | 재사용 컴포넌트 | 비고 |
|---|---|---|
| 앱 셸(GNB254 + 톱바56 + 본문) | `widgets/app-shell` `widgets/sidebar` `widgets/topbar` | 슬롯 주입, 무변경. 라이브러리 컨텍스트(2117:*)도 동일 셸 |
| 톱바 브레드크럼·확장설치/로그인 pill | `widgets/topbar` + `shared/ui/Breadcrumb` `Button` | 홈/원본소스 톱바 동일 |
| 액션 버튼(원본링크·좋아요·클립추가) | `shared/ui/Button` | size=md(h34)·variant 보더형/라이트솔리드 — 단 pad `8/14/8/11` 비대칭은 콘텐츠상세 전용 클래스 필요(아래 갭) |
| underline 탭(시청정보/원본소스) | `shared/ui/Tabs`(underline 변형) | active=2px `#FFFFFF`·16/SemiBold. 컴포넌트가 없으면 페이지 전용 세그먼트로 구현 |
| 태그칩(마인드셋·IT·창업) | `shared/ui/Chip` | h24·pad10/8·radius4·bg surface-hover·`#CECECE` |
| 작성/확장설치 버튼(사이드바) | `shared/ui/Button` size=sm(h38)·radius-btn-write(7) | fill `#333333` |
| 코호트 칩·아바타·랭킹 배지 | `shared/ui/Chip` `Avatar`(xs18) `Badge` | 랭킹 숫자배지 22×22 radius100 |
| 시간 라벨 "10:11~12:42" | `entities/clip` `formatClock` | 재사용 |

### 2.2 토큰/치수 표 (실측 — tokens.css 매칭)
| 항목 | 측정값 | 토큰(보유) |
|---|---|---|
| 콘텐츠 패널 면 | `#121212` radius8 | `--color-shell-bg` `--radius-md` |
| 본문폭(펼침) | player 1156 · 메타/히트맵/인사이트 1148 | (레이아웃 상수) |
| 본문폭(접힘) | player 1546 · 본문 1538 | (레이아웃 상수) |
| 우측 사이드바 | 펼침 450 · 접힘 60, h1024/1034, x도킹 | (레이아웃 상수) |
| 사이드바 좌보더 | 1px rgba(255,255,255,0.12) | `--color-border-chip` |
| 플레이어 | 1156×650 radius10 | `--radius-10` |
| 세그먼트 토글 컨테이너 | h36 pad4 gap10 radius100 bg(0.04) | `--size-tab`(36) `--color-surface-ghost` `--radius-pill` |
| 세그먼트 active | h28 pad8/12 fill `#363636` 13/600/130/-2.5% `#FAFAFA` | `--size-tab-item`(28) `--color-surface-tab-selected` `--color-white` |
| 세그먼트 inactive | 투명 13/500 `#999999` | `--color-text-tertiary` |
| 히트맵 컨테이너 | 1148×18(펼침) / 1538×18(접힘) | (상수) |
| 히트맵 트랙 베이스 | h6 rgba(255,255,255,0.12) | `--color-border-chip` |
| 히트맵 진행 세그먼트 | h6 `#777777` | **GAP** `--color-heatmap-track:#777777` |
| 히트맵 피크 마커 | 25×18 `#26FA01` (x실측: 펼침 42·97 / 13354계 42·97; 접힘 112·212) | **GAP** `--color-heatmap-peak:#26FA01` |
| 히트맵 틱 마커 | 21×15 ×N + 22×16 ×1 SVG, y2~3 (x실측 12538: 321·451·680·724·1036) | 동일 `#26FA01` |
| 타이틀 | 22/Bold/130/-2% `#FFFFFF` | **GAP** type ramp 22 부재(title-4=20·title-3=24 사이) |
| 액션 버튼 | h34 radius8 pad `8/14/8/11` gap6 | `--size-button-md` `--radius-md` `--space-5_5`(11) `--text-button-action` |
| 원본링크/좋아요 보더 | 1px `#363636` | `--color-stroke-300` |
| 클립추가 솔리드 | fill `#EFEFEF` 글자 `#171717` | `--color-btn-light-solid` `--color-text-on-light-solid` |
| 메타 날짜 | 14/Regular/130 `#B4B4B4` | `--color-gray-500` |
| 메타 구분점 | 2×2 `#999999` | `--color-gray-450` |
| 태그칩 | h24 pad10/8 radius4 bg(0.06) 14/Regular/160/-2% `#CECECE` | `--color-surface-hover` `--radius-xs` `--color-gray-550` |
| 카드면(인사이트·유사·캡션) | bg(0.04) border(0.08) radius12 | `--color-surface-ghost` `--color-border-subtle` `--radius-lg` |
| 통계 박스 보더 | 1px rgba(255,255,255,0.1) | `--color-border-default` |
| 코호트 색(violet/mint/magenta) | `#727AD0`/`#72D0A6`/`#B472D0` | `--color-accent-violet` `--color-accent-mint` `--color-author-magenta` |
| 랭킹 1위 숫자 | `#38C524` | **GAP** `--color-rank-first:#38C524` |
| 작성자 직군 라벨 | 12/Medium/130/-2.5% `#727AD0` | `--color-accent-violet` |
| 사이드바 탭 active | underline 2px `#FFFFFF` · 16/SemiBold `#FFFFFF` + 카운트 16/Regular `#B4B4B4` | `--color-white-pure` `--text-tab-underline` |
| 사이드바 탭바 하단 보더 | 1px `#2D2D2D` | **GAP** `--color-tab-border:#2D2D2D`(stroke-200 #2E2E2E와 1차) |
| 작성 버튼 | h38 pad10/18 fill `#333333` radius7 14/SemiBold `#FFFFFF`(ls 0) | `--size-button-sm` `--color-btn-solid-gray` `--radius-btn-write` |
| collapse 토글 | 32w pad3/6 radius6 아이콘20×20 | `--radius-sm` |
| 유사 카드 play 오버레이 YT | 24×24 `#ED1D24` + bg(0,0,0,0.32) backdrop-blur2 | **GAP** `--color-youtube-red:#ED1D24` + `--color-overlay-black-32:rgba(0,0,0,0.32)` |
| 플레이어 그림자 | 0 0 12 0 rgba(0,0,0,0.16) | **GAP** `--shadow-player`(shadow-card blur16/0.24와 상이) |
| 하단/페이드 backdrop-blur | 2px | (토큰 미정의 → CSS `backdrop-filter:blur(2px)` 직접) |
| 원본정보 라벨/값 | 15/Regular/130/-2.5% `#B4B4B4` / 15/Medium/130 `#FAFAFA` | body-2(15·160%)와 lh상이 → **컴포넌트 전용 클래스**(info-label/value 15·130) |

### 2.3 토큰 갭 처리 (★실측 출처 명기 — 추측 ❌)
세 측정문서가 **일관 보고**한 7개 갭. u0c 토큰 SoT(`src/app/styles/tokens.css`)는 **u0c가 락** → u4는 `tokens.css` 직접 수정 금지(Boundaries: u0c 토큰 무변경). 처리:
- **(권장) `pages/content-detail/ui/content-detail-page.module.css` 상단 또는 `widgets/*/ui/*.module.css` 로컬에 `:root` 추가가 아닌 — 컴포넌트-스코프 CSS 변수**로 정의(슬라이스 로컬). 토큰명은 위 GAP명 그대로 사용해 일관:
  ```css
  --color-heatmap-track: #777777;   /* 12538§4 layout_PZ0UPU / 13772§6 fill_6B5SZJ */
  --color-heatmap-peak: #26FA01;    /* 12538§4 fill_LNUG7B / 13354§2 fill_4LCYJH / 13772§6 fill_XSVWBF — brand #66FF4B와 별개 */
  --color-rank-first: #38C524;      /* 12538§7.2 랭킹1위 숫자 */
  --color-youtube-red: #ED1D24;     /* 12538§6.1 유사카드 play YT 아이콘 fill_MLJ0KB (※히트맵 마커 아님) */
  --color-tab-border: #2D2D2D;      /* 12538§8 / 13354§7a fill_MMKKDD */
  --color-overlay-black-32: rgba(0,0,0,0.32); /* 13772§5 통계배지 fill_8KBXWV */
  --shadow-player: 0px 0px 12px 0px rgba(0,0,0,0.16); /* 12538§3 effect_TY9MYR */
  ```
- **타이포 22px**(타이틀)·**info-label/value 15·130%**: type ramp 갭 → 슬라이스 CSS에서 `font-size:22px; line-height:130%; letter-spacing:-2%` 직접(컴포넌트 전용).
- ★ 마커 색 = **`#26FA01`(녹색)**. spec/카디널룰 텍스트의 "마커 6×6 `#ED1D24`(빨강)"는 **세 측정문서 모두 부재로 확인** → 실측(녹색 25×18 + 틱 21×15) 채택, `#ED1D24`는 유사카드 YT 아이콘. 갭 토큰 확정 전 PM 1회 확인 권장(게이트ⓒ).

---

## 3. 데이터 배선 (u0b 계약 소비만 · 변경 ❌)

### 3.1 RPC 계약 요약 (실측 — 정확 이름/인자/반환)
| 용도 | RPC/뷰 | 인자 | 반환 컬럼 | 출처 |
|---|---|---|---|---|
| 인사이트(공개클립) | `get_content_social_clips(p_content_id uuid)` → setof `content_clips_public` | `p_content_id` | `content_id, clip_id, start_sec, end_sec, memo, cohort_job(null<N), cohort_years(null<N), cohort_revealed(bool), created_at` | 0007 L89-93 |
| 히트맵 | `content_heatmap(p_content_id uuid, p_bucket_sec int default 10)` | `p_content_id`(+옵션 bucket) | `table(bucket_start int, bucket_end int, density int)` | 0008 L10-44 |
| 콘텐츠 메타 | `contents` 테이블 select(RLS select=true) | `id` eq | `id, provider, provider_content_id, canonical_url, title, channel, duration_sec, thumbnail_url, is_unavailable` | 0002 |
| (참고) annotations 공개 | `get_content_annotations(p_content_id)` → `content_annotations_public` | — | **DM1 옵션1 = 미사용**(우측 댓글은 목킹) | 0007 L95-99 |
| 익명 임계 N=5 | `anonymization_threshold()` immutable=5 | — | cohort_job/years는 뷰가 이미 null화 → 클라는 `cohort_revealed`만 신뢰 | 0007 L15-17 |

**★단언(테스트로 보장):** 반환 셰이프에 `user_id`·`display_name`·`email` **키 부재**(0007 정의상 SELECT 안 함). 클라이언트는 raw `clips` 테이블을 **직접 쿼리하지 않음**(RLS=self만, cross-user 0행) — 히트맵/인사이트는 RPC 경로만.

### 3.2 shared/api 래퍼 (`content-read.ts` 신규)
```ts
getContentSocialClips(contentId, client?) : Promise<PublicClipDto[]>   // rpc('get_content_social_clips',{p_content_id})
getContentHeatmap(contentId, client?)     : Promise<HeatmapBucketDto[]> // rpc('content_heatmap',{p_content_id})
getContentMeta(contentId, client?)        : Promise<ContentMetaDto|null> // from('contents').select(...).eq('id',contentId).maybeSingle()
```
snake→camel 매핑은 래퍼 내부에서만(ingest-clip.ts `toClip` 패턴 거울). `client==null` → throw → 상위가 demo 폴백.

### 3.3 features 훅 (react-query — home 패턴 동일)
- `useContentMeta(id)` / `useContentInsights(id)` / `useContentHeatmap(id)`: `isSupabaseReady` 분기. 실배선=래퍼, 미구성/실패=`demoContentDetail/demoInsights/demoHeatmap`(demo-data.ts). `retry:false`.
- `useSimilarContent(id)`: **콜드스타트 폴백**(ADR-0002 #7) — 추천 알고리즘 없음 → 전역 인기/시드 배열(`demoSimilar`). 0건 시 빈상태.
- 코호트 도출(`model/cohort.ts`): `cohort_revealed=false` 행 → 라벨 숨김("이 외 직군" 버킷·연차 미표기). `cohort_job/years` null이면 코호트 칩/배너 미표시(임계 미달). 랭킹은 `cohort_revealed` 그룹 집계.

### 3.4 댓글/답글 = 목킹(DM1 옵션1 — 데이터패스 차단)
- `entities/annotation/model/demo-comments.ts` = 프레임 카피 상수(`DEMO_COMMENTS`: 작성자·직군·인용메모·구간·좋아요수·"답글 N개 모두 보기"·"1시간 전"). **BE 미연결**(annotations RPC 미호출).
- 우측 `SocialSidebar` 댓글 카드 스택 = `DEMO_COMMENTS` 렌더(픽셀퍼펙트), `작성`/좋아요/답글펼침 = **비활성 또는 로그인 유도**(쓰기 데이터패스 없음). 실명 노출은 목 상수에 한정(실 BE에서 익명 위반 0).
- 좋아요(`toggle-clip-like`)·클립추가(`add-clip`)·작성 = UI만. 미인증 → `social-login` 유도. (status.md에 "DM1 옵션1: 댓글/작성 데이터패스 차단" 기록.)

### 3.5 MSW/목 셰이프 (테스트 결정론)
- repo는 MSW 미사용 → **`vi.mock('@/shared/api')`** 패턴(home-feed.contract.test 거울): `isSupabaseReady=false` 강제 → demo 시드 경로. 또는 `getContentSocialClips`/`getContentHeatmap`을 직접 mock해 sanitized 응답 배열 반환.
- 목 응답 셰이프(단언 대상):
  - 인사이트: `{contentId, clipId, startSec, endSec, memo, cohortJob, cohortYears, cohortRevealed, createdAt}` — ★`userId`/`displayName` **부재**.
  - 히트맵: `{bucketStart, bucketEnd, density}[]`.
  - `cohortRevealed:false` 행 1건 포함(임계 미달 숨김 검증).

---

## 4. 빈/로딩/에러/비로그인 상태 (디자인 공백 → u0c/u0b 파운데이션으로)

| 상태 | 처리 |
|---|---|
| **로딩** | 플레이어 16:9 placeholder(radius10) · 인사이트/유사 카드 스켈레톤(bg surface-ghost) · 히트맵 트랙만 표시(마커 없음). u0c 스켈레톤/스피너 토큰. |
| **에러(404)** | `getContentMeta`→null → "콘텐츠 없음" 표면 + 홈 복귀. |
| **에러(삭제/비공개)** | `is_unavailable=true` 또는 메타 fetch 실패 → 플레이어 자리에 안내 + **`원본 링크` 폴백**(canonical_url 새 탭). |
| **에러(sanitized read 실패)** | 인사이트/히트맵 fetch 실패 → 해당 섹션 빈상태 문구(페이지는 렌더 유지 — 부분 실패 격리). |
| **빈: 클립 0건** | 히트맵 `density` 전부 0 / 빈 배열 → **바 비활성(마커 미표시, 트랙만)**. 인기구간·인사이트 빈상태 문구. |
| **빈: 비슷한컨텐츠 0건** | 콜드스타트 폴백 시드도 0이면 캐러셀 빈상태. |
| **빈: 코호트 N<임계** | `cohort_revealed=false` → "이 컨텐츠를 [코호트]가…" 배너 미표시 또는 "이 외 직군" 버킷. 인사이트 작성자 라벨 코호트 숨김. |
| **비로그인(IQDAKF)** | 상세 **열람 가능**(역할에 비회원). `좋아요`/`클립 추가`/`작성` 클릭 → **로그인 유도**(톱바 `로그인` pill 동작). ⚠ 현 `app.tsx` 라우트가 `<RequireOnboarded>` 가드 중 → spec 비회원 열람과 충돌. **게이트ⓒ 결정 항목**: (a) 가드 유지(회원만, 단순) vs (b) `/content/:id`만 가드 완화 + 페이지 내부 쓰기 로그인 유도. 기본안=(a) 유지하되 PM 확인. |

---

## 5. 테스트 계획

**`pages/content-detail/ui/content-detail.contract.test.tsx`** (FE — `vi.mock('@/shared/api')` 결정론, MemoryRouter):
1. **탭 전환**: `시청 정보`↔`원본 소스` 클릭 → 본문 스왑(원본소스 탭에 "원본 컨텐츠 정보" 카드 렌더, 시청정보엔 플레이어/히트맵). active underline 표시.
2. **사이드바 토글**: collapse 클릭 → 우측 패널 450→60(작성+expand만), 본문 1148→1538 리플로우. expand 클릭 → 복귀.
3. **마커 seek**: 히트맵 피크/틱 마커 + `가장 인기있는 구간` 카드 클릭 → `VideoPlayer` `seekTo(startSec)` 호출(스파이로 인자 단언).
4. **인사이트 sanitized 셰이프**: 목 응답이 `{cohortJob, cohortYears, cohortRevealed, startSec, endSec, memo}`만 가지며 **`userId`/`displayName` 키 부재**를 단언. `cohortRevealed:false` 행 → 코호트 라벨 미렌더.
5. **히트맵 0건**: 빈 배열 → 바 비활성(마커 0개) 단언.
6. **★AI 노트 탭 미렌더**: 우측 탭 strip에 "AI 노트" 텍스트 **없음**(`queryByText('AI 노트')==null`). **Sparkle mini FAB 미렌더** 단언.
7. **댓글 목킹 비활성**: 우측 댓글 카드는 `DEMO_COMMENTS`로 렌더되나 `작성`/좋아요는 BE 미호출(supabase.rpc 미발생 단언).
8. **유사컨텐츠 navigate**: 카드 클릭 → `/content/:otherId` 라우팅(home 테스트 ContentRouteProbe 패턴).

**`shared/api/content-read.test.ts`** (BE 배선): `rpc('get_content_social_clips',{p_content_id})`·`rpc('content_heatmap',{p_content_id})` 정확 호출 단언 + raw `clips` 미쿼리 + snake→camel 매핑 + null client→throw(demo 폴백). 404(maybeSingle null)·미인증 쓰기 401 매핑.

**유지**: `tsc -b` 0 · `lint` 0 · `lint:fsd` 0(하향 임포트·배럴) · 콘솔 0 · `/design-review` 프레임 1:1 PASS(2087:12538/13354/13772 + 2117:20168 스크린샷 첨부).
> cross-user 누출 0은 u0b pgTAP `derived-api-no-leak`가 정본 → u4 테스트는 **셰이프 단언만**(동어반복 회피).

---

## 6. Boundaries 재확인

- **only edit (FE)**: `pages/content-detail/**` · `widgets/{video-player,clip-heatmap,social-sidebar,similar-content}/**` · `features/{toggle-clip-like,add-clip,view-insights}/**` · `entities/{content,clip,annotation}/**`(배럴·하향) · `shared/api/{content-read.ts,types.ts,demo-data.ts,index.ts}`(read 소비 추가) · `app/app.tsx`(라우트 1줄 교체) · `app/content-detail-stub/`(삭제).
- **do not change (미접촉)**: u0b 락 계약 — `content_clips_public`·`content_annotations_public`·`content_heatmap`·`get_or_create_content`·`get_content_social_clips`·RLS·`anonymization_threshold`(0001~0012 마이그레이션 전부) = **소비만**. u0c 토큰(`app/styles/tokens.css`)·앱셸·`shared/ui`. 인증/결제. **신규 마이그레이션 ❌**(DM1 옵션1).
- **AI 제외(영구 컷)**: AI 패널(2278:*)·`AI 노트` 탭·`Sparkle mini` FAB → **미렌더**(우측 탭=인사이트 단일). 죽은 UI ❌.
- **다음 스프린트(정적)**: annotations(+replies+likes) 엔티티·실명 정책(ADR-0003 후보) · 아티클 클리핑/하이라이트 · AI 요약 · 추천 알고리즘 고도화.
- **out of scope**: 클립 *생성*(웹모달=u3·확장=u6) · 라이브러리 리스트/폴더(u7) · 검색(u8) · 결제/Pro/페이월 · 대시보드.
- main 직접 푸시 ❌ · force-push ❌ · blast radius = `feat/u4-content-detail`.

---

## 리스크 / 게이트ⓒ 확인 항목
1. **히트맵 마커 색 충돌**: spec 텍스트=`#ED1D24` 6×6 빨강 vs 실측=`#26FA01` 25×18 녹색(+틱). 세 측정문서 일치로 **녹색 채택** — 게이트ⓒ에서 PM 1회 사인오프.
2. **비로그인 열람 vs 라우트 가드**: 현 `/content/:id` = `<RequireOnboarded>`. spec=비회원 열람. §4(a)/(b) 중 택1 — PM 결정.
3. **히트맵 bucket→픽셀 매핑**: RPC는 `bucket_sec` 밀도 배열, 프레임은 절대 px 마커. duration_sec(메타)로 타임라인 스케일 → bucket을 px 위치 변환. duration null이면 max(end_sec) 폴백(0008 bounds 로직 거울). 마커 px는 밀도 피크에서 도출(프레임 고정 px는 데모 한정).
4. **underline 탭 컴포넌트 부재 가능**: `shared/ui/Tabs`에 underline 변형 없으면 페이지 전용 구현(토큰 사용) — u0c 무변경 유지.
5. **YouTube iframe seekTo**: IFrame Player API 로드(`onYouTubeIframeAPIReady`) 비동기 → `VideoPlayerHandle.seekTo` ref 명령. 테스트는 ref 스파이로 대체(실 iframe 미로드).
6. **DM1 데이터패스 차단 회귀**: 댓글/작성이 실수로 BE 호출 시 익명 위반 → 테스트7(rpc 미발생)로 가드.
7. **annotation 엔티티 명명 혼동**: `entities/annotation`은 **표현 전용 목 타입**(DB annotations 테이블과 무관). 배럴 주석으로 명시 — 다음 스프린트 실엔티티와 충돌 방지.

---

## RPC 계약 요약 (소비만 · 변경 ❌)
- `get_content_social_clips(p_content_id uuid)` → `content_clips_public`{content_id, clip_id, start_sec, end_sec, memo, cohort_job, cohort_years, cohort_revealed, created_at} — **user_id/실명 키 부재**(0007).
- `content_heatmap(p_content_id uuid, p_bucket_sec int=10)` → `table(bucket_start int, bucket_end int, density int)` — content_clips_public 파생(end-exclusive overlap, identity-free) (0008).
- `contents` select(RLS select=true)로 메타(title·channel·duration_sec·thumbnail_url·provider·provider_content_id·canonical_url·is_unavailable) (0002).
- `anonymization_threshold()=5` — 클라는 `cohort_revealed`만 신뢰(뷰가 이미 null화) (0007).
- 미사용(DM1 옵션1): `get_content_annotations`/`content_annotations_public`(댓글=목킹).
