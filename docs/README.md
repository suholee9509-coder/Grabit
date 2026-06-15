# docs/ — 제품 SoT + 작업단위 산출물

런타임에 누적되는 제품/단위 문서. (정적 규칙은 `config/`, 오케스트레이션 상태는 `state/`.)

| 경로 | 내용 | 작성자 |
|---|---|---|
| `source/` | **제품 SoT** — 기획/요구사항 원본 (전달 예정). read-only 기록. | 사용자 → PM 흡수 |
| `units/<slug>/spec.md` | 단위 성공조건 (User Story + 5섹션) — `/goal` 정본, 매 턴 reload | PM 작성 |
| `units/<slug>/plan.md` | 구현 순서 | dev |
| `units/<slug>/status.md` | 변경·검증결과·리스크 (매 턴 갱신) | dev |
| `plan/` | (선택) 통합 플랜·분석 working 문서 | PM |
| `design/` | (선택) 디자인 핸드오프·레퍼런스·브랜드 자산 | frontend |

> 흐름: 기획 문서 → `source/` → PM이 `/office-hours`·prd-clarifier로 검증(Command Center §2) → sprint-kickoff에서 `units/<slug>/` 분해.
