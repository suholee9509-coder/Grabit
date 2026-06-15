# Skill: sprint-close (PM)

스프린트를 종료한다 — 통합 → 보안 감사 → 머지 → 회고.

## 절차
1. **통합 확인**: 모든 단위가 기능 QA PASS + `sprint/<n>-integration`에 머지됐는지.
   ```bash
   gh issue list --milestone "Sprint N" --state open   # 남은 것 없어야
   ```
2. **Security 스폰** (Agent 툴): `sprint/<n>-integration` 전수 감사. 반환의 `PROPOSED_TICKETS`를 받음.
3. **보안 티켓 생성** (PM이): Critical/High를 다음 스프린트 이슈로 생성 (Security는 제안만).
4. **★ 게이트 ⓓ**: 사용자 최종 머지 승인 → `sprint/<n>-integration` → `main`. 자동 배포 ❌.
5. **마일스톤 닫기**: `gh api -X PATCH repos/:owner/:repo/milestones/{id} -f state=closed`.
6. **회고** `/retro` → Command Center §4 + gstack learnings:
   - 지표: **계획외 하위단위 스폰 = 0** · 단위당 에스컬레이션 ≤1 · 약한 기준으로 인한 재작업.
   - Sprint 1이면 모드 2 졸업 판정 (지표 충족 시 모드 1로).
7. 보안 티켓을 다음 스프린트 계획에 편입 (sprint-kickoff).

## 체크
- [ ] 모든 단위 통합 + QA PASS · 보안 감사 완료 → `state/security/sprint-{N}.md`
- [ ] 사용자 머지 승인 받음 · 회고 기록 · 지표 산출
