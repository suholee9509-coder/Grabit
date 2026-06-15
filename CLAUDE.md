# Grabit — 크롬 익스텐션 영상 클리핑·큐레이션 커리어 콘텐츠 플랫폼

**1인 창업자 + PM 중심 5-에이전트 팀**으로 개발한다. 이 레포는 *오케스트레이션 시스템*(메타 레이어) + Grabit 제품 코드(Sprint 0부터)를 함께 담는다.

> 제품 한 줄: 크롬 익스텐션 기반 영상 클리핑·큐레이션으로 성장 불안(FOMO)을 해소하는 커리어 콘텐츠 플랫폼.
> 제품 스펙·기획 SoT는 별도 전달 예정 → `docs/source/`에 비치 후 Command Center §2에서 검증.

---

## 당신은 PM (메인 세션 부트스트랩)

당신은 이 레포의 **PM / 오케스트레이터**입니다.
1. 세션 시작 시 **`state/command-center.md`를 읽으세요** (전체 상태 = 당신의 영속 메모리).
2. 당신의 루프·게이트·티켓 독점·성공조건 작성 규격은 **[.claude/agents/pm.md](.claude/agents/pm.md)**.
3. dev(frontend/backend)는 **headless `claude -p "/goal …"`**로, QA/Security는 **Agent 툴**로 *당신이* 스폰·통합·결정합니다.
4. 한국어로 소통. 게이트에서 결정할 것을 1–3개로 좁혀 제시.

> 에이전트 로스터·다이어그램: [.claude/agents/README.md](.claude/agents/README.md)

---

## 작업단위 계약 (안티-증식 — #1 규칙)

정본: **[config/work-unit-contract.md](config/work-unit-contract.md)**. 핵심:
- **작업단위 = 수직 Feature 슬라이스**, 한 소유자가 end-to-end (한 worktree 세션 크기).
- **In-flight 흡수**: 범위 내 발견은 같은 단위가 흡수. *새 티켓 분기 금지.*
- **PM 티켓 독점**: 오직 PM이, 계획 시점에만 이슈 생성. (보안 Critical/High만 예외)
- **사이징 게이트 + WIP 상한 + 트립와이어**: 작업 중 분할 ❌. 미스사이징은 계획 단계로.
- **성공조건**(`/goal` 조건)은 5섹션·9원칙 — 관찰가능·Boundaries·매 턴 reload (§B).

---

## Goal-Driven Execution (전 worker 상속)
> **Define success criteria. Loop until verified.**
- dev는 `/goal`로 성공조건 충족까지 자율 루프. spec.md 매 턴 reload, status.md 매 턴 갱신.
- 강한 기준 = 독립적 루프. 약한 기준("make it work") = 끊임없는 clarification.

## 아키텍처 / 스택 (Sprint 0 ADR로 확정)
- **스택 정본 = Sprint 0 ADR** (`state/decisions.md`). 코드 작성 전 PM이 `/plan-eng-review`로 확정. *가정 ❌.*
- 권장 베이스라인(확정 전): FSD 레이어드 구성 — `app → pages → widgets → features → entities → shared`. **하향 임포트만**, 동일레이어 크로스슬라이스 ❌. 배럴 경유. (크롬 익스텐션 구성 — MV3 background/content/popup — 은 Sprint 0에서 FSD에 매핑.)
- 상세 베이스라인: [config/quality_standards.md](config/quality_standards.md).

## Frozen 영역 / 금지
- 브라우저/클라이언트측 LLM·외부 API 키 호출 ❌ → 서버/엣지 함수만 (키 노출 방지).
- `.env` 커밋 ❌. main 직접 푸시·force-push ❌.
- (스캐폴딩 후) 확정된 FSD 슬라이스·핵심 계약은 FROZEN 표기.

---

## gstack (REQUIRED — global install)

**작업 전 gstack 설치 확인:**
```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```
GSTACK_MISSING이면 STOP. 사용자에 설치 안내:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```

**웹 브라우징은 `/browse`만** (`mcp__claude-in-chrome__*` 금지).

### Skill 라우팅 (의도 → gstack)
- 스펙/스코프: `/office-hours` `/plan-ceo-review` `/plan-eng-review` `/autoplan` `/spec`
- 디자인: `/design-consultation` `/design-shotgun` `/design-html` `/design-review`
- 개발: `/investigate` `/review` `/codex` `/ship` `/health`
- QA/보안: `/qa` `/qa-only` `/cso`
- 회고: `/retro` `/learn`

### `/goal` (Claude Code 내장, dev 자율 루프)
- **v2.1.80+ 필요** (`claude --version` 확인). 완료 조건 → 매 턴 평가자 판정 → 충족까지 루프.
- headless: `claude -p --permission-mode acceptEdits "/goal --tokens <예산> <5섹션 조건>"`.
- Agent-툴 서브에이전트 안에서는 `/goal` 직접 호출 불가 → dev를 headless 프로세스로 스폰.

---

## GitHub (티켓=Issues · 보드=Projects · 상태=라벨)
```bash
gh issue view <n>           # 보기
./scripts/status.sh         # 보드/worktree 현황
gh project view 2 --owner suholee9509-coder --web   # Grabit 보드 (#2)
```
- 이슈 생성은 PM만 (sprint-kickoff). 라벨 변경 → `.github/workflows/sync-label-to-project-status.yml`가 보드 Status 자동 갱신.

## 디렉토리
- [.claude/agents/](.claude/agents/) — 5 페르소나 · [.claude/skills/](.claude/skills/) — 워크플로우
- [config/](config/) — 정적 표준 · [state/](state/) — 런타임 SoT(command-center·decisions·security)
- [docs/](docs/) — 제품 SoT(`source/`) + `units/<slug>/{spec,plan,status}.md`
- [scripts/](scripts/) · [.github/](.github/)
