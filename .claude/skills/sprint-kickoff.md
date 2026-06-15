# Skill: sprint-kickoff (PM)

스프린트를 시작한다 — 검증된 스펙을 **Feature 작업단위**로 분해하고 보드에 등록. (티켓 증식 방지가 핵심)

## 선행
- 스펙이 검증됨 (Command Center §2). gh 인증. `claude --version` ≥ 2.1.80.

## 절차
1. **분해**: 스펙을 수직 Feature 슬라이스로. 각 단위 = "한 소유자·한 worktree 세션". BE+FE+상태+배선+테스트 사전 열거.
2. **성공조건 작성**: 각 단위에 `config/work-unit-contract.md` §B의 5섹션 작성 → `docs/units/<slug>/spec.md`. 빈 `plan.md`·`status.md` 생성.
   - 약한 기준은 `/plan-eng-review`/`/spec`으로 강화 후 확정.
3. **사이징 게이트**: 각 단위가 한 세션에 끝나는가? 아니면 *지금* 재분해. (작업 중 분할 ❌)
4. **WIP 상한** 설정 → Command Center §7.
5. **이슈 생성** (단위당 1, feature-unit 템플릿):
   ```bash
   gh issue create --title "<slug>: <한 줄>" --body-file <feature-unit body> \
     --label "agent:frontend" --label "type:feature" --label "priority:P0" \
     --milestone "Sprint N"
   ```
   세부는 *이슈 내 체크리스트*로 (별도 이슈 ❌).
6. **마일스톤** 생성/연결 (`gh api repos/:owner/:repo/milestones`).
7. **Command Center §3 단위표** 갱신.
8. **★ 게이트 ⓑ**: 사용자에게 분해 승인 요청 (결정할 것 1–3개로).

## 체크
- [ ] 모든 단위 사이징 게이트 통과 · 성공조건 5섹션 + 관찰가능 + Boundaries
- [ ] 이슈 라벨 3종 정확 · 보드 등록 · Command Center 갱신
- [ ] 작업 중 새 티켓 0 (계획 시점만)
