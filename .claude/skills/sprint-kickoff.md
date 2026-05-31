---
name: sprint-kickoff
trigger: PM Agent가 새 스프린트 시작할 때
who: PM Agent
---

# Sprint Kickoff

새 스프린트를 시작하는 표준 절차.

## 사전 조건

- [ ] Solution Planner가 `shared-context/spec-{slug}.md` 생성 완료 + 사용자 컨펌
- [ ] (Sprint 2+) 이전 스프린트 종료 완료 (`shared-context/sprint-memory.md` 회고 작성됨)
- [ ] (Sprint 2+) Security Agent 리포트 검토 (이전 스프린트 보안 티켓 있는지)

## 절차

### 1. 스프린트 번호 결정
```bash
# 기존 milestones 확인
gh api repos/:owner/:repo/milestones --jq '.[].title'
# Sprint 1, Sprint 2, ... → 다음 번호 결정
SPRINT_NUM=N
```

### 2. Milestone 생성
```bash
DUE_DATE=$(date -v+14d +"%Y-%m-%dT00:00:00Z")  # 2주 후 종료
SPRINT_TITLE="Sprint ${SPRINT_NUM}"
SPRINT_DESC="<spec slug>: <한 줄 핵심>"

gh api repos/:owner/:repo/milestones \
  -f title="${SPRINT_TITLE}" \
  -f description="${SPRINT_DESC}" \
  -f due_on="${DUE_DATE}"
```

### 3. (Sprint 2+) 이전 스프린트 인사이트 적용
```bash
# 이전 회고 확인
cat shared-context/sprint-memory.md | tail -100  # 가장 최근 회고

# 보안 티켓 확인 (다음 스프린트로 옮길 것)
cat shared-context/security/sprint-$((SPRINT_NUM-1)).md 2>/dev/null
gh issue list --label "type:security" --state open --milestone ""  # milestone 미배정 보안 티켓
```

이전 스프린트의 P0/P1 보안 티켓을 *최우선*으로 이번 스프린트에 어사인.

### 4. Spec → 티켓 분해 (PM Agent 메인 작업)

`/load-context` → spec 로드. 페르소나의 "Step 2 — 티켓 분해" 따름.

각 티켓 생성 시:
```bash
gh issue create \
  --title "<title>" \
  --body "<body — pm-agent 페르소나 양식>" \
  --label "agent:<type>" \
  --label "type:<feature/bug/ui/security>" \
  --label "priority:<P0/P1/P2/P3>" \
  --milestone "${SPRINT_TITLE}"
```

### 5. 의존성 그래프 정리
- 의존성 있는 티켓은 본문에 `Depends on: #N` 명시
- `shared-context/sprint-memory.md`에 다이어그램 추가 (페르소나 양식)

### 6. sprint-memory.md 업데이트
```markdown
## Sprint {N} — 시작: YYYY-MM-DD

### 목표
<한 줄>

### 티켓
- #1 <title> — agent:dev, P0
- ...

### 의존성 그래프
<ASCII 다이어그램>

### 결정 (스프린트 동안 추가)
(비어 있음 — 스프린트 진행 중 추가됨)
```

```bash
git add shared-context/sprint-memory.md
git commit -m "sprint: ${SPRINT_TITLE} kickoff"
```

### 7. 사용자에 보고
> "Sprint ${SPRINT_NUM} 킥오프 완료. 티켓 N개 생성. 시작 가능 (Depends 없음): #X, #Y. 어느 것부터?"

## 체크리스트

- [ ] Milestone 생성됨
- [ ] (Sprint 2+) 이전 보안 티켓 통합됨
- [ ] 모든 티켓이 milestone에 어사인
- [ ] 모든 티켓에 agent + type + priority 라벨
- [ ] 의존성 그래프가 sprint-memory.md에 있음
- [ ] 시작 가능 티켓 (Depends 없는 것) 사용자에게 명확히 제시됨

## 자주 발생하는 함정

- **티켓 너무 큼**: ≤300 LOC 가이드라인 따름. 큰 건 쪼갬.
- **Milestone 까먹음**: 모든 `gh issue create`에 `--milestone` 명시.
- **의존성 사이클**: 자체 검증 (페르소나 §Step 4) 후 커밋.
