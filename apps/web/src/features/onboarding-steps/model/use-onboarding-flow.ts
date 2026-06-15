import { useCallback, useEffect, useRef, useState } from 'react';
import {
  emptyOnboardingInput,
  INTERESTS_MAX,
  INTERESTS_MIN,
  type OnboardingInput,
} from '@/entities/profile';

/** 온보딩 단계 인덱스(1~4). */
export type StepIndex = 1 | 2 | 3 | 4;
export const TOTAL_STEPS = 4 as const;

export interface OnboardingFlow {
  step: StepIndex;
  input: OnboardingInput;
  /** 현재 단계의 '다음/완료' 활성 여부(필수 충족). */
  canAdvance: boolean;
  /** 마지막 단계인가(완료 버튼). */
  isLast: boolean;
  /** ① 직업 단일선택(같은 값 재클릭=유지, 다른 값=교체). */
  selectJob: (v: string) => void;
  /** ② 연차 단일선택. */
  selectYears: (v: string) => void;
  /** ④ 목표 단일선택. */
  selectGoal: (v: string) => void;
  /**
   * ③ 관심분야 토글. 반환:
   *   'added' | 'removed' | 'max'(5개 초과 차단 — 토스트) | 'noop'.
   */
  toggleInterest: (v: string) => 'added' | 'removed' | 'max' | 'noop';
  /** ③ 직접입력 관심사 추가. 반환: 'added' | 'max' | 'duplicate' | 'empty'. */
  addCustomInterest: (raw: string) => 'added' | 'max' | 'duplicate' | 'empty';
  /** 관심사 제거(칩/태그 x). */
  removeInterest: (v: string) => void;
  /** 다음 단계로(마지막이면 no-op — 완료는 페이지가 호출). */
  goNext: () => void;
  /** 이전 단계로(첫 단계면 no-op). */
  goPrev: () => void;
}

/** 현재 단계의 '다음' 가능 여부 판정(필수 단일/관심 1~5). */
function computeCanAdvance(step: StepIndex, input: OnboardingInput): boolean {
  switch (step) {
    case 1:
      return input.job != null;
    case 2:
      return input.years != null;
    case 3:
      return input.interests.length >= INTERESTS_MIN && input.interests.length <= INTERESTS_MAX;
    case 4:
      return input.goal != null;
    default:
      return false;
  }
}

/**
 * 온보딩 4단계 상태 머신 — 선택값 누적·뒤로가도 보존(단일 상태 객체).
 * 단일선택(직업·연차·목표)·복수선택(관심 1~5+직접입력)·5개 초과 차단(반환값으로 토스트)·
 * 직접입력 빈/중복 무시. 검증은 BE(complete_onboarding)가 재수행(이중 방어).
 */
export function useOnboardingFlow(initial?: Partial<OnboardingInput>): OnboardingFlow {
  const [step, setStep] = useState<StepIndex>(1);
  const [input, setInput] = useState<OnboardingInput>({
    ...emptyOnboardingInput,
    ...initial,
  });

  const selectSingle = useCallback(
    (key: 'job' | 'years' | 'goal', v: string) => {
      setInput((prev) => ({ ...prev, [key]: v }));
    },
    [],
  );

  const selectJob = useCallback((v: string) => selectSingle('job', v), [selectSingle]);
  const selectYears = useCallback((v: string) => selectSingle('years', v), [selectSingle]);
  const selectGoal = useCallback((v: string) => selectSingle('goal', v), [selectSingle]);

  // 동기 판정용 latest-interests ref. ★렌더 중 변경 금지(react-hooks/refs) →
  // 항상 setInput 업데이터 내부(커밋 단계)에서만 갱신 → 같은 tick 연속 호출에도 최신 보장.
  const interestsRef = useRef(input.interests);
  useEffect(() => {
    // 외부에서 initial 변경 등으로 state↔ref 불일치 시 동기화(effect=커밋 후, 렌더 중 ❌).
    interestsRef.current = input.interests;
  }, [input.interests]);

  const toggleInterest = useCallback(
    (v: string): 'added' | 'removed' | 'max' | 'noop' => {
      const current = interestsRef.current;
      if (current.includes(v)) {
        const nextList = current.filter((i) => i !== v);
        interestsRef.current = nextList;
        setInput((prev) => ({ ...prev, interests: nextList }));
        return 'removed';
      }
      if (current.length >= INTERESTS_MAX) {
        return 'max'; // 6번째 차단(E2 — 토스트). state 미변경.
      }
      const nextList = [...current, v];
      interestsRef.current = nextList;
      setInput((prev) => ({ ...prev, interests: nextList }));
      return 'added';
    },
    [],
  );

  const addCustomInterest = useCallback(
    (raw: string): 'added' | 'max' | 'duplicate' | 'empty' => {
      const v = raw.trim();
      if (!v) return 'empty';
      const current = interestsRef.current;
      if (current.includes(v)) return 'duplicate';
      if (current.length >= INTERESTS_MAX) return 'max';
      const nextList = [...current, v];
      interestsRef.current = nextList;
      setInput((prev) => ({ ...prev, interests: nextList }));
      return 'added';
    },
    [],
  );

  const removeInterest = useCallback((v: string) => {
    const nextList = interestsRef.current.filter((i) => i !== v);
    interestsRef.current = nextList;
    setInput((prev) => ({ ...prev, interests: nextList }));
  }, []);

  const goNext = useCallback(() => {
    setStep((s) => (s < TOTAL_STEPS ? ((s + 1) as StepIndex) : s));
  }, []);

  const goPrev = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as StepIndex) : s));
  }, []);

  return {
    step,
    input,
    canAdvance: computeCanAdvance(step, input),
    isLast: step === TOTAL_STEPS,
    selectJob,
    selectYears,
    selectGoal,
    toggleInterest,
    addCustomInterest,
    removeInterest,
    goNext,
    goPrev,
  };
}
