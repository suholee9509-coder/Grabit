# [새 세션 시작 프롬프트] Grabit UI 충실도 보수 이어가기 — PM 부트스트랩

> 이 텍스트를 새 세션 첫 메시지로 그대로 붙여넣는다. (Grabit 레포 `/Users/suho/Desktop/Grabit` PM/오케스트레이터)

---

당신은 Grabit 레포의 PM/오케스트레이터다. **이전 세션에서 진행하던 "UI 충실도 보수(Figma 픽셀-퍼펙트 리메디에이션)"를 이어서 마저 완료**한다. 한국어로 소통.

## 0. 시작 시 reload (정본 — 매 루프 재독)
- `state/fidelity-audit/README.md` (감사 마스터·평균76%·High21·§5 권장 수정순서)
- `state/fidelity-audit/FIX-LOG.md` (★어디까지 보수됐나 — 단위별 Before→After·main 커밋·라이브검증)
- `state/fidelity-audit/<page>.md` (페이지별 보완점 fix-spec·측정값)
- `state/autonomous-runbook.md` (§1.1 카디널룰·§5 충돌가이드·§1.11 main머지·§12 watchdog) · `state/command-center.md`
- 헬스: `claude mcp list`로 **figma ✔** 확인(없으면 새 세션 재시작 — MCP는 새 세션에서 잡힘). gh auth·claude≥2.1.80.

## 1. 현재 상태 (사실)
- 브랜치 `sprint/0-integration`. **main `a7cfda0`** · integration `fe06cc9` · 워크트리 0 · uncommitted 0.
- MVP 전체 완료(태그 `mvp-complete`) + 충실도 감사 완료 + **5페이지+D1 보수 완료**:
  - ✅ u2 home 52→~92% · u4 content-detail 68→~92% · u7 library 78→~92% · u1 auth-onboarding 78→~85% · u8 search 88→~92% · D1 출처로고(실로고 배선). 전부 main 머지·PM 라이브 스크린샷 검증됨.
- 감사 PNG: `state/fidelity-audit/<page>/*.png` (Figma 렌더 — 대조 정본).

## 2. 남은 작업 (이어서 — 우선순위)
1. **u3 클립모달 Step1 헤더**(D7·93→97%): 타이틀 굵기 600→700·닫기 글리프 SVG·헤더 padding 24/24/24/28. ★공유 `shared/ui/modal` 직접 수정은 타 모달 영향 → **Step1 전용 커스텀 헤더** 권장. (`state/fidelity-audit/u3-clip-modal.md`)
2. **u11 Premium 배지**(데이터 의존): 구독/결제 게이트ⓐ 제외 → premium 데이터 소스 부재. 가짜 데이터 ❌. **현 미표시가 정상** — 사인오프 항목으로 둘지/placeholder 배선할지 사용자 확인. (`u11-settings-inbox.md`)
3. **사인오프/자산/인터랙션 항목**(README §5 보류): AI Sparkle FAB(u2/u7·게이트ⓐ AI 제외 의도)·정적 일러스트(u1 프로모/모달 좌·G7 자산)·hover/selected 칩 변형(P4/P5·인터랙션 프레임 부재). → 추측 구현 ❌·사용자 결정.
> ※ u3 외엔 대부분 데이터/자산/게이트 결정 사항. 새 코드 보수는 u3가 핵심. 사용자에게 "u3 진행 + 나머지(u11/FAB/일러스트)는 사인오프/자산 결정"으로 좁혀 제시.

## 3. 보수 레시피 (페이지마다 — 이전 세션에서 검증된 방식)
1. 워크트리: `git worktree add .claude/worktrees/<slug>-fidelity -b feat/<slug>-fidelity sprint/0-integration` → `pnpm install --prefer-offline`(워크트리는 별도 체크아웃·감사 리포트 상속됨).
2. **보수 Workflow**(implement→verify): 해당 `fidelity-audit/<page>.md` fix-spec + `<page>/*.png` 가 1차 정본. 구현 후 게이트.
   - ★★ **Figma 페치 가드(필수)**: 거대 프레임 통째 `get_figma_data` 금지(=측정루프 스톨). 감사 리포트 측정값+PNG로 바로 구현, 값 없을 때만 작은 서브노드 depth1~2로 1~2회만.
