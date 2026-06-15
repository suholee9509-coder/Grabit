import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './button.module.css';

/**
 * Button — 실화면 측정 정밀(phase ② → phase ③ u0c fidelity).
 * Primary = 네온 brand #66FF4B + 다크 글자(측정) · Secondary = 투명+rgba(white,.12) 보더+밝은 글자.
 * size medium=42px / small=38px / md=34px(★정준 1차 액션 — GNB CTA·검색·상세 액션, 측정).
 * shape pill=요금제 CTA(radius 100). compact=108px 페어(이전/다음) · compactMd=128px 페어(요금제 모달).
 *
 * phase ③ 보강(additive, 측정 SoT 표기):
 *  - size 'md' = 34px(radius 8·pad 6/16·gap 4·lh 160%, I2087:70381;1613:11280 Button/Box 컴포넌트본).
 *  - variant 'lightSolid' = #EFEFEF bg + #171717 글자(상세 '클립 추가' 2087:12643).
 *  - variant 'socialSolidDark' = #242424 bg + #FAFAFA Regular 글자(소셜 'Google로 계속하기' 2087:8450).
 *  - variant 'solidGray' = #333333 bg + #FAFAFA 글자(댓글 '작성' 2117:22120, radius 7).
 *  - neonLabel prop = primary 네온 위 순흑 글자 #000000(컴포넌트본 GNB CTA·검색하기 — fill #000000).
 *  - compactMd prop = 128px 고정 폭(요금제 lg 페어 2087:10972/10973).
 * Tertiary·disabled·hover는 실화면 부재 → 합리값(gap: status.md).
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'lightSolid'
  | 'socialSolidDark'
  | 'solidGray';
export type ButtonSize = 'small' | 'medium' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Resizing=Fill (full width) vs Hug (content). */
  fullWidth?: boolean;
  /** 이전/다음 페어 등 고정 108px 폭(측정). */
  compact?: boolean;
  /** 요금제 모달 lg 페어 등 고정 128px 폭(측정: 2087:10972/10973). */
  compactMd?: boolean;
  /** 요금제 CTA 등 pill 형태(radius 100, 측정). */
  pill?: boolean;
  /**
   * primary 네온 위 라벨을 순흑 #000000으로(측정: Button/Box 컴포넌트본 GNB CTA·검색하기).
   * 미지정 시 primary 기본 라벨색(#242424) 유지.
   */
  neonLabel?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  compact = false,
  compactMd = false,
  pill = false,
  neonLabel = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    compact ? styles.compact : '',
    compactMd ? styles.compactMd : '',
    pill ? styles.pill : '',
    neonLabel ? styles.neonLabel : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </button>
  );
}
