import type { ReactNode } from 'react';
import styles from './modal.module.css';

/**
 * Modal — 오버레이 다이얼로그 (클립 추가·요금제·확장 설치 등).
 * Dimmed-200 백드롭 + surface 패널 + shadow-overlay + radius-xl.
 * phase ① 스켈레톤: 구조/토큰. 포커스 트랩·esc·포털은 phase ②(또는 후속 인프라).
 */
export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** 패널 최대 폭(px). 기본 480. */
  width?: number;
}

export function Modal({ open, onClose, title, children, footer, width = 480 }: ModalProps) {
  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <header className={styles.header}>
            {title ? <h2 className={styles.title}>{title}</h2> : <span />}
            {onClose ? (
              <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
                ✕
              </button>
            ) : null}
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  );
}
