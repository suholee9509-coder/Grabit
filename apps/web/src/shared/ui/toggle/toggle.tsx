import styles from './toggle.module.css';

/**
 * Toggle — on/off 스위치 (★FD2 Figma 파랑 100% 채택).
 * 실측: 콘텐츠추가 2087:35027~35030 / 확장 2074:88468~88471 (6 인스턴스 전수 동일, 모두 ON).
 *   track 44×22 · ON #2563EB(Light-Primary) · knob 18×18 #FAFAFA + stroke 0.5px + 이중 그림자.
 *   OFF 트랙(#313131)·disabled(opacity 0.4)는 실화면 부재 [GAP] → 디자인시스템 토큰으로 일관 채움.
 */
export interface ToggleProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const classes = [styles.toggle, checked ? styles.checked : '', disabled ? styles.disabled : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={classes}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
