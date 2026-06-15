# Skill: prd-clarifier (PM)

검증된 스펙에 **UX Spec** 섹션을 더해, 작업단위로 분해 가능한 정밀 PRD로 만든다. (PM이 스펙 검증 단계에서 사용 — 옛 Solution Planner 자산을 PM이 흡수)

## 선행
- `/office-hours` + `/plan-ceo-review`로 스코프 확정된 스펙 (Command Center §2 초안).

## 추가할 섹션 (Command Center §2에 반영)
```markdown
## UX Spec
### Main Flows
- <플로우 1: 진입 → 행동 → 결과>
### Screens
- <화면명>: 목적 · 핵심 컴포넌트 · 빈/로딩/에러 상태
### Data Model
- <엔티티>: 필드 · 관계 (DB 테이블 매핑 — Sprint 0 ADR 스택 기준)
### States & Edge Cases
- 빈/로딩/에러/오프라인 각 화면
### Accessibility
- 키보드·대비·스크린리더 핵심
```

## 원칙
- 각 화면의 **빈/로딩/에러 상태를 여기서 명시** → 나중에 "발견"되어 followup 티켓이 되는 걸 차단 (안티-증식과 직결).
- 이 UX Spec이 sprint-kickoff의 단위 분해 + 성공조건 `[state]` 기준의 입력이 된다.

## 체크
- [ ] Main Flows · Screens · Data Model · States · A11y 모두 작성
- [ ] 각 화면 상태가 열거됨 (빈/로딩/에러) · Command Center §2 갱신
