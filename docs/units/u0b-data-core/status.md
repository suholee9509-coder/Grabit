# u0b-data-core — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: 계획(미스폰)
- 검증: (없음 — 미착수)
- 변경 파일: (없음)
- 설계 노트: ADR-0002를 이 단위가 락. 헤드리스 /goal(opus4.8·max). 고위험(RLS) → 첫 ~5턴 관찰.
- 리스크: cross-user 소셜애노테이션 vs RLS 격리 — sanitized view/RPC로 해소(누출 0 pgTAP 증명).
- ESCALATION: (없음)

STATUS = "계획 — 스캐폴딩(supabase init) 후 헤드리스 스폰 대기(트레이닝휠 승인)"
