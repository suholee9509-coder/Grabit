import type { ReactNode } from 'react';
import styles from './toast.module.css';

/**
 * Toast — 일시 알림(저장 완료 등).
 * ⚠ Figma 프레임에 전용 토스트 디자인이 명시되지 않음(디자인 공백 레지스터 §1·콘텐츠추가 토스트).
 *    → 토큰 기반 스켈레톤. 색/치수/모션은 phase ② 사용자 확인 필요.
 */
export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastProps {
  variant?: ToastVariant;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}

export function Toast({ variant = 'default', icon, children, action }: ToastProps) {
  const classes = [styles.toast, styles[variant]].filter(Boolean).join(' ');
  return (
    <div className={classes} role="status">
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.message}>{children}</span>
      {action ? <span className={styles.action}>{action}</span> : null}
    </div>
  );
}
