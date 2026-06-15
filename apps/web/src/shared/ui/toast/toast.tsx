import type { ReactNode } from 'react';
import styles from './toast.module.css';

/**
 * Toast — 일시 알림(저장 완료 등). surface-modal + shadow-modal 기반, variant=default/success/error.
 * Figma 전용 토스트 프레임 부재 → 디자인시스템 토큰 기반으로 확정(사용자 결정 2026-06-15).
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
