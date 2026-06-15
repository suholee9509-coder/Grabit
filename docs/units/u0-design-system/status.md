# u0-design-system — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **phase ② 정밀 리팩토링 완료 (실화면 측정 적용) → 게이트 ⓒ 충실도 사인오프 대기**
- 검증 (본 워크트리에서 실행):
  - ✅ `pnpm tsc` (tsc -b) **exit 0**.
  - ✅ `pnpm lint` (eslint) **exit 0** (error/warning 0).
  - ✅ `pnpm lint:fsd` (steiger) **"No problems found!"** — shared/ui 상위 임포트 0.
  - ✅ 모든 CSS `var(--*)`가 tokens.css에 정의됨(orphan 0, 정적 대조).
  - ⏳ 시각 충실도(게이트 ⓒ): `/ui-preview` 렌더 → Figma 실화면 1:1 대조는 사용자.
- 변경 파일 (phase ②):
  - `apps/web/src/app/styles/tokens.css` — 실화면 측정 기반 정밀화: brand-primary #66FF4B·overlay-white 스케일·accent(violet/mint/premium)·size 토큰군·spacing 7/9/14·radius-search·shadow-modal/dropdown·on-primary(-alt)·tertiary 색 정정. (각 토큰 측정 출처 주석)
  - `apps/web/src/shared/ui/{button,chip,badge,tabs,input,dropdown,modal,card,avatar}/*.module.css` + 일부 `.tsx` — 측정 px 적용 + 변형 추가(button compact/pill·chip recommend·tabs segment/underline·input search·card compact·avatar xs/xl·badge inline).
  - `apps/web/src/shared/ui/{toggle,toast}/*.module.css` — 측정 GAP(프레임 부재) 표기 유지 + brand/모달 토큰으로 정합.
  - `apps/web/src/app/ui-preview/ui-preview.tsx` — 전 컴포넌트 변형·상태를 **측정 라벨**과 함께 렌더(게이트 ⓒ 대조용).
  - `docs/units/u0-design-system/extraction-inventory.md` — §0 phase ② 요약(델타·컴포넌트별 적용 치수) + §3-d 측정 GAP 추가.
- 핵심 정정 (1차 추출 → 측정):
  - brand = 비정준 SECTION의 muted-green `#00623A` → **실화면 네온 `#66FF4B`**(글자 #242424/#121212).
  - Chip = pill+filled-green-selected → **투명+rgba(white,.12) 보더+흰 글자·h42·radius 6**(★pill 아님).
  - Tabs 기본 = pill(흰 채움) → **segment(선택 #363636 채움)**. Input bg #1F1F1F → **#242424**. Modal radius 16→12·bg #171717→#1F1F1F·shadow '모달'.
- 리스크 / gap (상세 = extraction-inventory.md §3-d):
  - ⚠ **측정 GAP**(추측 ❌, 합리 스켈레톤): Toggle·Toast(프레임 부재) · disabled/hover/pressed 상태 · Chip selected 채움 · Tertiary 버튼 · input focus 스트로크.
  - ⚠ **확인 필요**: on-primary #242424 vs #121212 통합 · pure-white #FFFFFF vs #FAFAFA 통일 (둘 다 토큰화해둠).
  - ⚠ 색 = 668:29 다크 SoT 유지(측정에서 발견된 미등재 색만 신규 토큰화) — 게이트 ⓒ에서 시각 대조 필요.
- ESCALATION: (없음 — 측정 GAP은 추측 ❌, inventory §3-d에 표면화. 커밋은 PM이 검증 후.)

STATUS = "phase ② DONE — 실화면 측정 적용 정밀 리팩토링 완료(tokens.css + 11 컴포넌트 + /ui-preview). tsc/lint/lint:fsd 전부 green. brand #66FF4B·칩 보더형·segment 탭·모달 #1F1F1F 등 1차 비정준값 정정. 남은 GAP: Toggle/Toast/상태변형/칩 채움(프레임 부재). 게이트 ⓒ(시각 충실도)는 사용자 /ui-preview 대조 대기. 미커밋(PM 검증 후)."
