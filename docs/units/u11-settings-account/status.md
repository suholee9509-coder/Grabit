# u11-settings-account — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: BE 검증 완료 (pgTAP pglite GREEN · 커밋❌ — PM 통합 대기)
- 검증 (2026-06-16, `node supabase/tests/_pgtap_pglite.mjs`):
  - pgTAP files 21 · asserts **172 ok / 0 not ok** · file-errors 0 · exit 0.
  - 0013이 0001~0012 순차 적용 후 pglite에서 깨끗이 적용 (MIGRATION FAILED 없음).
  - **무회귀(0 not-ok)**: derived-api-no-leak 7/7 · rls-isolation 6/6 · profile-rls 4/4 · search-rls-isolation 6/6 — sanitized view CREATE OR REPLACE(컬럼 시그니처 보존 + `p.deleted_at is null`만 ADD)로 깨지지 않음 확인.
  - **누출0(gate 2) soft-delete-excludes-public 8/8**: 유예중(deleted_at set) user의 공개클립/주석 5→4, 코호트 라벨 →0(임계 미달), 히트맵 density 4, sanitized 모델 내 user_id 노출 0건, restore 시 →5 복귀. cross-user reader(bob)로 읽어 cross-user 노출 0 단언 통과.
  - 신규 RPC: update_profile 13/13(profile-update) · notification-pref 9/9 · soft-delete 11/11 전부 GREEN.
  - 보류 항목 없음(view replace가 기존 pgTAP를 깨지 않아 deleted 필터 유지).
- 변경 파일 (boundary 준수 · additive only):
  - `supabase/migrations/0013_settings_account.sql` (신규) — deleted_at 컬럼 + update_profile/get_my_profile/soft_delete_account/restore_account + notification_settings 테이블/RLS/RPC + sanitized view 3종(content_clips_public·content_annotations_public·onboarding_cohorts_public) CREATE OR REPLACE(privacy-only filter add).
  - `supabase/tests/{profile-update,notification-pref,soft-delete,soft-delete-excludes-public}.sql` (신규 pgTAP).
  - 기존 0001~0012 마이그 · 기존 pgTAP 무변경(FROZEN 준수).
- 설계 노트:
  - 전 화면 [디자인 공백](전용 Figma 프레임 없음). 진입점 2종만 프레임 존재 = GNB 프로필 카드 `I2087:13351;1306:4235`(계정메뉴 진입) · 수신함 nav `I2087:13351;1613:10940`. 나머지는 u0 파운데이션 토큰·shared/ui로 1:1 구성.
  - u0b ADR-0002 #6(프로필 private/public 분리)·#9(soft-delete 30일 유예)·#3(sanitized public read) 계약 위 additive 배선.
  - 게이트 ⓐ 제외: AI·결제/구독/요금제/영수증/연간·대시보드 탭(FD1)·아티클 클리핑. 알림은 트렌드 등 비결제 카테고리 *설정 저장*만(발송 인프라 후속).
- 리스크: 디자인 공백 6건 결정 미확정(spec 하단 ESCALATION 후보) → 스폰 전 사용자/PM 게이트 권장.
- ESCALATION: spec.md §디자인 공백 & ESCALATION 후보 1~6 (계정메뉴 형태·설정 IA·수신함/알림 관계·soft-delete 컬럼·표시이름 수정·알림 카테고리).

STATUS = "BE 검증 GREEN: pgTAP pglite 172 ok / 0 not ok / 0 file-errors (exit 0) · 무회귀(derived-api-no-leak·rls-isolation·profile-rls·search-rls-isolation 전부) · 누출0(soft-delete-excludes-public 8/8: 유예중 user 공개집계/코호트/히트맵 노출0·cross-user 0) · additive 0013만(0001~0012·기존 pgTAP FROZEN 무변경) · 커밋❌ PM 통합 대기 · 보류 항목 없음"
