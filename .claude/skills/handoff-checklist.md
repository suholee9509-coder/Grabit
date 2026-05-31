---
name: handoff-checklist
trigger: 모든 핸드오프 시
who: 전 에이전트
---

# Handoff Checklist

다음 에이전트로 작업을 넘기기 전에 *반드시* 통과해야 하는 체크리스트.

## 일반 절차

### 1. Self-Review 통과 확인
자기 페르소나의 "Self-Review Checklist" 섹션 모두 ✓.

### 2. 산출물 검증
- 자기 페르소나 frontmatter `writes:` 항목이 *모두 작성/업데이트*되었는가?
- 산출물이 다음 에이전트가 *사용 가능한 양식*인가?
- 빠진 단계 / 임시 placeholder가 없는가?

### 3. shared-context 업데이트
필요 시:
- `shared-context/architecture.md` (큰 결정 시)
- `shared-context/sprint-memory.md` (특이사항 시)

git에 커밋.

### 4. 핸드오프 실행
```bash
./scripts/handoff.sh <issue-number> <next-agent>
```

이게 자동으로:
- GitHub Issue 라벨에서 현재 `agent:*` 제거
- 다음 `agent:*` 추가
- 핸드오프 코멘트 게시
- (라벨 변경에 의해 GitHub Projects 컬럼 자동 이동)

### 5. 사용자에 보고
명확한 메시지:
> "✓ Issue #N: <작업 요약>. 다음: <next-agent>. `./scripts/new-agent.sh <next-agent> <issue>` 으로 새 워크트리 시작 가능."

---

## 에이전트별 추가 검증

### Solution Planner → PM Agent
- [ ] `shared-context/spec-{slug}.md` 5섹션 모두 완성
- [ ] 사용자 컨펌 받음
- [ ] git 커밋됨

### PM Agent → Dev / UI/UX Designer / Brand Designer
- [ ] 모든 티켓에 agent + type + priority 라벨
- [ ] Milestone 어사인
- [ ] Depends-on 명시 (있으면)
- [ ] sprint-memory.md 업데이트됨

### UI/UX Designer → Brand Designer (카피)
- [ ] `design-output/<feature>/` 전체 구조 완성
- [ ] `[copy:N]` 플레이스홀더가 `copy-placeholders.md`에 모두 명시
- [ ] 각 placeholder에 컨텍스트 + 길이 + tone hint

### UI/UX Designer → Dev (직접)
- [ ] `design-output/<feature>/README.md` 작성됨 (wiring 가이드 포함)
- [ ] `[copy:N]`이 placeholder인 것 명시 (Brand Designer가 후속)

### Brand Designer (Foundation) → (대기, 핸드오프 없음)
- [ ] `shared-context/brand-system.md` 5섹션 완성
- [ ] CSS 변수 섹션 (Dev이 직접 사용 가능)
- [ ] 접근성 검증된 색 페어
- [ ] 사용자 컨펌

### Brand Designer (Production) → Dev
- [ ] 카피 picked variant 명확
- [ ] `shared-context/copy/<...>.md` 작성됨
- [ ] brand-system.md 준수 명시

### Dev → Reviewer
- [ ] PR 생성됨 (`/ship` 통해)
- [ ] PR 본문에 AC 매핑
- [ ] Out of Scope 침범 없음
- [ ] Self-review (`/review`) 통과

### Reviewer → QA (APPROVE) / Dev (REQUEST_CHANGES)
- [ ] PR review comment 게시됨
- [ ] Verdict 명확
- [ ] (FAIL 시) Dev가 무엇을 어떻게 고칠지 구체적

### QA → Merge 권장 / Dev (재작업)
- [ ] `/qa` + `/codex` 둘 다 실행됨 (UI면 `/design-review` 추가)
- [ ] 모든 AC가 *실행*으로 검증됨
- [ ] Verdict 명확 (PASS / FAIL)
- [ ] (FAIL 시) 구체 수정 가이드

### Security → PM Agent
- [ ] `shared-context/security/sprint-{N}.md` 작성됨
- [ ] Critical/High 신규 티켓 모두 생성
- [ ] PM에 통합 요청 이슈 생성

---

## Failure Modes

- **Self-Review 항목 미통과**: 핸드오프 X. 미통과 항목 처리 후 재시도.
- **`./scripts/handoff.sh` 실패** (라벨 미존재 등): Phase 5에서 라벨 셋업 확인. 라벨 없으면 핸드오프 정지 + 사용자 알림.
- **다음 에이전트가 명확하지 않음**: 페르소나의 `handoff-targets`을 다시 확인. 모호하면 사용자에 결정 요청.
