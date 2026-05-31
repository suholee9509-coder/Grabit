# shared-context/

**동적 런타임 컨텍스트** — 에이전트들이 작업하면서 누적하는 *프로젝트의 기억*.

여기 있는 파일들은 에이전트가 read+write 가능합니다. 모든 에이전트가 공유하는 *기관 기억(institutional memory)*. git 추적되어 변경 이력 보존.

---

## 파일 인덱스

| 파일 | 누가 작성 | 누가 읽음 | 목적 |
|------|----------|----------|------|
| [architecture.md](architecture.md) | Dev (큰 결정 시), PM Agent | 모든 에이전트 (특히 Dev) | 누적 아키텍처 결정 |
| [sprint-memory.md](sprint-memory.md) | PM (스프린트 시작/종료), Reviewer/QA (특이사항) | PM (다음 스프린트 계획), Solution Planner (재기획) | 스프린트 의사결정 로그 |
| `brand-system.md` | Brand Designer (Foundation) | UI/UX Designer, Dev (마케팅), Brand Designer (Production) | 브랜드 시스템 (생성 후 추가됨) |
| `spec-{slug}.md` | Solution Planner | PM Agent (티켓 분해 시) | 검증된 스펙 (목표마다 1개) |
| `copy/<...>.md` | Brand Designer (Production) | Dev (UI 구현 시) | UX 라이팅 / 마케팅 카피 산출물 |
| [security/](security/) | Security Agent | PM (다음 스프린트), Dev (보안 티켓 처리 시) | 스프린트별 CSO 감사 리포트 |

> 이 README에 *예정된* 파일들도 표기되어 있습니다. 실제 생성은 해당 에이전트가 처음 작업할 때.

---

## 작성 규칙

### 모든 파일 공통
1. **타임스탬프 + 작성자**: 파일 끝에 "Last updated: YYYY-MM-DD by <agent-type>" 명시
2. **append-only 우선**: 기존 내용 덮어쓰기보다 추가가 안전
3. **변경 이유 코멘트**: 큰 수정 시 마크다운 코멘트(`<!-- Why: ... -->`)로 의도 명시

### architecture.md
- 큰 기술 선택(프레임워크, DB 등) 결정 시 ADR 형식으로 기록
- 형식: `## YYYY-MM-DD — <결정 제목>` + Context / Decision / Consequences

### sprint-memory.md
- 스프린트 시작: `# Sprint {N} (시작: YYYY-MM-DD)` 섹션
- 스프린트 종료: 회고 + 다음 스프린트 인사이트
- 중간 의사결정: 그 스프린트 섹션에 append

### brand-system.md / copy/
- Brand Designer 페르소나 (`.claude/agents/brand-designer.md`)에 정의된 양식 그대로

### spec-*.md
- Solution Planner 페르소나 양식 그대로

---

## 사용 패턴

```bash
# 작업 시작 전 (모든 에이전트)
/load-context              # 자기 페르소나의 reads: 파일 일괄 로드

# 큰 결정 후 (Dev)
echo "..." >> shared-context/architecture.md

# 스프린트 종료 후 (PM)
# Cursor 채팅에서 sprint-memory.md를 직접 편집
```

git에 커밋하는 게 원칙. 시간 지나도 *왜 이렇게 결정했는지* 추적 가능해야 합니다.
