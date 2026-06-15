# Skill: worker-bootstrap

PM이 스폰한 worker(frontend/backend/qa/security)가 작업 시작 시 거치는 *슬림* 시동 의식.

## frontend / backend (headless `/goal`)
1. worktree 확인: `pwd` (자기 `feat/<slug>` worktree)
2. gstack healthcheck: `test -d ~/.claude/skills/gstack/bin && echo OK`
3. **진실의 원천 로드**: `docs/units/<slug>/spec.md` (성공조건) 정독 → `plan.md`에 구현 순서 작성
4. `config/quality_standards.md` + (backend) `state/decisions.md` 핵심 확인
5. goal-loop 진입: 매 턴 spec.md reload · 검증 증거 출력 · `status.md` 갱신
6. 결정 필요 → `status.md`에 escalation 기록 후 정지

## qa / security (Agent 툴)
1. worktree = `sprint/<n>-integration` 확인
2. gstack healthcheck
3. (qa) `docs/units/<slug>/spec.md` 전체 기준 로드 / (security) 스프린트 머지분 + 직전 리포트 로드
4. 스킬 실행(`/qa`+`/codex` / `/cso`) → 구조화 verdict 반환 (`subagent-return-contract.md`)

## 공통 금지
- GitHub 이슈 생성 ❌ (발견은 반환에). Boundaries 밖 수정 ❌. 자체 머지 ❌.
