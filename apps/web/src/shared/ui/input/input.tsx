import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './input.module.css';

/**
 * Input — 실화면 측정 정밀(phase ②).
 * default(이메일 인풋): h42·bg #242424·radius 6·placeholder #999999(측정).
 * search 변형: 둥근 검색바 h48·radius 80·bg #1F1F1F(측정).
 * focus 스트로크는 실화면 부재 → Dark-Stroke-Typing 합리값(gap).
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** 둥근 검색바 변형(측정 2087:40407). */
  variant?: 'default' | 'search';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, variant = 'default', leadingIcon, trailingIcon, className, disabled, ...rest },
  ref,
) {
  const wrapperClasses = [
    styles.wrapper,
    variant === 'search' ? styles.search : '',
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
