# GitHub Projects + Labels Setup

Grabit 에이전트 시스템 셋업 시 1회 실행. 라벨은 자동, 보드는 수동.

---

## 1. 라벨 일괄 생성 (자동)

```bash
./scripts/setup-labels.sh
```

생성되는 라벨 (총 21개):
- agent:* (8개)
- type:* (6개)
- priority:* (4개)
- 기타 (ready-to-merge, blocked, stale)

## 2. GitHub Project 보드 생성 (수동)

```bash
# 새 Project 생성
gh project create --title "Grabit" --owner @me

# Project 번호 확인
gh project list --owner @me
```

GitHub UI(브라우저)에서 보드 열기:
```bash
gh project view <number> --owner @me --web
```

## 3. 컬럼 추가 (보드 UI에서)

다음 7개 컬럼을 순서대로 추가:

```
Backlog → Spec → Design → In Dev → In Review → In QA → Done
```

각 컬럼은 "Status" 필드의 옵션이 됩니다.

## 4. 자동 이동 규칙 (선택, 권장)

GitHub Projects는 라벨 → Status 자동 매핑을 지원합니다. Project 설정 → Workflows에서:

| 라벨 추가 시 | Status로 이동 |
|------------|--------------|
| `agent:solution-planner`, `agent:pm-agent` | Spec |
| `agent:ui-ux-designer`, `agent:brand-designer` | Design |
| `agent:dev` | In Dev |
| `agent:reviewer` | In Review |
| `agent:qa` | In QA |
| 이슈 close + PR merged | Done |
| (기본) | Backlog |

이 셋업은 GitHub UI에서만 가능 (gh CLI 미지원).

대안: 자동 이동 없이도 이슈 라벨로 충분히 정렬 가능 (Project view에서 라벨 그룹화).

## 5. 검증

```bash
# 라벨 확인
gh label list

# 이슈 템플릿 확인 (브라우저)
gh issue create  # 템플릿 선택 화면 나오면 OK

# 보드 접근
gh project view <number> --owner @me --web
```

테스트 이슈 생성:
```bash
gh issue create --title "Test ticket" --body "Setup verification" --label "agent:dev,type:feature,priority:P3"
```

→ 보드의 In Dev 컬럼에 등장 (자동 이동 셋업 시).

## 6. GitHub Actions: 라벨 → Status 자동 매핑

`./scripts/handoff.sh` 또는 PM Agent의 라벨 변경이 즉시 보드 컬럼 이동으로 반영되도록 GitHub Actions 워크플로우 추가됨 ([`.github/workflows/sync-label-to-project-status.yml`](workflows/sync-label-to-project-status.yml)).

### 매핑 규칙

| 라벨 / 상태 | Status 컬럼 |
|------------|------------|
| `agent:solution-planner`, `agent:pm-agent` | Spec |
| `agent:ui-ux-designer`, `agent:brand-designer` | Design |
| `agent:dev` | In Dev |
| `agent:reviewer`, `agent:security` | In Review |
| `agent:qa` | In QA |
| 이슈 close / PR merged | Done |
| (라벨 없음) | Backlog |

### 셋업: PAT(Personal Access Token) 등록

기본 `GITHUB_TOKEN`은 사용자 레벨 Project 접근 권한이 없어 PAT 필요:

#### 1. PAT 생성
[github.com/settings/tokens/new](https://github.com/settings/tokens/new)에서:
- **Note**: `Grabit project sync`
- **Expiration**: 1 year (또는 원하는 기간)
- **Scopes**:
  - [x] `repo` (Full control of private repositories)
  - [x] `project` (Full control of projects)
- "Generate token" → **즉시 복사** (다시 못 봄)

#### 2. 레포 secret 등록
```bash
gh secret set PROJECT_PAT --repo suholee9509-coder/Grabit
# 프롬프트에 PAT 붙여넣기 + Enter
```

또는 GitHub UI: 레포 Settings → Secrets and variables → Actions → New repository secret
- Name: `PROJECT_PAT`
- Value: (위에서 복사한 PAT)

#### 3. 검증
임의 이슈에 라벨 추가:
```bash
gh issue edit <number> --add-label "agent:dev"
```

→ Actions 탭에서 워크플로우 실행 확인 ([github.com/.../actions](https://github.com/suholee9509-coder/Grabit/actions))
→ 보드에서 그 이슈가 "In Dev" 컬럼에 등장 확인

## 7. 보드 북마크

브라우저 북마크에 추가 권장:
- `gh project view 1 --owner @me --web` 의 URL

칸반 보드를 항상 열어두고 작업.
