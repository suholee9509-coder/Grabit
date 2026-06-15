# Grabit

크롬 익스텐션 기반 영상 클리핑·큐레이션으로 성장 불안(FOMO)을 해소하는 커리어 콘텐츠 플랫폼 + 이를 빌드하는 **PM 중심 5-에이전트 오케스트레이션 시스템**.

## 무엇인가
- **제품**: 막연한 성장 불안으로 커리어 콘텐츠를 소비하지만 성장을 체감하지 못하는 사람을 위해, 긴 영상에서 핵심을 클리핑·큐레이션해 *체감되는 성장*으로 바꾸는 크롬 익스텐션 플랫폼.
- **워크플로우 = UI 역설계(디자인-퍼스트)**: UI가 **Figma에 픽스(90%+)**. 디자인을 *생성하지 않고* Figma MCP로 연동해 **픽셀-퍼펙트 퍼블리싱**. PM이 Figma('무엇') + 기획문서('왜·스코프')에서 스펙을 역설계. (디자인 SoT: `docs/design/` · 기획 SoT: `docs/source/`)
- **개발 방식**: PM 에이전트(메인 세션)가 전체를 알고, Feature 작업단위(화면/플로우)를 분해해 frontend/backend를 `/goal`로 자율 개발시키고, QA(기능완료마다)·Security(스프린트말)를 돌려 통합·머지한다.

## 팀 (5)
| | 역할 | 실행 |
|---|---|---|
| **pm** | 팀리드·오케스트레이터·범위 결정 | 메인 세션 |
| **frontend** | 디자인 + FE | headless `/goal` |
| **backend** | 알고리즘·AI·BE | headless `/goal` |
| **qa** | 기능완료 e2e | Agent 툴 |
| **security** | 스프린트말 감사 | Agent 툴 |

## 핵심 원칙
- **Feature 작업단위**: 한 소유자가 한 세션에 end-to-end. 작업 중 분할/파편 티켓 ❌ → 티켓 증식 차단.
- **`/goal` 자율 루프**: 강한 성공조건(5섹션·관찰가능) → 충족까지 루프. 진실의 원천 파일 매 턴 reload.
- **PM 티켓 독점** + 사용자 게이트(ⓐ스코프 ⓑ스프린트계획 ⓒ디자인 ⓓ머지).

## 시작
1. gstack 설치 확인 + Claude Code **v2.1.80+** (`/goal`).
2. GitHub 1회 셋업: [.github/SETUP.md](.github/SETUP.md) (라벨 + 보드 #2 + 라벨→Status 동기화).
3. PM 세션(이 레포 루트에서 Claude Code) → [CLAUDE.md](CLAUDE.md)가 부트스트랩.
4. 기획 문서 전달 → `docs/source/` 비치 → PM이 Sprint 0(아키텍처 ADR + 스캐폴딩)부터 시작.

## 스택
- **Sprint 0 ADR로 확정** ([state/decisions.md](state/decisions.md)). 권장 베이스라인은 [config/quality_standards.md](config/quality_standards.md).
- 모든 외부 추론/키 호출은 *서버측*만 — 클라이언트 번들에 키 노출 ❌.

## 구조
`.claude/agents` 페르소나 · `.claude/skills` 워크플로우 · `config/` 표준 · `state/` 런타임 SoT · `.github/` 보드 자동화 · `scripts/` 헬퍼 · `docs/` 제품 SoT/단위.

> 설계 배경: 이전 다중 에이전트 시스템(선형 핸드오프 체인 + 티켓 증식)의 재구성. **PM 중앙집권 + 더 큰 작업단위 + `/goal` 자율성.**
