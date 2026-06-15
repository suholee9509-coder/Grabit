import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast } from '@/shared/ui';
import { OnboardingHeader } from '@/widgets/onboarding-header';
import { PromoPanel } from '@/widgets/onboarding-promo';
import { OnboardingStepper } from '@/widgets/onboarding-stepper';
import {
  OnboardingSteps,
  OnboardingHeading,
  useOnboardingFlow,
  STEP_CONFIG,
} from '@/features/onboarding-steps';
import { useCompleteOnboarding } from '@/entities/profile';
import styles from './onboarding-page.module.css';

/**
 * 온보딩 페이지 — 측정 4프레임 동일 그리드(2087:8476/8726/8968/9228).
 *   헤더(앱셸 외) · stepper(x=164 y=230) · 헤딩+본문(x=162 y=340/461) · 이전/다음·완료(x=162 y=850) ·
 *   프로모 패널(우). 선택값 누적·보존(useOnboardingFlow 단일 상태) · 뒤로가도 유지.
 *   "완료"(④) → complete_onboarding RPC → 홈(/) 리다이렉트(+홈에서 확장 모달 노출).
 *   차단(필수 미선택·관심 0/6+)·중복·실패 = 파운데이션 Toast.
 */
export function OnboardingPage() {
  const flow = useOnboardingFlow();
  const navigate = useNavigate();
  const complete = useCompleteOnboarding();
  const [toast, setToast] = useState<string | null>(null);
  const cfg = STEP_CONFIG[flow.step];

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout((notify as { _t?: number })._t);
    (notify as { _t?: number })._t = window.setTimeout(() => setToast(null), 2400);
  };

  const handleNext = () => {
    if (!flow.canAdvance) return; // 필수 미충족 = 차단(버튼 disabled가 1차 방어)
    if (flow.isLast) {
      complete.mutate(flow.input, {
        onSuccess: () => {
          // 완료=홈 진입(+홈에서 확장 설치 모달 자동 노출 — install 플래그).
          navigate('/?onboarded=1', { replace: true });
        },
        onError: (e) => {
          notify(
            e instanceof Error
              ? `저장에 실패했어요. 다시 시도해 주세요.`
              : '저장에 실패했어요. 다시 시도해 주세요.',
          );
        },
      });
      return;
    }
    flow.goNext();
  };

  const saving = complete.isPending;

  return (
    <div className={styles.page}>
      <OnboardingHeader />

      <div className={styles.stepperSlot}>
        <OnboardingStepper step={flow.step} />
      </div>

      <div className={styles.headingSlot}>
        <OnboardingHeading flow={flow} />
      </div>

      <div className={styles.bodySlot}>
        <OnboardingSteps flow={flow} onNotify={notify} />
      </div>

      <div className={styles.buttonRow}>
        <Button
          variant="secondary"
          compact
          disabled={flow.step === 1 || saving}
          onClick={flow.goPrev}
          data-testid="onboarding-prev"
        >
          이전
        </Button>
        <Button
          variant="primary"
          compact
          disabled={!flow.canAdvance || saving}
          onClick={handleNext}
          data-testid="onboarding-next"
        >
          {cfg.nextLabel}
        </Button>
      </div>

      <PromoPanel />

      {toast ? (
        <div className={styles.toastSlot}>
          <Toast variant="error">{toast}</Toast>
        </div>
      ) : null}
    </div>
  );
}
