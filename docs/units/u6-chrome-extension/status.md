# u6-chrome-extension — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **검증·수정 완료(검증 에이전트)** — 빌드/타입/테스트/충실도 게이트 전부 PASS. 커밋 ❌(PM 통합 대기).
- 검증 (실제 실행 결과 — clean worktree):
  - `wxt build` (chrome-mv3): **성공** (528.64 kB · manifest MV3 · perms storage/activeTab/scripting · host youtube.com/youtu.be).
  - `tsc --noEmit`: **0 에러** (strict + noUnusedLocals/Params).
  - `vitest run`: **7 파일 / 41 테스트 전부 PASS**.
  - 프로덕션 소스 `console.*` **0** · `@ts-ignore`/`as any` **0**.
- 검증 게이트 → spec §Validation 매핑:
  1. **contract** (`clip-ingest.contract.test.ts`): 확장 payload가 FROZEN u0b 계약(`supabase/functions/_shared/ingest-contract.ts`)을 통과·byte-equal · url AS-IS · [start,end) 정수·0길이금지 · memo nullable · 401/중복(updated_at>created_at)/400/network 해석. (서버 목킹·결정론적)
  2. **content script 주입** (`spa-mount.test.ts`): mount/unmount + **SPA pushState 재주입**(watch→watch remove-then-mount, watch→non-watch teardown, non-watch→watch inject). + Shadow DOM 격리(`youtube.test.ts` `:host{all:initial}` 누출0·host DOM 미변경).
  3. **타임코드 칩 양방향** (`resolve-trim.test.ts`·`time.test.ts`): [start,end) 경계·0길이·역전 방지·정수화·m:ss·구간길이(end exclusive).
  4. **인증 401→재로그인** (`ingest-flow.test.ts`): 유효세션 bearer 부착 · 401→dropSession(세션 폐기)→재로그인 · network-error는 세션 보존 · (chrome.storage 라운드트립 `storage-adapter.test.ts`).
- 충실도 자체검증 (Figma 실측 vs 구현 — 카디널 룰 1:1):
  - **Step4 모달**: 998×702 #1F1F1F radius12 shadow(effect_PWR0D3) dim rgba(0,0,0,.6) ✓ / 타임코드칩 82×38 radius4 border rgba(255,255,255,.08) Pretendard Rg14 ✓ / 공개토글 44×22 ON #2563EB knob18×18 ✓ / 폴더 드롭다운 509×38 padding 12 10 12 14 radius6 ✓ / 태그 +추가칩 #242424 radius6 h28 · 선택칩 rgba(255,255,255,.06) Rg13 #CECECE ✓ / [완료] 156×38 #66FF4B radius6 #121212 ✓ / 콜아웃 509×174 border#363636 ✓ / 트림핸들 #7FC573 · 재생헤드 3×52 #BE1616 ✓ / 헤더 padding 20 24 20 28 border-bottom rgba(255,255,255,.08) ✓.
  - **Step3 주입 버튼**: green pill 136×36 #66FF4B radius6 · SF Pro Bold 13 lh130% ls-2.5% #000 · top203/right47 ✓.
- 검증 에이전트 변경 파일 (boundary 준수 — apps/extension/** + docs figma만):
  - 신규: `apps/extension/src/entrypoints/content/model/spa-mount.ts`(+`.test.ts`) — SPA 재주입 순수 reconciler 추출(테스트 가능화).
  - 신규: `apps/extension/src/shared/ingest/ingest-flow.ts`(+`.test.ts`) — bearer→POST→401 세션폐기 오케스트레이션 추출.
  - 수정: `content/index.ts`(syncMount 사용) · `background.ts`(ingestWithAuth 사용) · `shared/ingest/index.ts`(배럴 export). apps/web·supabase/** 미접촉.
- 설계 노트: 무거운 단위(MV3) — 확장 골격 + content 주입 + 클립 모달 + 인증 + ingest 배선 모두 구현 완료. u0b ingest 계약 소비만(frozen). 타임코드 칩(82×38) = 이 유닛 정의.
- 잔여(PM 통합 시): ① `apps/web` install 안내 페이지(`2074:88587`)·`app.tsx` 라우트 추가는 PM이 통합(u2 충돌 방지 — 본 유닛 미접촉). ② `externally_connectable.matches`·WXT_* env(supabaseUrl/anonKey/webAppUrl)는 배포 오리진 확정 시 주입. ③ 토글 OFF 토큰(§4-1 비고) Figma 미제공 → rgba(255,255,255,.16) 임시(사인오프 필요). ④ Step1/Step2 발견·핀은 브라우저 크롬 UI 소유 → 직접 렌더 불가(안내/affordance 한정).

STATUS = "검증 완료: wxt build 성공 · tsc 0 · 7파일 41테스트 PASS(contract/주입·pushState재주입/타임코드칩/인증401→재로그인) · console 0 · Step4 모달·Step3 버튼 Figma 실측 1:1 자체검증 PASS. 커밋 ❌(PM 통합 대기). 잔여=web install페이지·env 주입·토글OFF 사인오프(PM)."
