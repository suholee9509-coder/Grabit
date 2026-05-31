# config/

**정적 프로젝트 표준** — 사람이 작성, 에이전트는 read-only.

여기 있는 파일들은 *팀의 합의된 기준*입니다. 변경은 PR로만 가능. 에이전트가 자기 판단으로 수정하지 않습니다.

---

## 파일 인덱스

| 파일 | 내용 | 주요 참조 에이전트 |
|------|------|-------------------|
| [quality_standards.md](quality_standards.md) | 코드 품질 기준 (네이밍, 테스트, 에러 처리, 보안 등) | Reviewer, Dev |
| [workflows.md](workflows.md) | 스프린트 흐름, 티켓 라이프사이클, 상태 정의 | PM Agent, Solution Planner |
| [handoff_rules.md](handoff_rules.md) | 핸드오프 규칙 (누가 누구로, 산출물 요건) | 전 에이전트 |
| [definitions_of_done.md](definitions_of_done.md) | 완료 기준 (acceptance criteria 양식) | Dev, QA, PM Agent |
| [brand_seed.md](brand_seed.md) | Brand Designer Foundation 전 임시 브랜드 가이드 | Brand Designer (Foundation 시) |

---

## 사용 원칙

1. **에이전트는 read-only**: 페르소나의 frontmatter `reads:`에 명시된 파일만 자동 로드.
2. **참조는 명시적**: 에이전트가 "이 표준을 따랐다"고 출력에 명기 (예: PR 설명에 "config/quality_standards.md §3.2 따름")
3. **변경은 PR**: 표준이 부족하다고 느끼면 별도 티켓 → 사람이 PR로 수정.

---

## shared-context/와의 차이

| | config/ | shared-context/ |
|--|---------|-----------------|
| 누가 작성 | 사람 (PR로) | 에이전트 (런타임) |
| 변경 빈도 | 드물게 | 자주 |
| 에이전트 권한 | read-only | read + write |
| 예시 | quality_standards.md | brand-system.md, sprint-memory.md |

이 분리는 *에이전트가 표준을 함부로 못 바꾸게* 막는 안전장치입니다.
