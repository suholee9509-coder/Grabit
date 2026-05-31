# Sprint Memory

스프린트별 의사결정 로그 + 회고. PM Agent가 주로 작성하지만 Reviewer/QA가 특이사항을 추가할 수 있습니다.

> append-only. 기존 내용 덮어쓰지 마세요.

---

## (스프린트 시작 전)

아직 첫 스프린트가 시작되지 않았습니다. Solution Planner의 첫 spec 컨펌 + PM Agent의 sprint-kickoff 후 첫 섹션이 추가됩니다.

---

## 양식 참고

각 스프린트는 다음 구조로:

```markdown
## Sprint {N} — 시작: YYYY-MM-DD

### 목표
<spec slug + 한 줄 핵심>

### 티켓
- #1 <title> — agent:dev, P0, depends-on: 없음
- #2 <title> — agent:ui-ux-designer, P1, depends-on: 없음
- ...

### 의존성 그래프
\`\`\`
#1 (DB) → #2 (API) → #3 (UI) → #5 (통합)
                 ↘ #4 (에러 처리)
\`\`\`

### 결정 (스프린트 동안 추가)
- YYYY-MM-DD: <누가/무엇/왜>

### 회고 (스프린트 종료 시)

#### 잘된 것
- <bullet>

#### 부족했던 것
- <bullet>

#### 다음 스프린트로 옮길 것
- 보안 티켓: #X (P0), #Y (P1)
- 테크 부채: <있다면>
- 미완료: <있다면>

#### 메트릭
- 티켓 수: N개 (계획: M개)
- 평균 PR 머지 시간: <측정>
- Reviewer 회귀 횟수: <횟수>
- QA 회귀 횟수: <횟수>
```

---

Last updated: 2026-05-05 by setup
