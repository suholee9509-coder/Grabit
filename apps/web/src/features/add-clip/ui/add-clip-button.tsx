import styles from './add-clip-button.module.css';

/**
 * 클립 추가 버튼 — 측정 2087:12538 §5(라이트 솔리드 #EFEFEF, h34, chromecast 20).
 * ★ 웹 클립 추가 모달은 u3 소관 → u4는 버튼 + 진입 트리거/로그인 유도만.
 *   미인증 → onRequireLogin, 인증 → onAddClip(상위가 u3 플로우 오픈).
 */
export interface AddClipButtonProps {
  authenticated?: boolean;
  onAddClip?: () => void;
  onRequireLogin?: () => void;
}

function CastIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.2h15v11.6h-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 12.5a3.3 3.3 0 0 1 3.3 3.3M2.5 9.2a6.6 6.6 0 0 1 6.6 6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="16.3" r="1" fill="currentColor" />
    </svg>
  );
}

export function AddClipButton({
  authenticated = false,
  onAddClip,
  onRequireLogin,
}: AddClipButtonProps) {
  function handleClick() {
    if (!authenticated) {
      onRequireLogin?.();
      return;
    }
    onAddClip?.();
  }
  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      <span className={styles.icon}>
        <CastIcon />
      </span>
      클립 추가
    </button>
  );
}
