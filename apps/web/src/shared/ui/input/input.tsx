import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './input.module.css';

/**
 * Input — Figma 2562:7927 (State=Default/Typing/Focused/Entered, Disabled=true/false).
 * Default→Focused(포커스 스트로크 Dark-Stroke-Typing #1f6feb)→Entered(값 있음).
 * Typing/Focused/Entered는 :focus/값 유무로 자연 표현. invalid는 시스템 레드.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, leadingIcon, trailingIcon, className, disabled, ...rest },
  ref,
) {
  const wrapperClasses = [
    styles.wrapper,
    invalid ? styles.invalid : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      <input ref={ref} className={styles.input} disabled={disabled} {...rest} />
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </div>
  );
});
