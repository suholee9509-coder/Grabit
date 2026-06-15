import { Button } from '@/shared/ui';
import { useSocialLogin } from '../model/use-social-login';
import { GoogleIcon, KakaoIcon } from './provider-icons';
import { Spinner } from './spinner';
import styles from './social-login-buttons.module.css';

/**
 * 소셜 로그인 버튼 그룹 — 로그인 진입 2087:8221 좌측 컬럼(소셜 버튼 그룹 2087:8449).
 * column gap 12 · w 414(부모 fixed). 각 버튼 = u0c Button socialSolidDark fullWidth + leadingIcon.
 * ★E1 컷: Google + Kakao만(Naver/이메일/divider/계속 제외 — ADR-0001).
 * 측정: bg #242424 · radius 6 · pad 18/14 · h42 · 라벨 14/400/160% #FAFAFA.
 *
 * onError 콜백으로 상위(LoginPage)가 토스트 노출(에러는 파운데이션 Toast — E6).
 */
export interface SocialLoginButtonsProps {
  onError?: (message: string) => void;
}

export function SocialLoginButtons({ onError }: SocialLoginButtonsProps) {
  const { pending, error, signIn } = useSocialLogin();

  if (error && onError) onError(error);

  return (
    <div className={styles.group}>
      <Button
        variant="socialSolidDark"
        fullWidth
        leadingIcon={pending === 'google' ? <Spinner /> : <GoogleIcon />}
        disabled={pending != null}
        onClick={() => void signIn('google')}
        data-testid="social-google"
      >
        Google로 계속하기
      </Button>
      <Button
        variant="socialSolidDark"
        fullWidth
        leadingIcon={pending === 'kakao' ? <Spinner /> : <KakaoIcon />}
        disabled={pending != null}
        onClick={() => void signIn('kakao')}
        data-testid="social-kakao"
      >
        Kakao로 계속하기
      </Button>
    </div>
  );
}
