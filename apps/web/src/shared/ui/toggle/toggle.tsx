import styles from './toggle.module.css';

/**
 * Toggle — on/off 스위치 (off=surface, on=brand-primary, knob=white).
 * Figma 전용 switch 프레임 부재 → 디자인시스템 토큰 기반으로 확정(사용자 결정 2026-06-15).
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
