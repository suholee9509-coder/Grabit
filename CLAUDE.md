# Grabit

크롬 익스텐션 기반 영상 클리핑·큐레이션으로 성장 불안(FOMO)을 해소하는 커리어 콘텐츠 플랫폼. 1인 창업자 + 8개 AI 에이전트로 개발됩니다.

---

## 빠른 네비게이션 (에이전트가 처음 읽을 곳)

**이 워크트리에서 작업 중인 에이전트라면**: 워크트리 루트의 `CLAUDE.md`를 먼저 읽으세요. 거기에 당신의 에이전트 페르소나와 현재 티켓이 있습니다.

**메인 레포에서 작업 시 핵심 디렉토리**:
- [.claude/agents/](.claude/agents/) — 8개 에이전트 페르소나 (Single Source of Truth)
- [.claude/skills/](.claude/skills/) — 프로젝트 고유 워크플로우 (sprint-kickoff, handoff 등)
- [.claude/commands/](.claude/commands/) — Cursor 슬래시 명령 (`/start-sprint`, `/handoff`, `/status`)
- [config/](config/) — 정적 표준 (read-only, PR로만 변경)
- [shared-context/](shared-context/) — 런타임 누적 컨텍스트 (read+write)
- [scripts/](scripts/) — 워크트리/핸드오프 shell 헬퍼
- [gstack/](gstack/) — gstack 통합 가이드

각 디렉토리에 `README.md`가 있으니 폴더 내용을 빠르게 파악하려면 그것부터 읽으세요.

---

## 에이전트 시스템 핵심 원칙

1. **각 에이전트 = 별도 Cursor 세션** (별도 git worktree)
2. **모든 LLM 호출 = Cursor의 Claude Code** (사용자 구독 계정, Anthropic API 미사용)
3. **티켓 = GitHub Issues**, **보드 = GitHub Projects**, **핸드오프 = Issue 라벨 변경 + 코멘트**
4. **사용자가 매 단계 수동 트리거** (자동 파이프라인 없음, 의도적)
5. **공유 메모리 = `shared-context/*.md` 파일** (모든 에이전트가 read/write 가능)

---

## GitHub 도구 (모든 에이전트 공통)

```bash
# 티켓 보기
gh issue view <number>

# 새 티켓 생성 (보통 PM Agent가 호출)
gh issue create --label "agent:dev" --label "type:feature"

# 티켓 코멘트
gh issue comment <number> -b "메시지"

# 핸드오프 (라벨 변경 + 코멘트)
./scripts/handoff.sh <issue-number> <next-agent>

# 새 에이전트 워크트리 시작
./scripts/new-agent.sh <agent-type> [<ticket-number>]

# 보드 현황
./scripts/status.sh

# Projects 보드 (브라우저)
gh project view 2 --owner @me --web
```

---

## gstack

Use the /browse skill from gstack for all web browsing. Never use mcp__claude-in-chrome__* tools.

Available skills:
/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /setup-gbrain, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn

### gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

이 프로젝트의 gstack 사용 매핑은 [gstack/skills-in-use.md](gstack/skills-in-use.md) 참고.

---

## Grabit 제품 코드는 어디에?

현재 레포에는 *에이전트 시스템*만 있습니다. Grabit 제품 코드(크롬 익스텐션, 영상 클리핑·큐레이션 백엔드, 웹 플랫폼 등)는 Solution Planner와 PM Agent를 통해 요구사항이 정의된 후 별도 결정된 구조로 추가됩니다.

이 시점에는 `apps/`, `packages/` 같은 디렉토리가 *없는 것이 정상*입니다.
