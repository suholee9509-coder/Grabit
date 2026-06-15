# Skill: worker-bootstrap

PM이 스폰한 worker(frontend/backend/qa/security)가 작업 시작 시 거치는 *슬림* 시동 의식.

## frontend (인터랙티브 워크트리, 사용자 직접 운전) / backend (headless `/goal` 백그라운드, opus-4-8·effort max)
1. worktree 확인: `pwd` (자기 `feat/<slug>` worktree)
2. gstack healthcheck: `test -d ~/.claude/skills/gstack/bin && echo OK`. **(frontend) Figma MCP 연결 확인** — 미연결 시 사용자에게 연결 요청.
3. **진실의 원천 로드**: `docs/units/<slug>/spec.md` (성공조건) 정독 → **(frontend) 대상 Figma 프레임을 MCP로 연동**(`docs/design/README.md`) → `plan.md`에 구현 순서 작성
4. `config/quality_standards.md` + (backend) `state/decisions.md` + (frontend) Command Center §5 토큰 핵심 확인
5. 루프 진입: spec.md reload(+frontend는 프레임 재확인) · 검증 증거 출력(+frontend는 충실도) · `status.md` 갱신
6. 결정 필요 → **(frontend) 사용자에게 직접 질문**(인터랙티브) · **(backend) `status.md`에 escalation 기록 후 정지**(headless)

## qa / security (Agent 툴)
1. worktree = `sprint/<n>-integration` 확인
2. gstack healthcheck
3. (qa) `docs/units/<slug>/spec.md` 전체 기준 로드 / (security) 스프린트 머지분 + 직전 리포트 로드
4. 스킬 실행(`/qa`+`/codex` / `/cso`) → 구조화 verdict 반환 (`subagent-return-contract.md`)

## 공통 금지
- GitHub 이슈 생성 ❌ (발견은 반환에). Boundaries 밖 수정 ❌. 자체 머지 ❌.
