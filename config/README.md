# config/ — 정적 표준 (read-only, PR로만 변경)

런타임에 바뀌지 않는 *규칙*. 런타임 상태는 `state/`에 있다.

| 파일 | 내용 | 주 사용자 |
|---|---|---|
| [work-unit-contract.md](work-unit-contract.md) | **정본** — 6원칙 + 성공조건 9원칙·5섹션 템플릿 (#1 안티-증식) | 전 페르소나 |
| [definitions_of_done.md](definitions_of_done.md) | 단계별 DoD (Spec/단위/dev/QA/Security/Sprint) | PM·dev·QA·Security |
| [workflows.md](workflows.md) | 작업단위 라이프사이클 + 머지 래더 + WIP 상한 | PM |
| [orchestration-rules.md](orchestration-rules.md) | PM 단독 디스패처·반환 계약·에스컬레이션·게이트 | 전 페르소나 |
| [quality_standards.md](quality_standards.md) | 코드 품질 베이스라인 (단순성·타입·보안·테스트·FSD) | dev |
| [brand_seed.md](brand_seed.md) | Grabit 브랜드 방향성 시드 | frontend |

> 변경은 PR로만. 런타임 결정/상태는 여기 쓰지 말 것 → `state/command-center.md` / `state/decisions.md`.
