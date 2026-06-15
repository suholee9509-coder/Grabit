# Workflows — Feature 작업단위 라이프사이클

> dev→reviewer→qa 다단계 티켓 라이프사이클은 폐기. **Feature 작업단위**가 단일 추적 항목이며, 셀프리뷰로 reviewer 단계를 흡수했다.

## §1 작업단위 라이프사이클
```
계획(PM) ─★ⓑ─► 디스패치(headless /goal) ─► goal-loop(자율) ─► /ship PR
   ─► 통합(sprint/<n>-integration) ─► 기능 QA ─► (FAIL→같은소유자 continuation)
   ─► 스프린트말 Security ─★ⓓ─► main ─► retro
```
GitHub 보드 Status 매핑(라벨 주도): `agent:pm→Planning` · `agent:frontend|backend→In Build` · `agent:qa→In QA` · `agent:security→In Security` · closed/merged→Done · 그 외→Backlog.

## §2 머지 래더
1. 각 단위 dev가 `feat/<slug>`에서 작업 → `/ship` PR
2. 기능 QA를 그 단위에 실행 → FAIL은 같은 소유자 continuation (새 티켓 ❌)
3. PM이 QA-PASS 단위를 `sprint/<n>-integration`에 머지
4. 스프린트말 Security가 `sprint/<n>-integration` 전수 감사
5. **★ 게이트 ⓓ**: 사용자 승인 → `sprint/<n>-integration` → `main`. **자동 배포 없음.**

## §3 WIP 상한 + 트립와이어
- 동시 진행 단위 수 상한 (Command Center §7에 기록). 초과분은 대기.
- **트립와이어**: 작업 중 단위가 하위단위를 낳아야 할 것 같으면 → *작업 중 분할 금지*, 계획 실패로 표면화 → 사용자와 재검토.

## §4 스프린트 구조
- `Sprint N` = GitHub Milestone. 작업단위 이슈를 마일스톤에 매핑.
- Sprint 0 = 아키텍처 결정(ADR) + 앱 스캐폴딩 (코드 기능 단위 없음).
- Sprint 1 = 모드 2(기능 배정마다 사용자 승인, 트레이닝휠). 이후 모드 1.

## §5 브랜치 규칙
- `feat/<unit-slug>` (dev worktree) · `sprint/<n>-integration` (통합) · `main` (보호, 사용자 승인 머지만).
- 직접 main 푸시 ❌. force-push ❌.
