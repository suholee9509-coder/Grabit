---
name: sprint-close
trigger: PM Agent가 스프린트 종료 선언 시
who: PM Agent (+ Security Agent 호출 트리거)
---

# Sprint Close

스프린트의 모든 티켓이 머지된 후 마무리하는 표준 절차.

## 사전 조건

- [ ] Sprint milestone의 모든 이슈가 closed
- [ ] 관련 PR 모두 merged
- [ ] CI 통과 (있으면)

## 절차

### 1. 머지 상태 확인

```bash
SPRINT_NUM=N
SPRINT_TITLE="Sprint ${SPRINT_NUM}"

# Open 이슈 0개 확인
OPEN=$(gh issue list --milestone "${SPRINT_TITLE}" --state open --json number | jq length)
if [ "$OPEN" -ne 0 ]; then
  echo "✗ ${OPEN}개 open issue 남음. close 후 진행."
  gh issue list --milestone "${SPRINT_TITLE}" --state open
  exit 1
fi

# Open PR 0개 확인
OPEN_PR=$(gh pr list --milestone "${SPRINT_TITLE}" --state open --json number | jq length)
if [ "$OPEN_PR" -ne 0 ]; then
  echo "✗ ${OPEN_PR}개 open PR 남음."
  exit 1
fi

echo "✓ Sprint ${SPRINT_NUM} 모든 작업 종료됨."
```

### 2. Security Agent 호출 권유

PM Agent가 *직접* Security 호출 X. 사용자에게 안내:
> "Sprint ${SPRINT_NUM}의 모든 티켓이 머지되었습니다. 이제 Security Agent를 호출해 보안 감사를 실행하세요:
>
> ```bash
> ./scripts/new-agent.sh security ${SPRINT_NUM}
> ```
>
> Security Agent가 `shared-context/security/sprint-${SPRINT_NUM}.md`를 작성하고 Critical/High 신규 티켓을 만듭니다. 그게 끝나면 다시 저(PM)에게 돌아오세요."

사용자가 Security 워크트리 진행 → 완료 후 다시 PM 워크트리로.

### 3. Security 결과 통합

Security 리포트 받은 후:

```bash
cat shared-context/security/sprint-${SPRINT_NUM}.md
```

Critical/High 티켓 (Security가 자동 생성한 것) 확인:
```bash
gh issue list --label "type:security" --state open --milestone ""  # milestone 미배정
```

이 티켓들을 다음 스프린트 (`sprint-kickoff` 시) 우선 통합.

### 4. 회고 작성 (`shared-context/sprint-memory.md`에 append)

```markdown
## Sprint ${N} — 회고 (YYYY-MM-DD)

### 잘된 것
- <bullet>
- <bullet>

### 부족했던 것
- <bullet>
- <bullet>

### 다음 스프린트로 옮길 것
- 보안 티켓: #X (P0), #Y (P1)
- 테크 부채: <있다면>
- 미완료 (Out of Scope로 이동): <있다면>

### 메트릭
- 티켓 수: N개 (계획: M개)
- 평균 PR 머지 시간: <측정>
- Reviewer 회귀 횟수: <횟수>
- QA 회귀 횟수: <횟수>
- 총 LOC 변경: <git diff summary>
```

```bash
git add shared-context/sprint-memory.md
git commit -m "sprint: ${SPRINT_TITLE} retrospective"
```

### 5. Milestone 닫기

```bash
# Milestone 번호 가져오기
MS_NUM=$(gh api repos/:owner/:repo/milestones --jq ".[] | select(.title==\"${SPRINT_TITLE}\") | .number")

# 닫기
gh api -X PATCH repos/:owner/:repo/milestones/${MS_NUM} -f state=closed
```

### 6. 사용자에 보고

```
✓ Sprint ${SPRINT_NUM} 종료.
  - 티켓 머지: N개
  - 보안 감사: <Critical X / High Y> (다음 스프린트 통합 예정)
  - 회고 추가됨

다음:
  - 다음 목표가 있으면 → Solution Planner 호출 (./scripts/new-agent.sh solution-planner)
  - 같은 spec 계속 작업이면 → /start-sprint 으로 Sprint $((${SPRINT_NUM}+1)) 시작
```

---

## 체크리스트

- [ ] 스프린트 milestone open 이슈/PR 0개 확인
- [ ] Security Agent 호출 안내됨
- [ ] (Security 끝나면) 신규 보안 티켓 통합 검토
- [ ] sprint-memory.md 회고 추가
- [ ] Milestone closed
- [ ] 사용자에 보고

## Failure Modes

- **Open 이슈 / PR 남음**: 정지. 사용자에 명단 + 어떻게 처리할지 결정 요청.
- **Security 결과 Critical 다수 (5+)**: 사용자에 핫픽스 모드 권장. 일반 다음 스프린트 X.
- **Milestone close 실패**: gh API 권한 확인. 토큰 scope 부족할 수 있음.
- **회고 작성 어려움 (정보 부족)**: 머지된 PR + sprint-memory.md 결정 로그 + git log 종합. 부분 회고라도 작성.
