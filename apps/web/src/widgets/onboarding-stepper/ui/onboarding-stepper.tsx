import { Stepper } from '@/shared/ui';

/**
 * 온보딩 진행 스텝퍼 (widget) — u0c Stepper 래핑(boundaries: 래핑만).
 * 측정 2087:8488: 4세그먼트(40×4 each, gap 4, radius 100), active #66FF4B / inactive #434343.
 * step(1~4) = active 세그먼트 개수. 위치(x=164 y=230)는 페이지 레이아웃이 잡는다.
 */
export interface OnboardingStepperProps {
  /** 현재 단계(1~4). 1=직업·2=연차·3=관심분야·4=목표. */
  step: number;
  /** 전체 단계 수(기본 4). */
  total?: number;
}

export function OnboardingStepper({ step, total = 4 }: OnboardingStepperProps) {
  return <Stepper total={total} current={step} aria-label={`온보딩 ${step}/${total} 단계`} />;
}
