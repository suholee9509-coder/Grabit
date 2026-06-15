# u0-design-system — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **phase ① 완료 (디자이너 에이전트 추출+1차 스켈레톤) → 사용자 인계 대기**
- 검증:
  - ✅ Figma `668:29` globalVars.styles 정확값 추출(색 25그룹·타이포 12·간격 12·반경 8·**그림자 4**).
  - ✅ shared/ui 11개 컴포넌트 + 배럴 생성, 추출 토큰만 사용(하드코딩 색 없음 — Pro 보라 1건만 주석 표기).
  - ✅ FSD 정적 확인: `shared/ui`에 상위 레이어(`@/app|pages|widgets|features|entities`) 임포트 0건.
  - ⏳ **미검증(phase ②)**: `tsc -b`/`lint`/`lint:fsd`/렌더 — node_modules 부재(install 필요, 빌드는 사용자).
- 변경 파일:
  - `apps/web/src/app/styles/tokens.css` (비움 → 추출 토큰 채움)
  - `apps/web/src/shared/ui/{button,chip,card,tabs,toggle,input,dropdown,modal,toast,avatar,badge}/` (각 .tsx + .module.css + index.ts) + `shared/ui/index.ts` 배럴 (`.gitkeep` 제거)
  - `apps/web/src/app/ui-preview/{ui-preview.tsx,ui-preview.module.css}` (신규)
  - `apps/web/src/app/app.tsx` (`/ui-preview` stub → 실제 미리보기 마운트)
  - `docs/units/u0-design-system/extraction-inventory.md` (신규)
- 설계 노트:
  - 토큰 정준 SoT = `668:29` "Color System - Dark Mode" 스와치(시맨틱명) + globalVars.styles(정확값). 다크 기준.
  - 타이포 = Pretendard, Figma 명명 스케일 Title/Body/Caption 12종 토큰화(Display/Headline 미사용 제외).
  - 컴포넌트 props 매핑 출처 = metadata.components(Type/State/Size/Selected/Solid/Expanded/Disabled).
- 리스크 / gap (상세 = extraction-inventory.md §3):
  - ⚠ **컴포넌트 SECTION `2562:7927`은 html.to.design 임포트물** — 이름 제거 + 비정준 팔레트(Tailwind-grey/#66FF4B).
    토큰은 `668:29` 정준, 컴포넌트 *치수*는 실화면 프레임으로 phase ② 보정 필요.
  - ⚠ Toggle/Toast 전용 디자인 미확인(추정 스켈레톤) · Pro 보라/다크 텍스트 위계 미토큰화 · spacing 4 vs 10 혼재.
- ESCALATION: (없음 — 공백은 추측 ❌, inventory에 표면화하고 phase ②/게이트로 위임)

STATUS = "phase ① DONE — 토큰·shared/ui 1차 추출 완료. 사용자 인터랙티브 워크트리에서 phase ②(픽셀-퍼펙트 마감 + tsc/lint/렌더 검증 + /design-review + 게이트 ⓒ) 대기. 공백: extraction-inventory.md §3·체크리스트 §4."
