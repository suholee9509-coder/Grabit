# GitHub 셋업 (1회)

라벨 + Project 보드 + 라벨→Status 자동 동기화 배선.

## 1. 라벨 생성
```bash
./scripts/setup-labels.sh
```
5-에이전트 라벨셋(`agent:pm/frontend/backend/qa/security` + `type:*` + `priority:*`).

## 2. Project 보드 (#2) Status 컬럼 정렬
Grabit 보드는 **#2** (owner `suholee9509-coder`). 5-에이전트 시스템에 맞게 **Status** 필드 옵션(컬럼)을 정렬:
`Backlog · Planning · In Build · In QA · In Security · Done`
```bash
gh project list --owner suholee9509-coder        # 보드 번호(#2) 확인
gh project view 2 --owner suholee9509-coder --web # 브라우저에서 Status 옵션 편집
```
> 이전 8-에이전트 컬럼(Spec/Design/In Dev/In Review 등)이 남아 있으면 위 6개로 교체.
(매핑: `agent:pm→Planning` · `frontend|backend→In Build` · `qa→In QA` · `security→In Security` · closed/merged→Done)

## 3. 워크플로우 보드 번호 확인
`.github/workflows/sync-label-to-project-status.yml`의 `PROJECT_NUMBER`는 **2**, `PROJECT_OWNER`는 **suholee9509-coder**로 설정돼 있다. 보드 번호가 다르면 교체.

## 4. PROJECT_PAT 시크릿
project + repo scope **Personal Access Token** 발급 → 레포 시크릿 등록:
```bash
gh secret set PROJECT_PAT --body "<PAT>"
```
(classic PAT면 `repo` + `project` scope. fine-grained면 Projects: Read/Write + Issues/PRs: Read.)

## 5. 검증
테스트 이슈 생성 → `agent:frontend` 라벨 추가 → Actions 로그에서 `→ Status: In Build` 확인 → 보드에서 카드 이동 확인 → 이슈 close → Done.

> 보드는 **Feature 작업단위**만 올라간다(~5–10/스프린트). 세부는 이슈 내 체크리스트.
