# docs/design/ — 디자인 SoT (Source of Truth, '무엇')

Grabit UI는 **Figma에 픽스(90%+ 확정)**돼 있다. 이 디렉토리는 그 고정 디자인을 가리키는 **포인터 + 인벤토리**다. (디자인을 *생성*하지 않는다 — Figma가 1차 SoT.)

> 흐름: Figma(무엇) + `docs/source/`(왜·스코프) → PM이 스펙 역설계(`docs/units/<slug>/spec.md`) → frontend가 **Figma MCP로 프레임 연동 → 픽셀-퍼펙트 퍼블리싱** → QA 충실도 검증 → 게이트 ⓒ 사인오프.

## Figma 파일 (file key: `5GGyKsjXEOpjKMLtUodeSs`)
- **디자인 페이지**: https://www.figma.com/design/5GGyKsjXEOpjKMLtUodeSs/%EC%82%AC%EC%A1%B0%EC%B0%B8%EC%B9%98_Figma--Copy-?node-id=2087-5987 — page-id `2087:5987`
- **프로토타입**: https://www.figma.com/proto/5GGyKsjXEOpjKMLtUodeSs/%EC%82%AC%EC%A1%B0%EC%B0%B8%EC%B9%98_Figma--Copy-?node-id=2074-86591&starting-point-node-id=2074%3A86591&page-id=2087%3A5987 — start node `2074:86591`
- 접근: frontend/qa/PM이 **Figma MCP**로 프레임을 직접 연동(노드·스타일·측정값·이미지 추출).
- ✅ **Figma MCP 연결됨** (Framelink `figma-developer-mcp`, PAT, user 스코프 — 2026-06-15). **새 세션**에서 `mcp__figma__*` 도구 사용 가능(file key + node-id 기반). 모든 로컬 세션·워크트리·headless 스폰에 전파.

## 프레임 인벤토리 (Sprint 0에서 PM이 작성)
화면/플로우 → 작업단위 매핑의 기준. 각 행이 한 화면(+상태)이며 작업단위로 분해된다.

| 프레임(Figma) | 화면/플로우 | 상태(빈/로딩/에러) | 단위(slug) |
|---|---|---|---|
| _(TBD)_ | | | |

## 충실도 기준 (fidelity)
- **픽셀-퍼펙트 재현**: 구현 = 프레임 1:1 (토큰·색·간격·정렬·타이포·반경·상태별 스타일).
- 토큰은 Figma에서 **추출** → `src/app/styles` + Command Center §5 (눈대중 임의값 ❌).
- 검증: frontend 셀프 `/design-review`(프레임 대조) → QA `/design-review` 충실도 → 사용자 게이트 ⓒ.

## 디자인 공백 처리
프레임에 없는 상태/화면/엣지(예: 특정 에러 상태 미정의)는 **추측 구현 ❌** → frontend가 status.md escalation → PM 트리아지(사용자 디자인 결정 vs 스코프 제외).
