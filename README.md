# Grabit

크롬 익스텐션 기반 영상 클리핑·큐레이션으로 성장 불안(FOMO)을 해소하는 커리어 콘텐츠 플랫폼.

이 레포는 두 가지를 포함합니다:
1. **에이전트 시스템** (현재 셋업 단계) — 8개 AI 에이전트가 협업해 Grabit를 개발하는 워크플로우
2. **Grabit 제품** (별도 진행) — 실제 SaaS 코드 (요구사항 정의 후 추가될 예정)

---

## 빠른 시작

### 1. 사전 요구사항
- macOS (현재 검증 환경)
- [git](https://git-scm.com/)
- [GitHub CLI (`gh`)](https://cli.github.com/) — `brew install gh && gh auth login`
- [Cursor](https://cursor.sh/) — Claude Opus 4.7 액세스 가능한 유료 구독
- gstack (자동 설치됨, `.claude/hooks/check-gstack.sh`가 검증)

### 2. 환경 셋업
```bash
git clone <this-repo>
cd Grabit
cp .env.example .env
# .env 파일 열어 GITHUB_TOKEN 입력
```

### 3. 첫 에이전트 시작
```bash
./scripts/new-agent.sh solution-planner
# → worktrees/solution-planner-xxx/ 생성 + Cursor 자동 오픈
# → Cursor 채팅에서 새 목표를 입력해 작업 시작
```

---

## 에이전트 시스템 개요

8개 에이전트가 각자 별도 Cursor 세션 + git worktree에서 작업합니다.

```
Solution Planner → PM Agent → [Dev / UI-UX Designer / Brand Designer]
                                  ↓
                              Reviewer → QA → Done
                                  ↓
                       (스프린트 종료) Security
```

자세한 내용:
- [.claude/agents/README.md](.claude/agents/README.md) — 8개 에이전트 정의
- [.claude/skills/README.md](.claude/skills/README.md) — 프로젝트 워크플로우
- [config/README.md](config/README.md) — 정적 표준 (품질 기준, 핸드오프 규칙)
- [shared-context/README.md](shared-context/README.md) — 동적 런타임 컨텍스트
- [docs/end-to-end-test.md](docs/end-to-end-test.md) — 시스템 검증 가이드 (적대적 테스트 + 풀 흐름 시연)
- [.github/SETUP.md](.github/SETUP.md) — GitHub 라벨/Projects 셋업

---

## 디렉토리 구조

```
Grabit/
├── .claude/                     # 에이전트 시스템 코어
│   ├── agents/                  # 8개 에이전트 페르소나
│   ├── skills/                  # 프로젝트 워크플로우
│   └── commands/                # Cursor 슬래시 명령
├── gstack/                      # gstack 통합 가이드
├── config/                      # 정적 표준 (사람 작성)
├── shared-context/              # 동적 런타임 컨텍스트 (에이전트 작성)
├── scripts/                     # shell 헬퍼 (worktree, handoff, status)
└── worktrees/                   # 런타임 worktrees (.gitignore)
```

향후 Grabit 제품 코드는 별도 결정된 구조로 추가됩니다.

---

## 자주 쓰는 명령

```bash
# 새 에이전트 워크트리 시작
./scripts/new-agent.sh <agent-type> [<ticket-number>]

# 핸드오프 (다음 에이전트로)
./scripts/handoff.sh <issue-number> <next-agent>

# 현재 보드 상태 확인
./scripts/status.sh

# GitHub Projects 보드 (브라우저)
gh project view 1 --owner @me --web
```

---

## gstack

이 프로젝트는 [gstack](https://github.com/garrytan/gstack) 스킬을 활용합니다 (`/qa`, `/review`, `/ship` 등).
설치 가이드: [gstack/README.md](gstack/README.md)
