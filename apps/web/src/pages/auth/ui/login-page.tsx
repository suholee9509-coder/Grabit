import { useState } from 'react';
import { SocialLoginButtons } from '@/features/social-login';
import { Toast } from '@/shared/ui';
import { env } from '@/shared/config';
import { OnboardingHeader } from '@/widgets/onboarding-header';
import { PromoPanel } from '@/widgets/onboarding-promo';
import styles from './login-page.module.css';

/**
 * 로그인 진입 페이지 — 측정 2087:8221 ("온보딩_회원가입 01").
 * 프레임 1920×1080 · bg #121212. 좌 컬럼(x=276 y=251, w414, column gap24):
 *   로고 헤더(앱셸 외 온보딩 전용) · 헤딩 블록(제목 30/600 #FAFAFA + 부제 16/400 #B4B4B4) ·
 *   소셜 버튼 그룹(Google·Kakao, gap12) · 약관 문구(13/130% #B4B4B4).
 * ★E1 컷: Naver·이메일·"또는" divider·"계속" CTA 제외(ADR-0001).
 * 우: 프로모 패널(스코프 외 정적 일러스트).
 * 에러(OAuth 실패/취소) = 파운데이션 Toast(E6).
 */
export function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <OnboardingHeader />

      <main className={styles.leftColumn}>
        <div className={styles.headingBlock}>
          <h1 className={styles.heading}>Grab your growth, Together</h1>
          <p className={styles.subheading}>당신의 성장 여정을 함께 합니다.</p>
        </div>

        <SocialLoginButtons onError={setErrorMsg} />

        <p className={styles.terms}>
          계속하면{' '}
          <a className={styles.link} href={env.termsUrl}>
            이용약관
          </a>{' '}
          및{' '}
          <a className={styles.link} href={env.privacyUrl}>
            개인정보처리방침
          </a>
          을<br />
          이해하고 동의하는 것으로 간주됩니다.
        </p>
      </main>

      <PromoPanel />

      {errorMsg ? (
        <div className={styles.toastSlot}>
          <Toast variant="error" action={<button className={styles.toastClose} onClick={() => setErrorMsg(null)}>닫기</button>}>
            {errorMsg}
          </Toast>
        </div>
      ) : null}
    </div>
  );
}
