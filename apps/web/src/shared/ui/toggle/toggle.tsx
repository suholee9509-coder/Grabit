import styles from './toggle.module.css';

/**
 * Toggle — on/off 스위치 (설정·알림 화면 = u11 공백-fill 의존).
 * ⚠ Figma 컴포넌트 SECTION에 전용 switch 변형이 명시적으로 잡히지 않음(Selected=true/false만 존재).
 *    → 토큰 기반 스켈레톤. 정확 트랙/노브 치수는 phase ② 사용자 확인 필요(inventory 공백).
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
