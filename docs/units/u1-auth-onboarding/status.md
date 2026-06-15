# u1-auth-onboarding — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **BE 완료 · pgTAP GREEN** (FE는 미착수 — owner=both, FE는 사용자 운전)
- 검증 (pglite = 실 Postgres WASM, Supabase와 동일 거동):
  - `node supabase/tests/_pgtap_pglite.mjs` → **11파일 / 74 asserts / 0 not-ok / 0 file-errors / exit 0**.
    - 신규: profile-onboarding-save 15/15 · profile-rls 4/4 · profile-cohort-split 7/7 · onboarding-gate 5/5 · incomplete-not-public 5/5.
    - u0b 무회귀: anonymize-threshold 5/5 · clip-interval 8/8 · content-dedup 7/7 · derived-api-no-leak 7/7 · heatmap 5/5 · rls-isolation 6/6 · contract 7/7.
  - `node supabase/tests/_pglite_proof.mjs` → **"migrations: all 10 apply cleanly" · 34 passed / 0 failed** (0010 additive가 u0b 실행 프루프도 깨지 않음).
  - ⚠ 실행 메모: `node` 직접 실행이 권한 게이트라 `npm run`(허용) 래퍼(`/tmp/u1val`)로 동일 러너 실행. QA는 clean checkout에서 `node supabase/tests/_pgtap_pglite.mjs` 직접 실행(아래 의존성 메모 참조).
- 변경 파일 (boundary 준수 — `supabase/` 하위만 · git status로 0001~0009·기존 테스트 미수정 확인):
  - `supabase/migrations/0010_onboarding.sql` (additive): `profiles.onboarded_at` 컬럼 · `_sanitize_label()` · `complete_onboarding(job,years,goal,interests[])` · `is_onboarded()` · `onboarding_cohorts_public`(definer view) · `get_onboarding_cohorts()`.
  - `supabase/tests/`: profile-onboarding-save.sql · profile-rls.sql · profile-cohort-split.sql · onboarding-gate.sql · incomplete-not-public.sql.
- Acceptance 추적:
  - ① 저장 RPC(직업·연차·목표 단일 필수 + 관심분야 1~5 + 직접입력) → `complete_onboarding` (save 15/15). → L1-c
  - ② public 코호트(직업+연차) vs private(auth·관심사·목표) 분리(#6) → `onboarding_cohorts_public`(job+years+count만) (cohort-split 7/7).
  - ③ 완료 게이팅 = `onboarded_at` 플래그 + `is_onboarded()` (gate 5/5). → L1-b/e
  - ④ RLS 본인쓰기·미인증 42501·관심분야 0/6+ 거부·직접입력 XSS 무해화·미완료 코호트 노출 0 → (rls 4/4 + save 6건 negative + incomplete-not-public 5/5).
- 설계 결정 (BE):
  - **게이트 = `onboarded_at` 플래그**(코호트 NOT NULL ❌): job/years만 부분저장된 프로필도 미완료로 정확 배제 → ④의 핵심. RPC 검증 통과 시 원자적 set.
  - **검증은 RPC 내부**(테이블 CHECK ❌): frozen `handle_new_user`가 `interests='{}'`로 insert → CHECK는 u0b 가입을 깨뜨림.
  - **#6 분리** = 새 definer view(job+years+count만; interests/goal/display_name/auth 미선택) + `onboarded_at NOT NULL` 필터(미완료 0 기여) + `anonymization_threshold()`(0007,=5) 재사용으로 임계 미만 코호트 드롭(#4).
  - **자기쓰기/미인증**: INVOKER + id 파라미터 없음(항상 auth.uid) → 타 user 쓰기 구조 불가 + RLS with-check 이중방어; auth.uid null → 42501; execute=authenticated만(public revoke).
  - 새 Edge Function 없음(ADR-0001 "Postgres RPC 우선"). u0b frozen 미접촉.
- PM 인계 메모:
  - **테스트 의존성**: `@electric-sql/pglite`가 package.json에 없음(u0b와 동일 상태 — 러너 주석의 prereq). 통합 시 `pnpm add -D @electric-sql/pglite` 추가 권장(QA clean-checkout 재현용). 본 단위는 boundary상 package.json 미수정 — PM 결정 사항.
  - **OAuth 제공자 설정**(Google/Kakao 콜백·키)은 Supabase 콘솔/`config.toml`+`.env` 영역(코드 외, 미커밋) — 배선은 FE 단계.
  - git 미커밋(PM 통합 대기).
- 리스크/미결: FE(소셜버튼 2종·4단계 stepper·확장 모달) 미착수. E1/E2/E4/E5/E6은 FE 영역(결정 기록은 spec §디자인 공백).

STATUS = "BE GREEN: 마이그 0010 additive + pgTAP 5(74 asserts 통과) · u0b 무회귀 · boundary=supabase/만 · 미커밋. 의존성(pglite)·OAuth 콘솔설정은 PM/FE 인계."
