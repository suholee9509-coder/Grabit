import { Chip } from '@/shared/ui';
import { INTERESTS_MAX } from '@/entities/profile';
import { STEP_CONFIG } from '../model/step-config';
import type { OnboardingFlow } from '../model/use-onboarding-flow';
import { ChipGrid } from './chip-grid';
import { StepHeading } from './step-heading';
import { InterestCustomInput } from './interest-custom-input';
import styles from './onboarding-steps.module.css';

/**
 * 온보딩 단계 헤딩 — 현재 단계 제목/부제(측정 y=340). 페이지가 본문(y=461)과 별도 배치.
 */
export function OnboardingHeading({ flow }: { flow: OnboardingFlow }) {
  const cfg = STEP_CONFIG[flow.step];
  return <StepHeading title={cfg.title} subtitle={cfg.subtitle} />;
}

/**
 * 온보딩 단계 본문 — 현재 단계의 칩 그리드(+ ③ 직접입력 + 선택 태그). 측정 y=461.
 * 단일선택(①②④) / 복수선택(③ 1~5 + 직접입력). 5개 초과·중복·빈 입력은 onNotify로 토스트.
 * 측정: 직업 2087:8476 / 연차 2087:8726 / 관심 2087:8968 / 목표 2087:9228.
 */
export interface OnboardingStepsProps {
  flow: OnboardingFlow;
  /** 차단/안내 토스트 트리거(파운데이션 Toast — E2/E6). */
  onNotify?: (message: string) => void;
}

export function OnboardingSteps({ flow, onNotify }: OnboardingStepsProps) {
  const cfg = STEP_CONFIG[flow.step];
  const { input, step } = flow;

  const handleInterestResult = (
    result: 'added' | 'removed' | 'max' | 'duplicate' | 'empty' | 'noop',
  ) => {
    if (result === 'max') onNotify?.(`관심 분야는 최대 ${INTERESTS_MAX}개까지 선택할 수 있어요.`);
    else if (result === 'duplicate') onNotify?.('이미 추가한 관심 분야예요.');
  };

  return (
    <div className={styles.step}>
      {step === 1 && (
        <ChipGrid
          options={cfg.options}
          width={cfg.gridWidth}
          isSelected={(v) => input.job === v}
          onSelect={flow.selectJob}
        />
      )}

      {step === 2 && (
        <ChipGrid
          options={cfg.options}
          width={cfg.gridWidth}
          isSelected={(v) => input.years === v}
          onSelect={flow.selectYears}
        />
      )}

      {step === 3 && (
        <div className={styles.interests}>
          <ChipGrid
            options={cfg.options}
            width={cfg.gridWidth}
            isSelected={(v) => input.interests.includes(v)}
            isDisabled={() => input.interests.length >= INTERESTS_MAX}
            onSelect={(v) => handleInterestResult(flow.toggleInterest(v))}
          />
          {/* 직접입력으로 추가된(옵션에 없는) 관심사 = removable 태그칩으로 노출. */}
          {input.interests.some((i) => !cfg.options.includes(i)) && (
            <div className={styles.customTags}>
              {input.interests
                .filter((i) => !cfg.options.includes(i))
                .map((i) => (
                  <Chip
                    key={i}
                    variant="tag"
                    removable
                    onRemove={() => flow.removeInterest(i)}
                    data-testid={`custom-tag-${i}`}
                  >
                    {i}
                  </Chip>
                ))}
            </div>
          )}
          <InterestCustomInput
            onAdd={flow.addCustomInterest}
            onResult={handleInterestResult}
          />
        </div>
      )}

      {step === 4 && (
        <ChipGrid
          options={cfg.options}
          width={cfg.gridWidth}
          isSelected={(v) => input.goal === v}
          onSelect={flow.selectGoal}
        />
      )}
    </div>
  );
}
