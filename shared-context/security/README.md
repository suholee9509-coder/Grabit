# shared-context/security/

Security Agent가 스프린트 종료 시 작성하는 CSO 감사 리포트들.

각 스프린트가 끝나면 `sprint-{N}.md` 파일이 생성됩니다. Security Agent 페르소나 (`.claude/agents/security.md`)에 정의된 양식을 따릅니다.

---

## 파일 명명 규칙

- `sprint-1.md`, `sprint-2.md`, ... — 스프린트 번호 순
- 중간 보안 감사가 필요하면 `ad-hoc-{YYYY-MM-DD}.md`

---

## 표준 양식 (요약)

```markdown
# Sprint {N} Security Audit
> Date: YYYY-MM-DD
> Auditor: Security Agent
> Scope: Sprint {N}에서 머지된 모든 PR

## Critical findings
<P0 — 즉시 처리 필요>

## High findings
<P1 — 다음 스프린트 안에 처리>

## Medium findings
<P2 — 백로그>

## Recommendations
<비차단, 개선 제안>

## Auto-created tickets
- #N — <title> (priority:P0, type:security)
- ...
```

자세한 양식과 워크플로우는 [.claude/agents/security.md](../../.claude/agents/security.md) 참조.
