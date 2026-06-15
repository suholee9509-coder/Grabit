import type { ReactNode } from 'react';
import styles from './modal.module.css';

/**
 * Modal — 오버레이 다이얼로그 (측정: 요금제 998×731 lg · 링크/검색 582×364 sm).
 * 측정 정밀: bg #1F1F1F · radius 12 · backdrop rgba(0,0,0,0.6) · shadow '모달'(3레이어) · inset 28.
 * 포커스 트랩·esc·포털은 후속 인프라.
 */
export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** 패널 최대 폭(px). 측정: sm=582 / lg=998. 기본 582(작은 모달). */
  width?: number;
}

export function Modal({ open, onClose, title, children, footer, width = 582 }: ModalProps) {
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
