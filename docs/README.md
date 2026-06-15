# docs/ — 제품 SoT + 작업단위 산출물

런타임에 누적되는 제품/단위 문서. (정적 규칙은 `config/`, 오케스트레이션 상태는 `state/`.)

| 경로 | 내용 | 작성자 |
|---|---|---|
| `design/` | **디자인 SoT('무엇')** — Figma 링크·프레임 인벤토리·충실도 기준 | PM·frontend |
| `source/` | **기획 SoT('왜·스코프·데이터규칙')** — 기획/요구사항 원본 (전달 예정) | 사용자 → PM 흡수 |
| `units/<slug>/spec.md` | 단위 성공조건 (User Story + 대상 Figma 프레임 + 5섹션) — `/goal` 정본, 매 턴 reload | PM 작성 |
| `units/<slug>/plan.md` | 구현 순서 | dev |
| `units/<slug>/status.md` | 변경·검증결과·충실도 gap·리스크 (매 턴 갱신) | dev |
| `plan/` | (선택) 통합 플랜·분석 working 문서 | PM |

> 흐름(UI 역설계): **Figma(`design/`) + 기획문서(`source/`)** → PM이 스펙 역설계(Command Center §2) → sprint-kickoff에서 `units/<slug>/` 분해(화면/플로우 단위) → frontend Figma MCP 퍼블리싱. 충돌 시 *무엇=Figma, 왜·스코프=문서*.
