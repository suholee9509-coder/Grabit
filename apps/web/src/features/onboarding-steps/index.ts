/** features/onboarding-steps 배럴 — 4단계 stepper 플로우(상태 머신 + 헤딩/본문)(공개 API). */
export { OnboardingSteps, OnboardingHeading } from './ui/onboarding-steps';
export type { OnboardingStepsProps } from './ui/onboarding-steps';
export {
  useOnboardingFlow,
  TOTAL_STEPS,
} from './model/use-onboarding-flow';
export type { OnboardingFlow, StepIndex } from './model/use-onboarding-flow';
export { STEP_CONFIG } from './model/step-config';
export type { StepConfig } from './model/step-config';