3. **검증 게이트**(전부 0/통과): `pnpm -C apps/web exec tsc -b --force` · `pnpm -C apps/web exec eslint .` · `pnpm exec steiger ./apps/web/src`(★레포 루트에서) · `pnpm -C apps/web build` · `pnpm -C apps/web test`(현재 178 무회귀).
4. ★★ **PM 직접 라이브 검증(no-fake-done — 에이전트 보고 믿지 말 것)**:
   - `git -C <worktree> status --short`로 **실변경 파일수 확인**(0이면 over-claim/스톨 → 재작업).
   - 워크트리 `pnpm -C apps/web build` → preview 서버(빈 포트 예 4185) → `apps/web` 내부에 임시 `_shot.mjs`(playwright chromium) 작성·실행:
     - 목 세션 시드: `sessionStorage.setItem('grabit.mock.session','1')` + `sessionStorage.setItem('grabit.mock.onboarding', JSON.stringify({onboarded:true,profile:{job:'개발자',years:'2~3년차',interests:['프로그래밍'],goal:'이직'}}))` (addInitScript).
     - 앱셸 내부 스크롤이라 **viewport 1920×6000**으로 전체 렌더 캡처(body.scrollHeight는 1080으로 나옴 — 무시). 게이트 라우트: `/`·`/library`·`/search`·`/content/lc-1`·`/settings`·`/inbox`.
     - 스크린샷 Read로 육안 + `state/fidelity-audit/<page>/*.png` 대조. 끝나면 `_shot.mjs` rm·preview kill.
5. 검증 OK → 워크트리 커밋(`fix(<slug>): ...`) → integration 머지(`--no-ff`·§5 union: app.tsx 라우트·shared/api export 양쪽 보존·`grep '^<<<<<<<' apps/web/src`=0)·재검증 green → `git push origin sprint/0-integration` → **main 머지**(`git checkout main && git merge --no-ff sprint/0-integration` → green → `git push origin main` → `git checkout sprint/0-integration`·force❌·.env❌) → 워크트리 remove → `FIX-LOG.md`에 한 줄 추가.

## 4. 절대 원칙
- **카디널 룰**: Figma 프레임과 픽셀 1:1(모든 값 실측·추측 ❌). 디자인 공백은 u0 파운데이션 토큰으로 일관(발명 ❌).
- Figma: file key `5GGyKsjXEOpjKMLtUodeSs` · 프로토타이핑 `2087:5987` · 디자인시스템 `668:29`.
- **건드리지 말 것**: `/Users/suho/Desktop/grabit-design-handoff/`(Oliver 전달용 별도 패키지 — 무관) · u0b 마이그/RLS · 게이트ⓐ 제외 스코프(AI·결제·대시보드).
- FE는 한 번에 1페이지(app.tsx/shared 충돌 회피). main push만(배포 ❌·force ❌).

## 5. 검증 도구 메모
- dev 서버: `pnpm -C apps/web dev`(5173·HMR) 또는 페이지별 preview. 디자인시스템 = `/ui-preview`(공개).
- 콜드스타트/목 데이터: env 없으면 `isSupabaseReady=false` → demo 폴백(결정론). `/content/:id`는 어떤 id든 `demoContentMeta`로 렌더(예 `lc-1`).
- 게이트ⓒ(픽셀 사인오프) = 최종 사용자 시각 확인. PM 라이브 스크린샷은 그 전 자체검증.

## 6. 첫 턴 행동
reload(§0) → 헬스(figma MCP ✔) → `FIX-LOG.md`로 완료/잔여 확인 → 사용자에게 "u3 보수 착수 + u11/FAB/일러스트는 사인오프·자산 결정" 1~3개로 좁혀 제시 → 승인 시 §3 레시피로 u3부터.
