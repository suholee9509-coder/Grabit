# gstack 스킬 사용 매핑

이 프로젝트의 각 에이전트가 사용하는 gstack 스킬 매트릭스.

---

## 에이전트별 사용 스킬

### Solution Planner
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/office-hours` | Step 1 — 데맨드 검증 | 6 forcing questions (상태/JTBD/desperate/MVP) |
| `/plan-ceo-review` | Step 2 — 전략 검토 | 전제 도전, 10-star 버전 발굴, 스코프 조정 |

### PM Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| (없음) | — | gstack 스킬 미사용 (gh CLI 위주) |

### Dev Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/investigate` | Step 1 — 명세 모호 시 | 근본 원인 분석 / 요구사항 명확화 |
| `/review` | Step 4 — 자체 리뷰 | PR 만들기 전 self-audit |
| `/codex` | Step 4.5 — **조건부 self-validation** | 큰(≥250 LOC) / 보안 / 다중 통합 / 신규 의존성 / 재작업 티켓 한정. OpenAI 독립 시각 |
| `/ship` | Step 5 — PR 생성 | 테스트 + 리뷰 + 커밋 + push + PR |

### Reviewer Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/review` | Step 2 — 코어 리뷰 | SQL safety, LLM trust, 조건부 렌더링 버그 등 |

### QA Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/qa` | Step 2 — 테스트 + 자동수정 | 브라우저 기반 시나리오 테스트 |
| `/codex` | Step 3 — 교차 검증 | OpenAI Codex로 독립적인 2nd opinion 리뷰. `/qa`가 놓친 이슈 잡기 |
| `/design-review` | Step 4 — UI 티켓일 경우 | 시각 일관성, hierarchy, AI slop 검출 |

### UI/UX Designer Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/design-shotgun` | Step 2 — 변형 생성 | 다수 디자인 옵션 병렬 생성 |
| `/design-html` | Step 4 — 변형 선택 후 | 선택 변형 → 프로덕션 HTML/CSS |
| `/design-review` | Step 5 — 자체 감사 | 만든 디자인 사전 검토 |

### Brand Designer Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/design-consultation` | Foundation Mode | 브랜드 시스템 도출 (브랜드 부분만 활용) |

### Security Agent
| 스킬 | 사용 단계 | 목적 |
|------|----------|------|
| `/cso` | Step 2 — 풀 감사 | OWASP, STRIDE, 의존성, 시크릿, CI/CD 보안 |

---

## 모든 에이전트 공통

| 스킬 | 목적 |
|------|------|
| `/browse` | 모든 웹 브라우징 (mcp__claude-in-chrome__* 사용 금지) |

---

## 미사용 / 미선택 gstack 스킬

참고용 (이 프로젝트에서 *현재* 사용 X — 통증 발생 시 도입):

- `/plan-eng-review` — 엔지니어링 계획 리뷰 (현재 PM Agent가 흡수)
- `/plan-design-review` — 디자인 계획 리뷰 (UI/UX Designer가 self-review)
- `/plan-devex-review`, `/devex-review` — DX 감사 (1인 단계라 보류)
- `/autoplan` — 자동 리뷰 파이프라인 (수동 핸드오프 정책과 충돌)
- `/land-and-deploy` — 머지 + 배포 (제품 배포 단계 도달 시 도입)
- `/canary` — 배포 후 모니터링 (위와 동일)
- `/benchmark`, `/benchmark-models` — 성능 측정 (필요 시 도입)
- `/retro` — 주간 회고 (스프린트 안정화 후 도입)
- `/learn` — 학습 관리 (장기 운영 시 가치)
- `/document-release` — 릴리즈 문서화 (배포 단계)
- `/setup-deploy`, `/setup-gbrain`, `/setup-browser-cookies` — 1회성 셋업
- `/freeze`, `/unfreeze`, `/guard`, `/careful` — 안전 모드 (필요 시)
- `/make-pdf` — 마크다운 → PDF
- `/scrape`, `/skillify` — 데이터 스크래핑 + 스킬화
- `/pair-agent`, `/connect-chrome`, `/open-gstack-browser` — 멀티에이전트/브라우저 (현 워크플로우와 다름)
- `/sync-gbrain` — gbrain 동기화 (gbrain 미사용)
- `/health` — 코드 품질 대시보드 (필요 시)
- `/checkpoint` — 작업 상태 체크포인트
- `/landing-report` — 워크스페이스 리포트
