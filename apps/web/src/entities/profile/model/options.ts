/**
 * 온보딩 선택지 카탈로그 — Figma 라벨 = SoT(E3 확정: Figma 목표 라벨을 단일·필수 '상황/목표'로 채택).
 * 값 enum = Figma 라벨 그대로(BE `complete_onboarding`은 text 저장 + `_sanitize_label`로 무해화).
 * 측정 출처: 직업 2087:8476 / 연차 2087:8726 / 관심 2087:8968 / 목표 2087:9228.
 */

/** ① 직업 (단일·필수) — 2087:8476 칩 10개(Figma 실측 = 10, spec 11은 G2로 정정). */
export const JOB_OPTIONS = [
  '기획 · PM',
  '디자이너',
  '개발자',
  '마케터',
  'HR · 인사',
  '데이터 분석가',
  '영업 · 세일즈',
  '취준생 · 학생',
  '창업가',
  '기타',
] as const;

/** ② 연차 (단일·필수) — 2087:8726 칩 6개. */
export const YEARS_OPTIONS = [
  '취준생 · 학생',
  '0~1년차',
  '2~3년차',
  '4~6년차',
  '7~9년차',
  '10년차 이상',
] as const;

/** ③ 관심분야 (복수 1~5 + 직접입력) — 2087:8968 칩 12개. */
export const INTEREST_OPTIONS = [
  '면접 · 자소서',
  '포트폴리오',
  '프로덕트 · 서비스 기획',
  '디자인',
  '프로그래밍',
  '커리어',
  '리더십',
  '협업 · 커뮤니케이션',
  '마케팅 · 그로스',
  '업무 생산성',
  '마인드셋',
  '창업 · 스타트업',
] as const;

/** ④ 목표 ≈ 현재 상황 (단일·필수) — 2087:9228 칩 5개. */
export const GOAL_OPTIONS = [
  '취업 · 이직',
  '역량 강화 · 스킬업',
  '승진 · 직급 상승',
  '직무 · 업종 전환',
  '업무 외 자기계발',
] as const;

/** 관심분야 선택 경계(S-DOPTGC · BE complete_onboarding) — 최소 1, 최대 5. */
export const INTERESTS_MIN = 1;
export const INTERESTS_MAX = 5;

export type JobOption = (typeof JOB_OPTIONS)[number];
export type YearsOption = (typeof YEARS_OPTIONS)[number];
export type InterestOption = (typeof INTEREST_OPTIONS)[number];
export type GoalOption = (typeof GOAL_OPTIONS)[number];

/**
 * 알림 카테고리 카탈로그 (u11 설정 '알림' 섹션 — L1-e) — 비결제만(게이트 ⓐ).
 * 0013 notification_settings CHECK가 billing/subscription/subscription_expiry/receipt/payment 거부 →
 * 여기엔 결제 계열 0건(트렌드·추천·활동 등 비결제 카테고리만). category 키 = BE 저장 값(영문 키).
 * label = 설정 화면 표기. enabledByDefault = prefs 0건일 때 기본 표기(0013 default true 정합).
 */
export interface NotificationCategoryOption {
  /** BE 저장 키(0013 set_notification_pref p_category) — 비결제만. */
  category: string;
  /** 설정 화면 라벨. */
  label: string;
  /** 보조 설명(설정 행 서브텍스트). */
  description: string;
  /** prefs 미설정 시 기본값(0013 컬럼 default true 정합). */
  enabledByDefault: boolean;
}

export const NOTIFICATION_CATEGORIES: readonly NotificationCategoryOption[] = [
  {
    category: 'trend',
    label: '트렌드 알림',
    description: '내 직군·관심분야에서 주목받는 컨텐츠를 알려드려요.',
    enabledByDefault: true,
  },
  {
    category: 'recommendation',
    label: '추천 컨텐츠',
    description: '나와 비슷한 사람들이 많이 본 컨텐츠를 추천해 드려요.',
    enabledByDefault: true,
  },
  {
    category: 'activity',
    label: '활동 알림',
    description: '내 클립·메모에 달린 반응을 알려드려요.',
    enabledByDefault: false,
  },
] as const;
